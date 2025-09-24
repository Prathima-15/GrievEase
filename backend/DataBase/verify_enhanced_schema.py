#!/usr/bin/env python3
"""
Verify enhanced database schema and relationships
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from enhanced_models import User, Department, Category, Petition

DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"

def verify_enhanced_schema():
    """Verify the enhanced database schema"""
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("🔍 Verifying Enhanced Database Schema")
        print("=" * 50)
        
        # Check users
        users = db.query(User).all()
        print(f"👥 Users: {len(users)}")
        for user in users[:3]:  # Show first 3
            print(f"   - ID: {user.user_id}, Name: {user.first_name} {user.last_name}, Email: {user.email}")
        
        # Check departments
        departments = db.query(Department).all()
        print(f"📋 Departments: {len(departments)}")
        for dept in departments[:5]:  # Show first 5
            print(f"   - ID: {dept.department_id}, Name: {dept.department_name}")
        
        # Check categories
        categories = db.query(Category).all()
        print(f"📂 Categories: {len(categories)}")
        for cat in categories[:5]:  # Show first 5
            print(f"   - ID: {cat.category_id}, Name: {cat.category_name}, Dept: {cat.department_id}")
        
        # Check petitions
        petitions = db.query(Petition).all()
        print(f"📝 Petitions: {len(petitions)}")
        for petition in petitions[:3]:  # Show first 3
            print(f"   - ID: {petition.petition_id}, User: {petition.user_id}, Title: {petition.title[:30]}...")
        
        # Test relationships
        print("\n🔗 Testing Relationships:")
        
        if users:
            test_user = users[0]
            user_petitions = test_user.petitions
            print(f"   - User {test_user.user_id} has {len(user_petitions)} petitions")
        
        if departments and categories:
            test_dept = departments[0]
            dept_categories = test_dept.categories
            print(f"   - Department '{test_dept.department_name}' has {len(dept_categories)} categories")
        
        if petitions:
            test_petition = petitions[0]
            print(f"   - Petition {test_petition.petition_id}:")
            print(f"     • User: {test_petition.user.first_name if test_petition.user else 'None'}")
            print(f"     • Department: {test_petition.department_rel.department_name if test_petition.department_rel else 'None'}")
            print(f"     • Category: {test_petition.category_rel.category_name if test_petition.category_rel else 'None'}")
        
        print("\n✅ Enhanced schema verification completed!")
        
    except Exception as e:
        print(f"❌ Error during verification: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_enhanced_schema()