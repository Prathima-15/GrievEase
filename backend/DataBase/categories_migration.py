"""
Enhanced Database Migration - Adding Categories for AI Classification
This script adds the categories table and populates it with comprehensive categories for each department
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from enhanced_models import Base, Department, Category
import json

# Database configuration
DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"

def create_categories_migration():
    """Create categories table and populate with department categories"""
    
    print("=== Enhanced Database Migration - Categories ===")
    print("Adding categories table for AI classification...")
    
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Create the categories table
        print("Creating categories table...")
        Base.metadata.create_all(bind=engine, tables=[Category.__table__])
        print("Categories table created successfully!")
        
        # Add new columns to petitions table
        print("Adding AI classification columns to petitions table...")
        with engine.connect() as conn:
            try:
                # Add department_id column
                conn.execute(text("ALTER TABLE petitions ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(department_id)"))
                print("Added department_id column")
                
                # Add category_id column
                conn.execute(text("ALTER TABLE petitions ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(category_id)"))
                print("Added category_id column")
                
                # Add classification_confidence column
                conn.execute(text("ALTER TABLE petitions ADD COLUMN IF NOT EXISTS classification_confidence INTEGER DEFAULT 0"))
                print("Added classification_confidence column")
                
                # Add manually_classified column
                conn.execute(text("ALTER TABLE petitions ADD COLUMN IF NOT EXISTS manually_classified BOOLEAN DEFAULT FALSE"))
                print("Added manually_classified column")
                
                conn.commit()
                
            except Exception as e:
                print(f"Note: Some columns may already exist: {e}")
        
        # Populate categories
        db = SessionLocal()
        
        try:
            # Check if categories already exist
            existing_categories = db.query(Category).count()
            if existing_categories > 0:
                print(f"Categories already exist ({existing_categories}), skipping population...")
                return
            
            print("Populating categories for each department...")
            
            # Comprehensive category mapping for AI classification
            department_categories = {
                "Public Works": [
                    {"name": "Road Maintenance", "code": "road_maintenance", "keywords": ["road", "pothole", "street", "highway", "asphalt", "repair", "traffic"], "description": "Road repairs, potholes, street maintenance"},
                    {"name": "Water Supply", "code": "water_supply", "keywords": ["water", "pipe", "leak", "shortage", "supply", "drainage", "sewage"], "description": "Water supply issues, pipe leaks, drainage problems"},
                    {"name": "Sanitation", "code": "sanitation", "keywords": ["garbage", "waste", "cleaning", "toilet", "sewage", "hygiene"], "description": "Waste management, public toilets, sanitation"},
                    {"name": "Street Lighting", "code": "street_lighting", "keywords": ["light", "lamp", "electricity", "dark", "bulb", "illumination"], "description": "Street light maintenance and installation"},
                    {"name": "Public Buildings", "code": "public_buildings", "keywords": ["building", "office", "structure", "maintenance", "repair"], "description": "Public building maintenance and repairs"}
                ],
                "Health Department": [
                    {"name": "Hospital Services", "code": "hospital_services", "keywords": ["hospital", "doctor", "treatment", "medicine", "emergency"], "description": "Hospital facilities and medical services"},
                    {"name": "Public Health", "code": "public_health", "keywords": ["vaccination", "epidemic", "disease", "health", "prevention"], "description": "Public health programs and disease prevention"},
                    {"name": "Medical Equipment", "code": "medical_equipment", "keywords": ["equipment", "machine", "medical", "device", "broken"], "description": "Medical equipment issues and maintenance"},
                    {"name": "Ambulance Services", "code": "ambulance_services", "keywords": ["ambulance", "emergency", "transport", "patient"], "description": "Emergency ambulance and transport services"},
                    {"name": "Maternal Health", "code": "maternal_health", "keywords": ["pregnant", "mother", "child", "birth", "maternity"], "description": "Maternal and child health services"}
                ],
                "Education": [
                    {"name": "School Infrastructure", "code": "school_infrastructure", "keywords": ["school", "building", "classroom", "toilet", "playground"], "description": "School building and infrastructure issues"},
                    {"name": "Teaching Staff", "code": "teaching_staff", "keywords": ["teacher", "staff", "absent", "vacancy", "qualification"], "description": "Teacher availability and qualification issues"},
                    {"name": "Educational Resources", "code": "educational_resources", "keywords": ["books", "uniform", "scholarship", "computer", "library"], "description": "Books, uniforms, scholarships, educational materials"},
                    {"name": "Mid-day Meals", "code": "midday_meals", "keywords": ["food", "meal", "lunch", "nutrition", "kitchen"], "description": "School meal programs and nutrition"},
                    {"name": "Student Safety", "code": "student_safety", "keywords": ["safety", "security", "harassment", "bullying", "transport"], "description": "Student safety and security concerns"}
                ],
                "Transportation": [
                    {"name": "Public Transport", "code": "public_transport", "keywords": ["bus", "train", "transport", "route", "schedule"], "description": "Public bus and train services"},
                    {"name": "Traffic Management", "code": "traffic_management", "keywords": ["traffic", "signal", "jam", "congestion", "parking"], "description": "Traffic signals, congestion, parking issues"},
                    {"name": "Vehicle Registration", "code": "vehicle_registration", "keywords": ["registration", "license", "permit", "vehicle", "rto"], "description": "Vehicle registration and licensing"},
                    {"name": "Road Safety", "code": "road_safety", "keywords": ["accident", "safety", "signal", "crossing", "speed"], "description": "Road safety measures and accident prevention"},
                    {"name": "Auto Rickshaw", "code": "auto_rickshaw", "keywords": ["auto", "rickshaw", "fare", "meter", "permit"], "description": "Auto rickshaw services and fare issues"}
                ],
                "Revenue Department": [
                    {"name": "Land Records", "code": "land_records", "keywords": ["land", "property", "record", "title", "survey"], "description": "Land records and property documentation"},
                    {"name": "Property Tax", "code": "property_tax", "keywords": ["tax", "property", "assessment", "payment", "bill"], "description": "Property tax assessment and collection"},
                    {"name": "Registration", "code": "registration", "keywords": ["registration", "stamp", "document", "deed", "transfer"], "description": "Property registration and stamp duty"},
                    {"name": "Survey Settlement", "code": "survey_settlement", "keywords": ["survey", "boundary", "measurement", "dispute", "settlement"], "description": "Land survey and boundary settlement"},
                    {"name": "Revenue Collection", "code": "revenue_collection", "keywords": ["revenue", "collection", "dues", "payment", "arrears"], "description": "Revenue collection and payment issues"}
                ],
                "Police Department": [
                    {"name": "Crime Reporting", "code": "crime_reporting", "keywords": ["crime", "theft", "robbery", "complaint", "fir"], "description": "Crime reporting and FIR registration"},
                    {"name": "Public Safety", "code": "public_safety", "keywords": ["safety", "security", "patrol", "protection", "law"], "description": "Public safety and law enforcement"},
                    {"name": "Traffic Violations", "code": "traffic_violations", "keywords": ["traffic", "violation", "fine", "license", "challan"], "description": "Traffic rule violations and fines"},
                    {"name": "Domestic Violence", "code": "domestic_violence", "keywords": ["domestic", "violence", "abuse", "family", "women"], "description": "Domestic violence and family disputes"},
                    {"name": "Missing Persons", "code": "missing_persons", "keywords": ["missing", "person", "lost", "child", "search"], "description": "Missing person reports and searches"}
                ],
                "Municipal Corporation": [
                    {"name": "Urban Planning", "code": "urban_planning", "keywords": ["planning", "development", "zoning", "approval", "permit"], "description": "Urban development and planning approvals"},
                    {"name": "Building Permits", "code": "building_permits", "keywords": ["building", "permit", "approval", "construction", "license"], "description": "Building permits and construction approvals"},
                    {"name": "Waste Management", "code": "waste_management", "keywords": ["waste", "garbage", "collection", "disposal", "recycling"], "description": "Waste collection and disposal services"},
                    {"name": "Parks and Recreation", "code": "parks_recreation", "keywords": ["park", "garden", "playground", "recreation", "maintenance"], "description": "Parks, gardens, and recreational facilities"},
                    {"name": "Property Tax Municipal", "code": "property_tax_municipal", "keywords": ["tax", "municipal", "assessment", "bill", "payment"], "description": "Municipal property tax and assessments"}
                ],
                "Agriculture Department": [
                    {"name": "Crop Insurance", "code": "crop_insurance", "keywords": ["crop", "insurance", "claim", "damage", "compensation"], "description": "Crop insurance claims and compensation"},
                    {"name": "Fertilizer Supply", "code": "fertilizer_supply", "keywords": ["fertilizer", "seed", "supply", "subsidy", "distribution"], "description": "Fertilizer and seed supply issues"},
                    {"name": "Irrigation", "code": "irrigation", "keywords": ["irrigation", "water", "canal", "bore", "pump"], "description": "Irrigation systems and water for farming"},
                    {"name": "Market Prices", "code": "market_prices", "keywords": ["price", "market", "msp", "procurement", "sale"], "description": "Market prices and crop procurement"},
                    {"name": "Pest Control", "code": "pest_control", "keywords": ["pest", "disease", "pesticide", "crop", "protection"], "description": "Pest control and crop disease management"}
                ],
                "Forest Department": [
                    {"name": "Forest Conservation", "code": "forest_conservation", "keywords": ["forest", "tree", "cutting", "conservation", "plantation"], "description": "Forest conservation and tree protection"},
                    {"name": "Wildlife Protection", "code": "wildlife_protection", "keywords": ["wildlife", "animal", "poaching", "protection", "reserve"], "description": "Wildlife protection and anti-poaching"},
                    {"name": "Environmental Issues", "code": "environmental_issues", "keywords": ["environment", "pollution", "air", "water", "noise"], "description": "Environmental pollution and protection"},
                    {"name": "Forest Permits", "code": "forest_permits", "keywords": ["permit", "clearance", "forest", "land", "approval"], "description": "Forest land permits and clearances"},
                    {"name": "Human-Animal Conflict", "code": "human_animal_conflict", "keywords": ["conflict", "animal", "crop", "damage", "attack"], "description": "Human-wildlife conflict resolution"}
                ],
                "Social Welfare": [
                    {"name": "Pension Schemes", "code": "pension_schemes", "keywords": ["pension", "elderly", "widow", "disability", "payment"], "description": "Pension schemes for elderly, widows, disabled"},
                    {"name": "Welfare Schemes", "code": "welfare_schemes", "keywords": ["welfare", "scheme", "benefit", "subsidy", "assistance"], "description": "Government welfare and assistance schemes"},
                    {"name": "Women Empowerment", "code": "women_empowerment", "keywords": ["women", "empowerment", "self", "help", "group"], "description": "Women empowerment and self-help programs"},
                    {"name": "Child Welfare", "code": "child_welfare", "keywords": ["child", "welfare", "protection", "education", "nutrition"], "description": "Child welfare and protection services"},
                    {"name": "Disability Services", "code": "disability_services", "keywords": ["disability", "handicap", "assistance", "support", "aid"], "description": "Services for persons with disabilities"}
                ]
            }
            
            # Get all departments
            departments = db.query(Department).all()
            department_map = {dept.department_name: dept.department_id for dept in departments}
            
            categories_created = 0
            for dept_name, categories in department_categories.items():
                if dept_name in department_map:
                    dept_id = department_map[dept_name]
                    print(f"Adding categories for {dept_name}...")
                    
                    for cat_data in categories:
                        category = Category(
                            category_name=cat_data["name"],
                            category_code=cat_data["code"],
                            description=cat_data["description"],
                            department_id=dept_id,
                            keywords=cat_data["keywords"],
                            priority_weight=1,
                            is_active=True
                        )
                        db.add(category)
                        categories_created += 1
                    
                    print(f"  Added {len(categories)} categories for {dept_name}")
            
            db.commit()
            print(f"\nSuccessfully created {categories_created} categories across all departments!")
            
            # Create indexes for better performance
            print("Creating performance indexes...")
            with engine.connect() as conn:
                try:
                    conn.execute(text("CREATE INDEX IF NOT EXISTS idx_categories_department_id ON categories(department_id)"))
                    conn.execute(text("CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(category_code)"))
                    conn.execute(text("CREATE INDEX IF NOT EXISTS idx_petitions_department_id ON petitions(department_id)"))
                    conn.execute(text("CREATE INDEX IF NOT EXISTS idx_petitions_category_id ON petitions(category_id)"))
                    conn.commit()
                    print("Performance indexes created!")
                except Exception as e:
                    print(f"Note: Some indexes may already exist: {e}")
            
        except Exception as e:
            db.rollback()
            print(f"Error populating categories: {e}")
            raise
        finally:
            db.close()
            
        print("\n=== Categories Migration Completed Successfully! ===")
        print("Your database now supports AI classification with:")
        print("Categories table with department relationships")
        print("50+ comprehensive categories across all departments") 
        print("Keyword arrays for AI training and classification")
        print("Enhanced petition table with AI classification fields")
        print("Performance indexes for faster queries")
        print("Ready for AI model integration!")
        
        return True
        
    except Exception as e:
        print(f"Migration failed: {e}")
        return False

if __name__ == "__main__":
    create_categories_migration()