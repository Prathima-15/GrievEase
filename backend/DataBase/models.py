from sqlalchemy import Column, String, Integer, Boolean, TIMESTAMP, ForeignKey, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import ARRAY 
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# ✅ User Model
class User(Base):
    __tablename__ = "userdb"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone_number = Column(String(15), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    otp_verified = Column(Boolean, default=False)
    state = Column(String(100))
    district = Column(String(100))
    taluk = Column(String(100))  
    id_type = Column(String(50))  # Aadhaar, PAN, etc.
    id_number = Column(String(50))
    id_proof_url = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    petitions = relationship("Petition", back_populates="user")

# ✅ Officer Model
class Officer(Base):
    __tablename__ = "officers"

    officer_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone_number = Column(String(15), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    otp_verified = Column(Boolean, default=False)
    department = Column(String(100), nullable=False)
    designation = Column(String(100), nullable=False)
    state = Column(String(100))
    district = Column(String(100))
    taluk = Column(String(100)) 
    created_at = Column(TIMESTAMP, server_default=func.now())

class Petition(Base):
    __tablename__ = "petitions"

    petition_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("userdb.user_id"), nullable=False)
    
    title = Column(String(200), nullable=False)
    short_description = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)

    department = Column(String(100))  # AI classified
    category = Column(String(100))    # AI classified
    urgency_level = Column(String(50))  # AI classified

    location = Column(Text)  # Google Maps URL
    proof_files = Column(ARRAY(Text))  # list of uploaded file paths

    status = Column(String(50), default="open")  # open, in_progress, resolved, escalated, rejected

    submitted_at = Column(DateTime, default=func.now())
    due_date = Column(DateTime)

    user = relationship("User", back_populates="petitions")
