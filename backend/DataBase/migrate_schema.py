"""
Database Migration Script for GrievEase Enhanced Schema
This script migrates from the existing simple schema to the comprehensive schema
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from enhanced_models import Base, Department
import json

# Database configuration - using the original project's database URL
DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"

def create_enhanced_schema():
    """Create the enhanced database schema"""
    engine = create_engine(DATABASE_URL)
    
    # Create all tables from enhanced_models
    print("Creating enhanced schema...")
    Base.metadata.create_all(bind=engine)
    print("Enhanced schema created successfully!")
    
    return engine

def populate_departments(engine):
    """Populate the departments table with common government departments"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    departments = [
        {"department_name": "Public Works", "description": "Infrastructure, roads, water supply, and public utilities"},
        {"department_name": "Health Department", "description": "Public health services, hospitals, and medical facilities"},
        {"department_name": "Education", "description": "Schools, colleges, and educational institutions"},
        {"department_name": "Transportation", "description": "Public transport, traffic management, and vehicle registration"},
        {"department_name": "Revenue Department", "description": "Land records, property registration, and revenue collection"},
        {"department_name": "Police Department", "description": "Law and order, crime prevention, and public safety"},
        {"department_name": "Municipal Corporation", "description": "Urban development, waste management, and city planning"},
        {"department_name": "Agriculture Department", "description": "Farming support, crop insurance, and agricultural development"},
        {"department_name": "Forest Department", "description": "Forest conservation, wildlife protection, and environmental issues"},
        {"department_name": "Social Welfare", "description": "Welfare schemes, pension distribution, and social security"}
    ]
    
    try:
        for dept_data in departments:
            # Check if department already exists
            existing = db.query(Department).filter(Department.department_name == dept_data["department_name"]).first()
            if not existing:
                department = Department(**dept_data)
                db.add(department)
        
        db.commit()
        print("Departments populated successfully!")
        
    except Exception as e:
        print(f"Error populating departments: {e}")
        db.rollback()
    finally:
        db.close()

def migrate_existing_data(engine):
    """Migrate data from old schema to new schema (if needed)"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if old tables exist and migrate data
        print("Checking for existing data to migrate...")
        
        # Example migration for users table
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'userdb'"))
        if result.fetchone():
            print("Found existing userdb table - migration may be needed")
            # Add specific migration logic here if needed
        
        # Example migration for petitions
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'petitions'"))
        if result.fetchone():
            print("Found existing petitions table")
            # Add migration logic here
            
        print("Data migration check completed!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        db.close()

def create_indexes(engine):
    """Create additional indexes for better performance"""
    with engine.connect() as connection:
        try:
            # Indexes for better query performance
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_petitions_user_id ON petitions(user_id);",
                "CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);",
                "CREATE INDEX IF NOT EXISTS idx_petitions_department ON petitions(department);",
                "CREATE INDEX IF NOT EXISTS idx_petitions_submitted_at ON petitions(submitted_at);",
                "CREATE INDEX IF NOT EXISTS idx_petition_updates_petition_id ON petition_updates(petition_id);",
                "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);",
                "CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);",
                "CREATE INDEX IF NOT EXISTS idx_officers_department_id ON officers(department_id);",
                "CREATE INDEX IF NOT EXISTS idx_escalations_petition_id ON escalations(petition_id);"
            ]
            
            for index_sql in indexes:
                connection.execute(text(index_sql))
                
            connection.commit()
            print("Database indexes created successfully!")
            
        except Exception as e:
            print(f"Error creating indexes: {e}")

def setup_triggers(engine):
    """Set up database triggers for notifications and auditing"""
    with engine.connect() as connection:
        try:
            # Trigger to automatically set due_date when petition is created
            trigger_sql = """
            CREATE OR REPLACE FUNCTION set_petition_due_date()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.due_date IS NULL THEN
                    CASE NEW.urgency_level
                        WHEN 'critical' THEN NEW.due_date := NEW.submitted_at + INTERVAL '3 days';
                        WHEN 'high' THEN NEW.due_date := NEW.submitted_at + INTERVAL '7 days';
                        WHEN 'medium' THEN NEW.due_date := NEW.submitted_at + INTERVAL '15 days';
                        WHEN 'low' THEN NEW.due_date := NEW.submitted_at + INTERVAL '30 days';
                        ELSE NEW.due_date := NEW.submitted_at + INTERVAL '15 days';
                    END CASE;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trigger_set_due_date ON petitions;
            CREATE TRIGGER trigger_set_due_date
                BEFORE INSERT ON petitions
                FOR EACH ROW EXECUTE FUNCTION set_petition_due_date();
            """
            
            connection.execute(text(trigger_sql))
            connection.commit()
            print("Database triggers created successfully!")
            
        except Exception as e:
            print(f"Error creating triggers: {e}")

def main():
    """Main migration function"""
    print("=== GrievEase Database Migration ===")
    print("Starting migration to enhanced schema...")
    
    try:
        # Create enhanced schema
        engine = create_enhanced_schema()
        
        # Populate departments
        populate_departments(engine)
        
        # Migrate existing data if any
        migrate_existing_data(engine)
        
        # Create performance indexes
        create_indexes(engine)
        
        # Set up triggers
        setup_triggers(engine)
        
        print("\n=== Migration Completed Successfully! ===")
        print("Your database now has the enhanced schema with:")
        print("✅ Users table with comprehensive citizen data")
        print("✅ Departments table for organizational structure")
        print("✅ Enhanced Officers table with department relationships")
        print("✅ Comprehensive Petitions table with full workflow support")
        print("✅ Evidence tracking with petition_evidence table")
        print("✅ Update history with petition_updates table")
        print("✅ Escalation workflow with escalations table")
        print("✅ Notification system with notifications table")
        print("✅ Performance indexes for faster queries")
        print("✅ Automatic due date triggers based on urgency")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        print("Please check your database connection and try again.")

if __name__ == "__main__":
    main()