#!/usr/bin/env python3
"""
Setup required departments and categories for the enhanced schema
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from enhanced_models import Department, Category, Base

DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"

def setup_departments_and_categories():
    """Setup required departments and categories"""
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Setup departments
        departments_data = [
            {"id": 1, "name": "Public Works", "description": "Roads, infrastructure, and public utilities"},
            {"id": 2, "name": "Health Department", "description": "Public health and medical services"},
            {"id": 3, "name": "Education", "description": "Schools and educational institutions"},
            {"id": 4, "name": "Transportation", "description": "Public transport and traffic management"},
            {"id": 5, "name": "Municipal Corporation", "description": "Local municipal services and administration"}
        ]
        
        for dept_data in departments_data:
            existing = db.query(Department).filter(Department.department_id == dept_data["id"]).first()
            if not existing:
                dept = Department(
                    department_id=dept_data["id"],
                    department_name=dept_data["name"],
                    description=dept_data["description"]
                )
                db.add(dept)
        
        # Setup categories
        categories_data = [
            {"id": 1, "name": "Road Maintenance", "code": "ROAD_MAINT", "description": "Road repairs and maintenance", "dept_id": 1, "keywords": ["road", "street", "pothole", "repair", "maintenance"]},
            {"id": 2, "name": "Water Supply", "code": "WATER_SUP", "description": "Water supply and distribution issues", "dept_id": 1, "keywords": ["water", "supply", "pipeline", "tap", "drinking"]},
            {"id": 3, "name": "Street Lighting", "code": "STREET_LIGHT", "description": "Street light installation and repair", "dept_id": 1, "keywords": ["light", "street", "lamp", "electricity", "bulb"]},
            {"id": 4, "name": "Healthcare Services", "code": "HEALTH_SVC", "description": "Medical and healthcare services", "dept_id": 2, "keywords": ["health", "medical", "hospital", "clinic", "doctor"]},
            {"id": 5, "name": "Public Health", "code": "PUB_HEALTH", "description": "Public health and sanitation", "dept_id": 2, "keywords": ["sanitation", "hygiene", "waste", "cleanliness"]},
            {"id": 6, "name": "School Infrastructure", "code": "SCHOOL_INFRA", "description": "School buildings and facilities", "dept_id": 3, "keywords": ["school", "education", "classroom", "building"]},
            {"id": 7, "name": "Public Transport", "code": "PUB_TRANS", "description": "Bus and public transportation", "dept_id": 4, "keywords": ["bus", "transport", "public", "route"]},
            {"id": 8, "name": "Traffic Management", "code": "TRAFFIC", "description": "Traffic signals and management", "dept_id": 4, "keywords": ["traffic", "signal", "congestion", "parking"]},
            {"id": 9, "name": "Parks and Recreation", "code": "PARKS", "description": "Public parks and recreational facilities", "dept_id": 5, "keywords": ["park", "recreation", "playground", "garden"]},
            {"id": 10, "name": "Waste Management", "code": "WASTE", "description": "Garbage collection and waste disposal", "dept_id": 5, "keywords": ["garbage", "waste", "disposal", "collection", "trash"]}
        ]
        
        for cat_data in categories_data:
            existing = db.query(Category).filter(Category.category_id == cat_data["id"]).first()
            if not existing:
                category = Category(
                    category_id=cat_data["id"],
                    category_name=cat_data["name"],
                    category_code=cat_data["code"],
                    description=cat_data["description"],
                    department_id=cat_data["dept_id"],
                    keywords=cat_data["keywords"]
                )
                db.add(category)
        
        db.commit()
        
        # Verify setup
        dept_count = db.query(Department).count()
        cat_count = db.query(Category).count()
        
        print(f"✅ Setup completed:")
        print(f"   📋 Departments: {dept_count}")
        print(f"   📂 Categories: {cat_count}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error setting up departments and categories: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_departments_and_categories()