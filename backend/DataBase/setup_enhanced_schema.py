#!/usr/bin/env python3
"""
Create enhanced database schema and ensure all foreign keys point to enhanced tables
"""

from sqlalchemy import create_engine, text
from enhanced_models import Base, User, Officer, Petition, Department, Category
import psycopg2

DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"

def setup_enhanced_schema():
    """Setup enhanced database schema"""
    
    try:
        engine = create_engine(DATABASE_URL)
        
        print("🚀 Setting up enhanced database schema...")
        
        # Create all enhanced tables
        Base.metadata.create_all(bind=engine)
        print("✅ Enhanced tables created/verified")
        
        with engine.connect() as conn:
            # Migrate any missing users from userdb to users
            print("📦 Migrating users from userdb to users table...")
            
            try:
                result = conn.execute(text("""
                    INSERT INTO users (user_id, first_name, last_name, phone_number, email, password, otp_verified, state, district, taluk, id_type, id_number, id_proof_url, created_at)
                    SELECT user_id, first_name, last_name, phone_number, email, password, otp_verified, state, district, taluk, id_type, id_number, id_proof_url, created_at
                    FROM userdb
                    WHERE user_id NOT IN (SELECT user_id FROM users)
                    ON CONFLICT (user_id) DO NOTHING;
                """))
                
                # Update sequence
                conn.execute(text("SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));"))
                
                conn.commit()
                print("✅ User migration completed")
                
            except Exception as e:
                print(f"⚠️  User migration info: {e}")
            
            # Ensure sample departments exist
            print("📋 Setting up sample departments and categories...")
            
            try:
                # Insert sample departments
                conn.execute(text("""
                    INSERT INTO departments (department_id, department_name, description) VALUES
                    (1, 'Public Works', 'Roads, infrastructure, and public utilities'),
                    (2, 'Health Department', 'Public health and medical services'),
                    (3, 'Education', 'Schools and educational institutions'),
                    (4, 'Transportation', 'Public transport and traffic management'),
                    (5, 'Municipal Corporation', 'Local municipal services and administration')
                    ON CONFLICT (department_id) DO NOTHING;
                """))
                
                # Insert sample categories
                conn.execute(text("""
                    INSERT INTO categories (category_id, category_name, category_code, description, department_id, keywords) VALUES
                    (1, 'Road Maintenance', 'ROAD_MAINT', 'Road repairs and maintenance', 1, ARRAY['road', 'street', 'pothole', 'repair', 'maintenance']),
                    (2, 'Water Supply', 'WATER_SUP', 'Water supply and distribution issues', 1, ARRAY['water', 'supply', 'pipeline', 'tap', 'drinking']),
                    (3, 'Street Lighting', 'STREET_LIGHT', 'Street light installation and repair', 1, ARRAY['light', 'street', 'lamp', 'electricity', 'bulb']),
                    (4, 'Healthcare Services', 'HEALTH_SVC', 'Medical and healthcare services', 2, ARRAY['health', 'medical', 'hospital', 'clinic', 'doctor']),
                    (5, 'Public Health', 'PUB_HEALTH', 'Public health and sanitation', 2, ARRAY['sanitation', 'hygiene', 'waste', 'cleanliness']),
                    (6, 'School Infrastructure', 'SCHOOL_INFRA', 'School buildings and facilities', 3, ARRAY['school', 'education', 'classroom', 'building']),
                    (7, 'Public Transport', 'PUB_TRANS', 'Bus and public transportation', 4, ARRAY['bus', 'transport', 'public', 'route']),
                    (8, 'Traffic Management', 'TRAFFIC', 'Traffic signals and management', 4, ARRAY['traffic', 'signal', 'congestion', 'parking']),
                    (9, 'Parks and Recreation', 'PARKS', 'Public parks and recreational facilities', 5, ARRAY['park', 'recreation', 'playground', 'garden']),
                    (10, 'Waste Management', 'WASTE', 'Garbage collection and waste disposal', 5, ARRAY['garbage', 'waste', 'disposal', 'collection', 'trash'])
                    ON CONFLICT (category_id) DO NOTHING;
                """))
                
                conn.commit()
                print("✅ Departments and categories setup completed")
                
            except Exception as e:
                print(f"⚠️  Department setup info: {e}")
            
            # Fix foreign key constraints
            print("🔧 Setting up foreign key constraints...")
            
            try:
                # Drop any existing constraints that might conflict
                conn.execute(text("ALTER TABLE petitions DROP CONSTRAINT IF EXISTS petitions_user_id_fkey;"))
                
                # Add the correct foreign key constraint
                conn.execute(text("""
                    ALTER TABLE petitions 
                    ADD CONSTRAINT petitions_user_id_fkey 
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
                """))
                
                conn.commit()
                print("✅ Foreign key constraints setup completed")
                
            except Exception as e:
                print(f"⚠️  Constraint setup info: {e}")
            
            # Verify the setup
            print("\n🔍 Verifying enhanced schema:")
            
            # Check users count
            result = conn.execute(text("SELECT COUNT(*) FROM users;"))
            users_count = result.fetchone()[0]
            print(f"  ✓ Users table: {users_count} users")
            
            # Check departments count
            result = conn.execute(text("SELECT COUNT(*) FROM departments;"))
            dept_count = result.fetchone()[0]
            print(f"  ✓ Departments table: {dept_count} departments")
            
            # Check categories count
            result = conn.execute(text("SELECT COUNT(*) FROM categories;"))
            cat_count = result.fetchone()[0]
            print(f"  ✓ Categories table: {cat_count} categories")
            
            # Check petitions count
            result = conn.execute(text("SELECT COUNT(*) FROM petitions;"))
            pet_count = result.fetchone()[0]
            print(f"  ✓ Petitions table: {pet_count} petitions")
            
            # Check foreign key constraints
            result = conn.execute(text("""
                SELECT 
                    tc.constraint_name, 
                    tc.table_name, 
                    kcu.column_name, 
                    ccu.table_name AS foreign_table_name
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                    AND tc.table_name='petitions';
            """))
            
            constraints = result.fetchall()
            print(f"  ✓ Foreign key constraints: {len(constraints)}")
            for constraint in constraints:
                print(f"    - {constraint[2]} → {constraint[3]}")
        
        print("\n🎉 Enhanced database schema setup completed!")
        
    except Exception as e:
        print(f"❌ Error setting up enhanced schema: {e}")

if __name__ == "__main__":
    setup_enhanced_schema()