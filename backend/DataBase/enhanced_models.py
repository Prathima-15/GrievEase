from sqlalchemy import Column, String, Integer, Boolean, TIMESTAMP, ForeignKey, Text, DateTime, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import ARRAY 
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# 1. Users (Citizens) Table
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100))
    phone_number = Column(String(15), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(Text)
    otp_verified = Column(Boolean, default=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    taluk = Column(String(100))
    id_type = Column(String(50))
    id_number = Column(String(50), unique=True, nullable=False)
    id_proof_url = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Add check constraint for id_type
    __table_args__ = (
        CheckConstraint("id_type IN ('Aadhaar','VoterID','Passport','DrivingLicense','Other')", name='check_id_type'),
    )
    
    # Relationships (now primary user model)
    petitions = relationship("Petition", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

# 2. Departments Table
class Department(Base):
    __tablename__ = "departments"

    department_id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    
    # Relationships
    categories = relationship("Category", back_populates="department")

# 2.1. Categories Table (for AI Classification)
class Category(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(100), nullable=False)
    category_code = Column(String(50), nullable=False)  # For API consistency
    description = Column(Text)
    department_id = Column(Integer, ForeignKey("departments.department_id"), nullable=False)
    keywords = Column(ARRAY(String))  # Keywords for AI training
    priority_weight = Column(Integer, default=1)  # For AI classification confidence
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    department = relationship("Department", back_populates="categories")

# 3. Officers Table
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
    designation = Column(String(100))
    state = Column(String(100))
    district = Column(String(100))
    taluk = Column(String(100))
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Computed property for backward compatibility
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def phone(self):
        return self.phone_number
    
    # Relationships
    escalations_from = relationship("Escalation", foreign_keys="Escalation.from_officer", back_populates="from_officer_rel")
    escalations_to = relationship("Escalation", foreign_keys="Escalation.to_officer", back_populates="to_officer_rel")

# 4. Petitions Table
class Petition(Base):
    __tablename__ = "petitions"

    petition_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    short_description = Column(String(500))
    description = Column(Text, nullable=False)
    department = Column(String(100), nullable=False)  # Keep for backward compatibility
    department_id = Column(Integer, ForeignKey("departments.department_id"))  # AI classified department
    category = Column(String(100))  # Keep for backward compatibility
    category_id = Column(Integer, ForeignKey("categories.category_id"))  # AI classified category
    urgency_level = Column(String(20))
    classification_confidence = Column(Integer, default=0)  # AI confidence score (0-100)
    manually_classified = Column(Boolean, default=False)  # Officer override flag
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    taluk = Column(String(100))
    location = Column(String(255))
    proof_files = Column(ARRAY(String))  # PostgreSQL array of file URLs
    status = Column(String(20), default="submitted")
    is_public = Column("ispublic", Boolean, default=False)
    submitted_at = Column(TIMESTAMP, server_default=func.now())
    due_date = Column(TIMESTAMP)
    
    # Add check constraints
    __table_args__ = (
        CheckConstraint("urgency_level IN ('low','medium','high','critical')", name='check_urgency_level'),
        CheckConstraint("status IN ('submitted','under_review','in_progress','resolved','escalated','rejected')", name='check_status'),
    )
    
    # Relationships
    user = relationship("User", back_populates="petitions")
    department_rel = relationship("Department", foreign_keys=[department_id])
    category_rel = relationship("Category", foreign_keys=[category_id])
    evidence = relationship("PetitionEvidence", back_populates="petition")
    updates = relationship("PetitionUpdate", back_populates="petition")
    escalations = relationship("Escalation", back_populates="petition")
    notifications = relationship("Notification", back_populates="petition")

# 5. Petition Evidence Table
class PetitionEvidence(Base):
    __tablename__ = "petition_evidence"

    evidence_id = Column(Integer, primary_key=True, index=True)
    petition_id = Column(Integer, ForeignKey("petitions.petition_id", ondelete="CASCADE"))
    file_url = Column(Text, nullable=False)
    file_type = Column(String(20))
    geo_location = Column(String(100))
    uploaded_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    petition = relationship("Petition", back_populates="evidence")

# 6. Petition Updates Table
class PetitionUpdate(Base):
    __tablename__ = "petition_updates"

    update_id = Column(Integer, primary_key=True, index=True)
    petition_id = Column(Integer, ForeignKey("petitions.petition_id", ondelete="CASCADE"))
    officer_id = Column(Integer, ForeignKey("officers.officer_id"))
    update_text = Column(Text)
    proof_url = Column(Text)
    status = Column(String(20))
    updated_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    petition = relationship("Petition", back_populates="updates")
    # Note: Officer relationship removed due to schema mismatch

# 7. Escalations Table
class Escalation(Base):
    __tablename__ = "escalations"

    escalation_id = Column(Integer, primary_key=True, index=True)
    petition_id = Column(Integer, ForeignKey("petitions.petition_id", ondelete="CASCADE"))
    from_officer = Column(Integer, ForeignKey("officers.officer_id"))
    to_officer = Column(Integer, ForeignKey("officers.officer_id"))
    reason = Column(Text)
    escalated_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    petition = relationship("Petition", back_populates="escalations")
    from_officer_rel = relationship("Officer", foreign_keys=[from_officer], back_populates="escalations_from")
    to_officer_rel = relationship("Officer", foreign_keys=[to_officer], back_populates="escalations_to")

# 8. Notifications Table
class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    petition_id = Column(Integer, ForeignKey("petitions.petition_id"))
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    sent_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    petition = relationship("Petition", back_populates="notifications")

# No legacy models - using only enhanced tables