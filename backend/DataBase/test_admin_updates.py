#!/usr/bin/env python3
"""
Test admin status update functionality with proof files
"""

import requests
import os

def test_admin_status_update():
    """Test admin status update with proof files"""
    
    # This would be the admin's token - you'll need to login as admin first
    ADMIN_TOKEN = "your_admin_token_here"
    PETITION_ID = 1  # Change to an existing petition ID
    
    url = f"http://localhost:8000/admin/petitions/{PETITION_ID}/status"
    
    # Create test data
    data = {
        'status': 'in_progress',
        'admin_comment': 'Started investigating this issue. Contacted the local authorities and they have confirmed the problem. Work will begin next week.'
    }
    
    # Test files (you can create dummy files)
    files = []
    
    # Create a dummy text file for testing
    test_file_content = "This is a test proof document showing the actions taken by the admin."
    with open("test_proof.txt", "w") as f:
        f.write(test_file_content)
    
    files = [
        ('proof_files', ('test_proof.txt', open('test_proof.txt', 'rb'), 'text/plain'))
    ]
    
    headers = {
        'Authorization': f'Bearer {ADMIN_TOKEN}'
    }
    
    try:
        print("🧪 Testing Admin Status Update with Proof Files")
        print("=" * 50)
        print(f"📝 Petition ID: {PETITION_ID}")
        print(f"📊 New Status: {data['status']}")
        print(f"💬 Comment: {data['admin_comment']}")
        print(f"📁 Files: test_proof.txt")
        print("\n🚀 Sending request...")
        
        response = requests.put(url, data=data, files=files, headers=headers)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Status update successful!")
            print(f"🆔 Petition ID: {result.get('petition_id')}")
            print(f"📊 New Status: {result.get('new_status')}")
            print(f"📁 Files Uploaded: {result.get('files_uploaded')}")
            print(f"📝 Update Text: {result.get('update_text')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server.")
        print("💡 Make sure to start the server with: uvicorn enhanced_main:app --reload --port 8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        # Clean up test file
        if os.path.exists("test_proof.txt"):
            os.remove("test_proof.txt")
        for file_tuple in files:
            if len(file_tuple) > 1 and hasattr(file_tuple[1][1], 'close'):
                file_tuple[1][1].close()

def test_get_updates():
    """Test getting petition updates"""
    
    ADMIN_TOKEN = "your_admin_token_here"
    PETITION_ID = 1
    
    url = f"http://localhost:8000/admin/petitions/{PETITION_ID}/updates"
    headers = {'Authorization': f'Bearer {ADMIN_TOKEN}'}
    
    try:
        print("\n🔍 Testing Get Petition Updates")
        print("=" * 50)
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            updates = response.json()
            print(f"✅ Found {len(updates)} updates:")
            
            for i, update in enumerate(updates, 1):
                print(f"\n📝 Update #{i}:")
                print(f"   Status: {update['status']}")
                print(f"   Text: {update['update_text']}")
                print(f"   Officer: {update['officer_name']}")
                print(f"   Date: {update['updated_at']}")
                print(f"   Proof Files: {len(update.get('proof_files', []))}")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("⚠️  Note: You need to update ADMIN_TOKEN and PETITION_ID before running this test")
    print("📝 To get admin token:")
    print("   1. Login as admin via /auth/admin/login")
    print("   2. Copy the access_token from the response")
    print("   3. Update ADMIN_TOKEN in this script")
    
    # Uncomment these lines after updating the token
    # test_admin_status_update()
    # test_get_updates()