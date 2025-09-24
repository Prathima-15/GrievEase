#!/usr/bin/env python3

import requests
import json

def test_petition_creation():
    """Test petition creation with the fixed array handling"""
    
    url = "http://localhost:8000/petitions"
    
    # Test petition data
    petition_data = {
        "title": "Test petition with AI priority",
        "description": "This is an urgent test petition that needs immediate attention due to safety concerns.",
        "location": "Test Location, Bangalore",
        "proof_files": ["test_file1.jpg", "test_file2.pdf"],  # This should work as an array now
        "user_id": 1
    }
    
    try:
        print("🧪 Testing Petition Creation")
        print("=" * 50)
        print(f"📋 Title: {petition_data['title']}")
        print(f"📝 Description: {petition_data['description'][:50]}...")
        print(f"📁 Proof Files: {petition_data['proof_files']}")
        print("\n🚀 Sending request...")
        
        response = requests.post(url, json=petition_data)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Petition created successfully!")
            print(f"🆔 Petition ID: {result.get('id')}")
            print(f"📋 Department: {result.get('department_name')}")
            print(f"📂 Category: {result.get('category_name')}")
            print(f"⚡ AI-Determined Urgency: {result.get('urgency_level', '').upper()}")
            print(f"📁 Proof Files: {result.get('proof_files')}")
            print(f"💭 AI Reasoning: {result.get('ai_reasoning', '')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server.")
        print("💡 Make sure to start the server with: uvicorn enhanced_main:app --reload --port 8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_petition_creation()