"""
Database verification script to check our enhanced schema
"""

from enhanced_models import *
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

# Database connection
DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"
engine = create_engine(DATABASE_URL)

def check_database():
    try:
        # Get table information
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print("=== Database Schema Verification ===")
        print(f"Found {len(tables)} tables:")
        
        for table in sorted(tables):
            print(f"  ✅ {table}")
            
        # Check if our new tables exist
        new_tables = ['departments', 'officers', 'petition_evidence', 'petition_updates', 'escalations', 'notifications']
        
        print("\n=== Enhanced Schema Tables ===")
        for table in new_tables:
            if table in tables:
                print(f"  ✅ {table} - Created successfully")
            else:
                print(f"  ❌ {table} - Missing")
                
        # Check sample data
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Check departments
            dept_count = db.query(Department).count()
            print(f"\n=== Sample Data ===")
            print(f"  📊 Departments: {dept_count}")
            
            # List departments
            departments = db.query(Department).all()
            for dept in departments:
                print(f"    - {dept.department_name}")
                
        except Exception as e:
            print(f"Error checking sample data: {e}")
        finally:
            db.close()
            
        return True
        
    except Exception as e:
        print(f"Database verification failed: {e}")
        return False

if __name__ == "__main__":
    check_database()