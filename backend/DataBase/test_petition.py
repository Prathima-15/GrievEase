#!/usr/bin/env python3

import requests
import json

def test_petition_creation():
    """Test the petition creation endpoint"""
    
    # Test data
    petition_data = {
        'title': 'Test Broken Streetlight Emergency',
        'short_description': 'Urgent repair needed for broken streetlight causing safety hazards',
        'description': 'The streetlight on Main Street is completely broken and creating dangerous conditions for pedestrians and drivers at night. This is an urgent safety issue that needs immediate attention.',
        'state': 'Karnataka',
        'district': 'Bangalore',
        'taluk': 'Bangalore North',
        'location': 'Main Street, near Central Park',
        'is_public': 'true'
    }
    
    # Create a test user token (you'll need to replace this with a real token)
    headers = {
        'Authorization': 'Bearer test_token_here'  # Replace with actual token
    }
    
    try:
        # Test the endpoint
        response = requests.post(
            'http://localhost:8000/petitions/create',
            data=petition_data,
            headers=headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Petition creation successful!")
            print(f"Petition ID: {result.get('petition_id')}")
            print(f"AI Classification: {result.get('ai_classification')}")
        else:
            print("\n❌ Petition creation failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the backend is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_petition_creation()