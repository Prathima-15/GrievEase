from sqlalchemy import Column, String, Integer, Boolean, TIMESTAMP, create_engine, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "userdb"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone_number = Column(String(15), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)  # Store hashed passwords
    otp_verified = Column(Boolean, default=False)
    state = Column(String(100))
    district = Column(String(100))
    taluk = Column(String(100))  # Updated field from 'maavattam' to 'district'
    id_type = Column(String(50))  # Aadhaar, PAN, Voter ID, etc.
    id_number = Column(String(50))
    id_proof_url = Column(Text)  # URL or path to photo or PDF
    created_at = Column(TIMESTAMP, server_default=func.now())
