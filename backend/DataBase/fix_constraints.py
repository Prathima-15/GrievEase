#!/usr/bin/env python3
"""
Check database tables and foreign key constraints
"""

import psycopg2
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"

def check_and_fix_constraints():
    """Check and fix foreign key constraints"""
    
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            print("🔍 Checking current tables:")
            
            # Check what tables exist
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema='public' AND table_type='BASE TABLE'
                ORDER BY table_name;
            """))
            
            tables = [row[0] for row in result.fetchall()]
            for table in tables:
                print(f"  ✓ {table}")
            
            print("\n🔍 Checking foreign key constraints on petitions table:")
            
            # Check foreign key constraints
            result = conn.execute(text("""
                SELECT 
                    tc.constraint_name, 
                    tc.table_name, 
                    kcu.column_name, 
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name 
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
            for constraint in constraints:
                print(f"  • {constraint[0]}: {constraint[1]}.{constraint[2]} -> {constraint[3]}.{constraint[4]}")
            
            # Check if we need to drop old constraints and create new ones
            has_userdb_constraint = any('userdb' in str(c) for c in constraints)
            has_users_constraint = any('users' in str(c) for c in constraints)
            
            if has_userdb_constraint and not has_users_constraint:
                print("\n⚠️  Found constraint pointing to 'userdb' table!")
                print("🔧 Fixing foreign key constraints...")
                
                # Drop the old constraint
                conn.execute(text("ALTER TABLE petitions DROP CONSTRAINT IF EXISTS petitions_user_id_fkey;"))
                
                # Create new constraint pointing to 'users' table
                conn.execute(text("""
                    ALTER TABLE petitions 
                    ADD CONSTRAINT petitions_user_id_fkey 
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
                """))
                
                conn.commit()
                print("✅ Fixed foreign key constraint to point to 'users' table")
            
            elif has_users_constraint:
                print("✅ Foreign key constraints are already correct")
            
            print("\n🔍 Checking if both userdb and users tables exist:")
            
            # Check user data in both tables
            if 'userdb' in tables:
                result = conn.execute(text("SELECT COUNT(*) FROM userdb;"))
                userdb_count = result.fetchone()[0]
                print(f"  • userdb table: {userdb_count} users")
            
            if 'users' in tables:
                result = conn.execute(text("SELECT COUNT(*) FROM users;"))
                users_count = result.fetchone()[0]
                print(f"  • users table: {users_count} users")
                
                # Show some sample users
                result = conn.execute(text("SELECT user_id, first_name, last_name, email FROM users LIMIT 3;"))
                sample_users = result.fetchall()
                print("  Sample users in 'users' table:")
                for user in sample_users:
                    print(f"    - ID: {user[0]}, Name: {user[1]} {user[2]}, Email: {user[3]}")
            
            # If userdb has data but users doesn't, we might need to migrate
            if 'userdb' in tables and 'users' in tables:
                if userdb_count > 0 and users_count == 0:
                    print("\n🔄 Need to migrate data from userdb to users table")
                    migrate_data = input("Migrate data? (y/n): ").strip().lower()
                    
                    if migrate_data == 'y':
                        print("📦 Migrating user data...")
                        conn.execute(text("""
                            INSERT INTO users (user_id, first_name, last_name, phone_number, email, password, otp_verified, state, district, taluk, id_type, id_number, id_proof_url, created_at)
                            SELECT user_id, first_name, last_name, phone_number, email, password, otp_verified, state, district, taluk, id_type, id_number, id_proof_url, created_at
                            FROM userdb
                            ON CONFLICT (user_id) DO NOTHING;
                        """))
                        
                        # Update sequence
                        conn.execute(text("SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));"))
                        
                        conn.commit()
                        print("✅ User data migrated successfully")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_and_fix_constraints()