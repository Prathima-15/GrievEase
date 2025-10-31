"""
Test script for AI classification API integration
This script tests the petition creation with AI classification
"""

import requests
import json

# Configuration
API_BASE_URL = "http://localhost:8000"
AI_API_URL = "http://localhost:8002/predict"

def test_ai_api_directly():
    """Test the AI API directly"""
    print("\n=== Testing AI API directly ===")
    
    test_description = "There is a lot of garbage piling up near the main road in my area. It has not been cleared for 2 weeks and is causing health issues."
    
    try:
        response = requests.post(
            AI_API_URL,
            json={"description": test_description},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            prediction = data.get("prediction", {})
            print(f"\nParsed Results:")
            print(f"  Department: {prediction.get('department')}")
            print(f"  Grievance Type: {prediction.get('grievance_type')}")
            print(f"  Urgency Score: {prediction.get('urgency')}")
            
            # Test urgency conversion
            urgency = prediction.get('urgency', 2.5)
            if urgency >= 4.0:
                urgency_level = "critical"
            elif urgency >= 3.0:
                urgency_level = "high"
            elif urgency >= 2.0:
                urgency_level = "medium"
            else:
                urgency_level = "low"
            
            print(f"  Urgency Level: {urgency_level}")
            return True
        else:
            print("❌ AI API returned error")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to AI API at localhost:8002")
        print("   Make sure the AI API server is running on port 8002")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_petition_creation():
    """Test petition creation endpoint"""
    print("\n=== Testing Petition Creation Endpoint ===")
    print("Note: This requires authentication. You'll need to:")
    print("1. Sign in to get a JWT token")
    print("2. Pass the token in the Authorization header")
    print("\nExample curl command:")
    print("""
curl -X POST http://localhost:8000/petitions/create \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -F "title=Garbage not cleared for weeks" \\
  -F "description=There is a lot of garbage piling up near the main road..." \\
  -F "state=Tamil Nadu" \\
  -F "district=Chennai" \\
  -F "is_public=true"
    """)

def main():
    print("=== AI Classification Integration Test ===")
    print("This script tests the integration with localhost:8002/predict API")
    
    # Test 1: AI API directly
    ai_working = test_ai_api_directly()
    
    # Test 2: Petition creation (requires auth)
    test_petition_creation()
    
    # Summary
    print("\n=== Test Summary ===")
    if ai_working:
        print("✅ AI API is accessible and working correctly")
        print("✅ Backend should now classify petitions automatically")
        print("\nNext Steps:")
        print("1. Make sure both servers are running:")
        print("   - Backend API: python backend/DataBase/enhanced_main.py (port 8000)")
        print("   - AI API: your AI model server (port 8002)")
        print("2. Test petition creation from the frontend")
        print("3. Check the petition table to verify AI classification is stored")
    else:
        print("❌ AI API is not accessible")
        print("\nTroubleshooting:")
        print("1. Make sure your AI model server is running on port 8002")
        print("2. Verify the API endpoint is POST /predict")
        print("3. Check if the API expects {\"description\": \"text\"}")

if __name__ == "__main__":
    main()
