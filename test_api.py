# Base URL of your FastAPI application
BASE_URL = "http://localhost:8000"

def test_send_otp(email):
    response = requests.post(f"{BASE_URL}/send-otp", json={"email": email})
    if response.status_code == 200:
        print("OTP sent successfully:", response.json())
    else:
        print("Failed to send OTP:", response.json())

def test_verify_otp(email, otp):
    response = requests.post(f"{BASE_URL}/verify-otp", json={"email": email, "otp": otp})
    if response.status_code == 200:
        print("OTP verified successfully:", response.json())
    else:
        print("Failed to verify OTP:", response.json())

if __name__ == "__main__":
    test_email = "test@example.com"
    
    # Test sending OTP
    test_send_otp(test_email)
    
    # Manually input the OTP received in the email for testing
    test_otp = input("Enter the OTP received in the email: ")
    
    # Test verifying OTP
    test_verify_otp(test_email, test_otp)