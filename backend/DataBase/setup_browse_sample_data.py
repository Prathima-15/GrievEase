"""
Setup sample public petitions for Browse Petitions page testing
Run this script to populate the database with test data
"""

import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.append('.')

from enhanced_models import Petition, User, Category, Department

# Database configuration
DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"

# Create database engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_sample_petitions():
    """Create sample public petitions for testing"""
    db = SessionLocal()
    
    try:
        # Check if we already have public petitions
        existing_public = db.query(Petition).filter(Petition.is_public == True).count()
        print(f"📊 Found {existing_public} existing public petitions")
        
        if existing_public >= 10:
            print("✅ Already have enough public petitions!")
            choice = input("Do you want to add more? (y/n): ")
            if choice.lower() != 'y':
                return
        
        # Get first user for test data
        user = db.query(User).first()
        if not user:
            print("❌ No users found. Please create a user first.")
            return
        
        print(f"📝 Using user: {user.first_name} {user.last_name} (ID: {user.user_id})")
        
        # Get categories and departments
        categories = db.query(Category).all()
        departments = db.query(Department).all()
        
        if not categories or not departments:
            print("⚠️  No categories or departments found. Creating basic ones...")
            
            if not departments:
                dept = Department(
                    department_name="Public Works",
                    description="Infrastructure and public utilities"
                )
                db.add(dept)
                db.commit()
                departments = [dept]
            
            if not categories:
                cat = Category(
                    category_name="Infrastructure",
                    category_code="INFRA",
                    department_id=departments[0].department_id,
                    keywords=["road", "water", "electricity"]
                )
                db.add(cat)
                db.commit()
                categories = [cat]
        
        # Sample petition data
        sample_petitions = [
            {
                "title": "Fix the pothole on Main Street",
                "short_description": "Large pothole causing traffic issues",
                "description": "The large pothole on Main Street near the market has been causing severe traffic issues and damage to vehicles. It has been there for over 3 months and poses a safety risk to commuters.",
                "urgency_level": "high",
                "location": "Main Street, Near Central Market, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore North"
            },
            {
                "title": "Install streetlights in Park Colony",
                "short_description": "Need streetlights for safety",
                "description": "Park Colony residential area lacks proper streetlights, making it unsafe to walk at night. There have been several incidents of theft and residents feel unsafe. We request installation of streetlights along the main road and in internal lanes.",
                "urgency_level": "medium",
                "location": "Park Colony, Jayanagar, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore South"
            },
            {
                "title": "Clean the lake and restore ecosystem",
                "short_description": "Lake pollution and cleanup request",
                "description": "Sankey Lake has become heavily polluted due to sewage discharge and garbage dumping. The once beautiful lake is now emitting foul smell and affecting nearby residents. We request immediate cleanup and restoration of the lake ecosystem.",
                "urgency_level": "high",
                "location": "Sankey Lake, Sadashivanagar, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore North"
            },
            {
                "title": "Improve bus service frequency during peak hours",
                "short_description": "Increase bus frequency for commuters",
                "description": "The bus route connecting Electronic City to MG Road has insufficient frequency during peak hours (7-10 AM and 5-8 PM). Commuters face severe overcrowding and long waiting times. Request to increase bus frequency to every 10 minutes during peak hours.",
                "urgency_level": "medium",
                "location": "Electronic City to MG Road Route",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore South"
            },
            {
                "title": "Repair playground equipment in Community Park",
                "short_description": "Damaged playground equipment",
                "description": "The children's playground in Community Park has several damaged equipment including broken swings, rusted slides, and unstable see-saws. These pose safety risks to children. Request immediate repair or replacement of the equipment.",
                "urgency_level": "medium",
                "location": "Community Park, Indiranagar, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore East"
            },
            {
                "title": "Request for free health camp in underserved area",
                "short_description": "Free health checkup camp needed",
                "description": "The residents of East Village area do not have easy access to healthcare facilities. Many elderly and children have not received health checkups in years. We request organization of a free health camp with basic checkups, blood tests, and medicine distribution.",
                "urgency_level": "low",
                "location": "East Village, Yelahanka, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore North"
            },
            {
                "title": "Illegal garbage dumping near residential area",
                "short_description": "Stop illegal garbage dumping",
                "description": "There is rampant illegal garbage dumping happening near our residential area on Pipeline Road. Despite complaints to local authorities, the issue persists. The garbage attracts stray animals and creates unhygienic conditions. Request strict enforcement and installation of CCTV cameras.",
                "urgency_level": "high",
                "location": "Pipeline Road, Rajarajeshwari Nagar, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore South"
            },
            {
                "title": "Traffic signal not working at major junction",
                "short_description": "Non-functional traffic signal",
                "description": "The traffic signal at Silk Board Junction has not been working for the past week. This is causing major traffic congestion and increasing the risk of accidents. Traffic police are manually managing but it's not effective. Request urgent repair of the signal.",
                "urgency_level": "high",
                "location": "Silk Board Junction, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore South"
            },
            {
                "title": "Water supply shortage in apartment complex",
                "short_description": "Irregular water supply issue",
                "description": "Our apartment complex in Whitefield has been facing severe water supply shortage for the past month. Water is supplied only once in 3 days and that too for just 2 hours. This is causing major inconvenience to over 200 families. Request immediate investigation and resolution.",
                "urgency_level": "high",
                "location": "Green Meadows Apartment, Whitefield, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore East"
            },
            {
                "title": "Install speed breakers on school road",
                "short_description": "Safety measure for school children",
                "description": "The road in front of Government High School witnesses heavy traffic and speeding vehicles. There have been several near-miss incidents with school children. We request installation of speed breakers and pedestrian crossing markings for student safety.",
                "urgency_level": "medium",
                "location": "School Road, BTM Layout, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore South"
            },
            {
                "title": "Noise pollution from construction site",
                "short_description": "Excessive construction noise complaint",
                "description": "The construction site next to our residential area operates beyond permissible hours (late night and early morning) causing severe noise pollution. Residents including elderly and children are facing sleep disturbances. Request enforcement of construction hour regulations.",
                "urgency_level": "medium",
                "location": "HSR Layout, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore South"
            },
            {
                "title": "Stray dog menace in residential area",
                "short_description": "Stray dog population control needed",
                "description": "Our locality has a growing stray dog population that has become aggressive. There have been incidents of dog bites, especially affecting children and elderly. We request the municipal corporation to implement ABC (Animal Birth Control) program and relocate aggressive dogs.",
                "urgency_level": "medium",
                "location": "Malleswaram, Bangalore",
                "state": "Karnataka",
                "district": "Bangalore Urban",
                "taluk": "Bangalore North"
            }
        ]
        
        # Create petitions
        created_count = 0
        statuses = ["submitted", "under_review", "in_progress", "resolved"]
        
        for i, petition_data in enumerate(sample_petitions):
            # Randomly assign category and department
            category = random.choice(categories)
            department = random.choice(departments)
            
            # Create petition with varying submission dates
            submitted_at = datetime.utcnow() - timedelta(days=random.randint(1, 30))
            
            petition = Petition(
                title=petition_data["title"],
                short_description=petition_data["short_description"],
                description=petition_data["description"],
                user_id=user.user_id,
                category=category.category_name,
                department=department.department_name,
                category_id=category.category_id,
                department_id=department.department_id,
                urgency_level=petition_data["urgency_level"],
                state=petition_data["state"],
                district=petition_data["district"],
                taluk=petition_data["taluk"],
                location=petition_data["location"],
                status=random.choice(statuses),
                is_public=True,  # Make it public for browse page
                submitted_at=submitted_at,
                classification_confidence=round(random.uniform(0.75, 0.95), 2),
                manually_classified=False
            )
            
            db.add(petition)
            created_count += 1
            print(f"✅ Created: {petition_data['title']}")
        
        db.commit()
        print(f"\n🎉 Successfully created {created_count} sample public petitions!")
        
        # Show summary
        total_public = db.query(Petition).filter(Petition.is_public == True).count()
        print(f"📊 Total public petitions in database: {total_public}")
        
        # Show breakdown by status
        print("\n📈 Breakdown by status:")
        for status in statuses:
            count = db.query(Petition).filter(
                Petition.is_public == True,
                Petition.status == status
            ).count()
            print(f"  - {status.replace('_', ' ').title()}: {count}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

def make_existing_petitions_public():
    """Make existing petitions public for testing"""
    db = SessionLocal()
    
    try:
        # Get all non-public petitions
        private_petitions = db.query(Petition).filter(Petition.is_public == False).all()
        
        if not private_petitions:
            print("ℹ️  No private petitions found.")
            return
        
        print(f"Found {len(private_petitions)} private petitions.")
        choice = input(f"Make all {len(private_petitions)} petitions public? (y/n): ")
        
        if choice.lower() == 'y':
            for petition in private_petitions:
                petition.is_public = True
            
            db.commit()
            print(f"✅ Made {len(private_petitions)} petitions public!")
        else:
            print("❌ Cancelled")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

def main():
    print("=" * 60)
    print("🔧 Browse Petitions Page - Sample Data Setup")
    print("=" * 60)
    print("\nOptions:")
    print("1. Create new sample public petitions")
    print("2. Make existing petitions public")
    print("3. Both (create new + make existing public)")
    print("4. Exit")
    
    choice = input("\nEnter your choice (1-4): ")
    
    if choice == "1":
        create_sample_petitions()
    elif choice == "2":
        make_existing_petitions_public()
    elif choice == "3":
        make_existing_petitions_public()
        create_sample_petitions()
    elif choice == "4":
        print("👋 Goodbye!")
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main()
