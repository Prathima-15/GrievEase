#!/usr/bin/env python3

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ai_classification import get_ai_classifier

# Database configuration
DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"

def test_ai_classifier():
    """Test the AI classifier functionality"""
    
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Get AI classifier
        classifier = get_ai_classifier(db)
        
        # Test cases
        test_cases = [
            {
                'title': 'Emergency: Broken streetlight causing accidents',
                'description': 'The streetlight is completely broken and cars are crashing because they cannot see. This is very dangerous and urgent.',
                'location': 'Main Street, Bangalore'
            },
            {
                'title': 'Request for new park bench',
                'description': 'It would be nice to have a bench in the park for elderly people to rest when possible.',
                'location': 'Central Park, Bangalore'
            },
            {
                'title': 'Broken water pipe flooding road',
                'description': 'Major water pipe burst is flooding the entire road and damaging nearby buildings. Immediate repair needed.',
                'location': 'MG Road, Bangalore'
            }
        ]
        
        print("🤖 Testing AI Classifier")
        print("=" * 50)
        
        for i, case in enumerate(test_cases, 1):
            print(f"\nTest Case {i}:")
            print(f"Title: {case['title']}")
            print(f"Description: {case['description'][:60]}...")
            
            result = classifier.classify_petition(
                title=case['title'],
                description=case['description'],
                location=case['location']
            )
            
            print(f"📋 Department: {result['department_name']}")
            print(f"📂 Category: {result['category_name']}")
            print(f"⚡ Urgency: {result['urgency_level'].upper()}")
            print(f"🎯 Confidence: {result['confidence']}%")
            print(f"💭 Reasoning: {result['ai_reasoning']}")
            
        db.close()
        print("\n✅ AI Classifier test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error testing AI classifier: {e}")

if __name__ == "__main__":
    test_ai_classifier()