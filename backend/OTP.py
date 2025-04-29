import random
import aiosmtplib
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os
import time

# Load environment variables from .env file
load_dotenv()

app = FastAPI()
otp_store = {}

# Use environment variables for email credentials
root_email = os.getenv("ROOT_EMAIL")
root_pass = os.getenv("ROOT_PASS")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    email: EmailStr

@app.post("/send-otp")
async def send_otp(request: EmailRequest):
    otp = str(random.randint(100000, 999999))
    otp_store[request.email] = {"otp": otp, "timestamp": time.time()}

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 400px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 24px;">
        <h2 style="color: #2a4365;">Your OTP Code</h2>
        <p style="font-size: 16px; color: #333;">Use the following One-Time Password (OTP) to complete your sign-in:</p>
        <div style="font-size: 32px; font-weight: bold; color: #3182ce; letter-spacing: 8px; margin: 24px 0;">{otp}</div>
        <p style="font-size: 14px; color: #666;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #aaa;">Griev-ease Team</p>
        </div>
    </body>
    </html>
    """
    message = MIMEText(html_content, "html")
    message["Subject"] = "Your OTP Code"
    message["From"] = root_email
    message["To"] = request.email

    try:
        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",  # Correct hostname
            port=587,
            start_tls=True,
            username=root_email,
            password=root_pass,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"message": "OTP sent"}

@app.post("/verify-otp")
def verify_otp(email: str = Body(...), otp: str = Body(...)):
    otp_data = otp_store.get(email)
    if otp_data:
        if time.time() - otp_data["timestamp"] > 300:  # 300 seconds = 5 minutes
            del otp_store[email]
            raise HTTPException(status_code=400, detail="OTP expired")
        if otp_data["otp"] == otp:
            del otp_store[email]
            return {"message": "OTP verified",
                    "acknowledgment":True}
    raise HTTPException(status_code=400, detail={"message": "Invalid OTP", "acknowledgment": False})
