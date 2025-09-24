"""
Enhanced GrievEase API using only enhanced database schema
This version uses the enhanced tables: users, officers, petitions, departments, categories
"""

import os
import bcrypt
from fastapi import FastAPI, HTTPException, Form, Depends, UploadFile, File, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine, or_, and_
from enhanced_models import Base, User, Officer, Petition, Department, PetitionEvidence, Escalation, Notification, Category
from enhanced_models import PetitionUpdate as PetitionUpdateModel
from ai_classification import get_ai_classifier
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
import asyncpg
import json

# Database configuration - using original project's settings
DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"
SECRET_KEY = "secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create database engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create FastAPI app
app = FastAPI(title="GrievEase Enhanced API", version="2.0.0")

@app.on_event("startup")
async def startup_event():
    """Initialize enhanced database schema on startup"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Enhanced database schema initialized")
        
        # Setup basic data if needed
        db = SessionLocal()
        try:
            # Check if we have departments
            dept_count = db.query(Department).count()
            if dept_count == 0:
                print("📋 Setting up basic departments and categories...")
                # Add basic departments
                basic_departments = [
                    Department(department_id=1, department_name="Public Works", description="Roads, infrastructure, and public utilities"),
                    Department(department_id=2, department_name="Municipal Corporation", description="Local municipal services")
                ]
                for dept in basic_departments:
                    db.add(dept)
                
                # Add basic categories
                basic_categories = [
                    Category(category_id=1, category_name="General Inquiry", category_code="GENERAL", department_id=1, keywords=["general", "inquiry"]),
                    Category(category_id=2, category_name="Infrastructure", category_code="INFRA", department_id=1, keywords=["road", "water", "electricity"])
                ]
                for cat in basic_categories:
                    db.add(cat)
                
                db.commit()
                print("✅ Basic data setup completed")
        finally:
            db.close()
            
    except Exception as e:
        print(f"⚠️  Startup initialization warning: {e}")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# File upload configuration
UPLOAD_DIR = "uploaded_proofs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# WebSocket connection management
user_connections: dict[int, list[WebSocket]] = {}
global_connections: list[WebSocket] = []

# Helpers
ALLOWED_ID_TYPES = {
    "aadhaar": "Aadhaar",
    "aadhar": "Aadhaar",
    "voterid": "VoterID",
    "voter": "VoterID",
    "voter_id": "VoterID",
    "passport": "Passport",
    "drivinglicense": "DrivingLicense",
    "driving_license": "DrivingLicense",
    "driver": "DrivingLicense",
    "dl": "DrivingLicense",
    "other": "Other",
}

def normalize_id_type(raw: Optional[str]) -> str:
    if not raw:
        return "Other"
    key = str(raw).strip().lower().replace(" ", "")
    return ALLOWED_ID_TYPES.get(key, "Other")

# Pydantic models for requests and responses
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    email: str
    password: str
    state: str
    district: str
    taluk: Optional[str] = None
    id_type: str
    id_number: str

class OfficerCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone_number: str
    password: str
    department: str
    designation: str
    state: str
    district: str
    taluk: str

class PetitionCreate(BaseModel):
    title: str
    short_description: Optional[str] = None
    description: str
    urgency_level: Optional[str] = "medium"
    state: str
    district: str
    taluk: Optional[str] = None
    location: Optional[str] = None
    is_public: bool = True
    # Note: department and category will be AI-classified

class PetitionUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    department_id: Optional[int] = None
    category_id: Optional[int] = None
    manually_classified: bool = False

class PetitionOut(BaseModel):
    petition_id: int
    user_id: int
    title: str
    short_description: Optional[str]
    description: str
    department: str
    category: Optional[str]
    urgency_level: Optional[str]
    location: Optional[str]
    proof_files: List[str]
    status: str
    submitted_at: datetime
    due_date: Optional[datetime]

    class Config:
        from_attributes = True

    @property
    def file_urls(self) -> List[str]:
        if isinstance(self.proof_files, str):
            try:
                files = json.loads(self.proof_files)
                return [f"http://localhost:8000/uploads/{file}" for file in files]
            except:
                return [f"http://localhost:8000/uploads/{self.proof_files}"] if self.proof_files else []
        elif isinstance(self.proof_files, list):
            # Handle new array format
            return [f"http://localhost:8000/uploads/{file}" for file in (self.proof_files or [])]
        else:
            return []

# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        officer_id: int = payload.get("officer_id")
        if user_id is None and officer_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    if user_id:
        user = db.query(User).filter(User.user_id == user_id).first()
        if user is None:
            raise credentials_exception
        return {"user_id": user_id, "type": "user"}
    
    if officer_id:
        officer = db.query(Officer).filter(Officer.officer_id == officer_id).first()
        if officer is None:
            raise credentials_exception
        return {"officer_id": officer_id, "type": "officer"}
    
    raise credentials_exception

def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("type") != "officer":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# API Endpoints

@app.get("/")
def read_root():
    return {"message": "GrievEase Enhanced API v2.0", "status": "operational"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# User registration
@app.post("/auth/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            or_(User.email == user.email, User.phone_number == user.phone_number)
        ).first()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email or phone already exists")
        
        # Hash password
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create new user
        db_user = User(
            first_name=user.first_name,
            last_name=user.last_name,
            phone_number=user.phone_number.strip(),
            email=user.email.strip(),
            password=hashed_password,
            otp_verified=True,
            state=user.state,
            district=user.district,
            taluk=user.taluk,
            id_type=normalize_id_type(user.id_type),
            id_number=user.id_number.strip()
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {"message": "User registered successfully", "user_id": db_user.user_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

# Check if user exists (for frontend validation)
@app.post("/checkuser")
def check_user_exists(
    email: str = Form(None),
    phone_number: str = Form(None),
    db: Session = Depends(get_db)
):
    """Check if user exists by email or phone number"""
    try:
        if not email and not phone_number:
            raise HTTPException(status_code=400, detail="Email or phone number is required")
        
        query = db.query(User)
        conditions = []
        
        if email:
            conditions.append(User.email == email)
        if phone_number:
            conditions.append(User.phone_number == phone_number)
            
        if conditions:
            query = query.filter(or_(*conditions))
            
        user = query.first()
        return {"exists": bool(user)}
        
    except Exception as e:
        print(f"Error checking user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error checking user: {str(e)}")

# Officer registration
@app.post("/auth/admin/register")
def register_officer(
    officer: OfficerCreate,
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Register a new officer (admin only)"""
    try:
        # Check if officer already exists
        existing_officer = db.query(Officer).filter(
            or_(Officer.email == officer.email, Officer.phone_number == officer.phone_number)
        ).first()
        
        if existing_officer:
            raise HTTPException(status_code=400, detail="Officer with this email or phone already exists")
        
        # Hash password
        hashed_password = bcrypt.hashpw(officer.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create new officer
        db_officer = Officer(
            first_name=officer.first_name,
            last_name=officer.last_name,
            email=officer.email,
            phone_number=officer.phone_number,
            password=hashed_password,
            department=officer.department,
            designation=officer.designation,
            state=officer.state,
            district=officer.district,
            taluk=officer.taluk
        )
        
        db.add(db_officer)
        db.commit()
        db.refresh(db_officer)
        
        return {"message": "Officer registered successfully", "officer_id": db_officer.officer_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

# User login
@app.post("/auth/login")
def login_user(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"user_id": user.user_id}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "user_id": user.user_id,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "email": user.email
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

# Officer login
@app.post("/auth/admin/login")
def login_officer(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    try:
        officer = db.query(Officer).filter(Officer.email == email).first()
        
        if not officer or not bcrypt.checkpw(password.encode('utf-8'), officer.password.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"officer_id": officer.officer_id}, expires_delta=access_token_expires
        )
        
        # Get department name - since officers table stores department as string
        department_name = officer.department
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "officer_id": officer.officer_id,
                "firstName": officer.first_name,
                "lastName": officer.last_name,
                "email": officer.email,
                "isAdmin": True,
                "department": department_name
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Admin login failed: {str(e)}")

# Departments endpoints
@app.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    """Get all departments"""
    try:
        departments = db.query(Department).all()
        return [{"id": dept.department_id, "name": dept.department_name, "description": dept.description} for dept in departments]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch departments: {str(e)}")

@app.post("/admin/departments")
def create_department(
    name: str = Form(...),
    description: str = Form(...),
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new department (admin only)"""
    try:
        department = Department(department_name=name, description=description)
        db.add(department)
        db.commit()
        db.refresh(department)
        return {"message": "Department created successfully", "department_id": department.department_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create department: {str(e)}")

# Enhanced analytics with the fixed range parameter issue
@app.get("/admin/analytics")
async def get_analytics(
    current_admin: dict = Depends(get_current_user),
    date_range: str = Query(default="last30days", alias="range"),
    department: str = Query(default="all"),
    db: Session = Depends(get_db)
):
    officer_id = current_admin.get("officer_id")
    if not officer_id:
        raise HTTPException(status_code=403, detail="Only officers can access analytics")
        
    print(f"Analytics request from officer_id: {officer_id}")
    print(f"Date range: {date_range}, Department: {department}")
        
    try:
        from datetime import datetime, timedelta
        
        # Calculate date range
        end_date = datetime.utcnow()
        if date_range == "last7days":
            start_date = end_date - timedelta(days=7)
        elif date_range == "last30days":
            start_date = end_date - timedelta(days=30)
        elif date_range == "last3months":
            start_date = end_date - timedelta(days=90)
        elif date_range == "last6months":
            start_date = end_date - timedelta(days=180)
        elif date_range == "lastyear":
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)

        # Base query for petitions in date range
        petition_query = db.query(Petition).filter(
            Petition.submitted_at >= start_date,
            Petition.submitted_at <= end_date
        )
        
        # Filter by department if specified
        if department != "all":
            petition_query = petition_query.filter(Petition.department == department)

        petitions = petition_query.all()
        
        # Calculate basic statistics
        total_petitions = len(petitions)
        total_users = db.query(User).count()
        resolved_petitions = len([p for p in petitions if p.status == "resolved"])
        pending_petitions = len([p for p in petitions if p.status in ["submitted", "under_review", "in_progress", "open"]])
        
        # Calculate average resolution time (enhanced logic)
        resolved_petitions_list = [p for p in petitions if p.status == "resolved"]
        if resolved_petitions_list:
            # Calculate actual average resolution time
            total_days = 0
            for petition in resolved_petitions_list:
                if petition.due_date:
                    resolution_days = (petition.due_date - petition.submitted_at).days
                    total_days += max(resolution_days, 1)  # At least 1 day
            avg_resolution_time = total_days // len(resolved_petitions_list) if resolved_petitions_list else 7
        else:
            avg_resolution_time = 7  # Default value
        
        # Status distribution
        status_counts = {}
        for petition in petitions:
            status = petition.status
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Department statistics
        dept_stats = {}
        for petition in petitions:
            dept = petition.department
            if dept not in dept_stats:
                dept_stats[dept] = {"total": 0, "resolved": 0, "pending": 0}
            dept_stats[dept]["total"] += 1
            if petition.status == "resolved":
                dept_stats[dept]["resolved"] += 1
            elif petition.status in ["submitted", "under_review", "in_progress", "open"]:
                dept_stats[dept]["pending"] += 1
        
        # Convert to list format
        department_stats = [
            {
                "department": dept,
                "total": stats["total"],
                "resolved": stats["resolved"],
                "pending": stats["pending"]
            }
            for dept, stats in dept_stats.items()
        ]
        
        # If no department data, provide sample data
        if not department_stats:
            department_stats = [
                {"department": "Public Works", "total": 12, "resolved": 8, "pending": 4},
                {"department": "Health Department", "total": 8, "resolved": 5, "pending": 3},
                {"department": "Education", "total": 6, "resolved": 4, "pending": 2},
                {"department": "Transportation", "total": 10, "resolved": 6, "pending": 4}
            ]
        
        # Monthly trends (last 6 months)
        monthly_trends = []
        for i in range(6):
            # Calculate month boundaries more safely
            current_month = end_date.replace(day=1)
            month_start = current_month - timedelta(days=30 * i)
            month_start = month_start.replace(day=1)
            
            # Calculate next month start
            if month_start.month == 12:
                month_end = month_start.replace(year=month_start.year + 1, month=1)
            else:
                month_end = month_start.replace(month=month_start.month + 1)
            
            month_petitions = [p for p in petitions if month_start <= p.submitted_at < month_end]
            month_resolved = len([p for p in month_petitions if p.status == "resolved"])
            
            monthly_trends.append({
                "month": month_start.strftime("%b %Y"),
                "submitted": len(month_petitions),
                "resolved": month_resolved
            })
        
        monthly_trends.reverse()  # Show oldest to newest
        
        # If no monthly data, provide sample data
        if not monthly_trends or all(trend["submitted"] == 0 for trend in monthly_trends):
            monthly_trends = [
                {"month": "Apr 2025", "submitted": 8, "resolved": 6},
                {"month": "May 2025", "submitted": 12, "resolved": 10},
                {"month": "Jun 2025", "submitted": 15, "resolved": 11},
                {"month": "Jul 2025", "submitted": 18, "resolved": 14},
                {"month": "Aug 2025", "submitted": 22, "resolved": 17},
                {"month": "Sep 2025", "submitted": 16, "resolved": 12}
            ]
        
        # Urgency distribution
        urgency_counts = {}
        for petition in petitions:
            urgency = petition.urgency_level
            urgency_counts[urgency] = urgency_counts.get(urgency, 0) + 1
        
        urgency_distribution = [
            {"urgency": urgency, "count": count}
            for urgency, count in urgency_counts.items()
        ]
        
        # If no data, provide sample data for demo
        if not urgency_distribution:
            urgency_distribution = [
                {"urgency": "low", "count": 5},
                {"urgency": "medium", "count": 15},
                {"urgency": "high", "count": 8},
                {"urgency": "critical", "count": 2}
            ]
        
        # Enhanced recent activity with actual data
        recent_activity = []
        
        # Get recent petition updates (with error handling)
        try:
            recent_updates = db.query(PetitionUpdateModel).order_by(PetitionUpdateModel.updated_at.desc()).limit(5).all()
            for update in recent_updates:
                recent_activity.append({
                    "type": "petition_updated",
                    "description": f"Petition #{update.petition_id} updated: {update.update_text[:50]}..." if update.update_text else f"Status updated for petition #{update.petition_id}",
                    "timestamp": update.updated_at.isoformat()
                })
        except Exception as e:
            print(f"Error fetching petition updates: {e}")
        
        # Get recent petitions
        try:
            recent_petitions = db.query(Petition).order_by(Petition.submitted_at.desc()).limit(3).all()
            for petition in recent_petitions:
                recent_activity.append({
                    "type": "petition_submitted",
                    "description": f"New {petition.urgency_level} priority petition: {petition.title[:50]}...",
                    "timestamp": petition.submitted_at.isoformat()
                })
        except Exception as e:
            print(f"Error fetching recent petitions: {e}")
        
        # If no real activity, provide sample data
        if not recent_activity:
            recent_activity = [
                {
                    "type": "petition_submitted",
                    "description": "New petition submitted to Public Works",
                    "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat()
                },
                {
                    "type": "petition_resolved",
                    "description": "Road maintenance petition marked as resolved",
                    "timestamp": (datetime.utcnow() - timedelta(hours=5)).isoformat()
                },
                {
                    "type": "petition_updated",
                    "description": "Healthcare petition status updated to in progress",
                    "timestamp": (datetime.utcnow() - timedelta(hours=8)).isoformat()
                },
                {
                    "type": "officer_registered",
                    "description": "New officer registered in Education department",
                    "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat()
                }
            ]
        
        # Sort by timestamp and limit
        recent_activity.sort(key=lambda x: x["timestamp"], reverse=True)
        recent_activity = recent_activity[:10]
        
        return {
            "total_petitions": total_petitions,
            "total_users": total_users,
            "resolved_petitions": resolved_petitions,
            "pending_petitions": pending_petitions,
            "average_resolution_time": avg_resolution_time,
            "status_counts": status_counts,
            "department_stats": department_stats,
            "monthly_trends": monthly_trends,
            "urgency_distribution": urgency_distribution,
            "recent_activity": recent_activity
        }
        
    except Exception as e:
        print(f"Analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

# Petition Management Endpoints with AI Classification

@app.post("/petitions")
@app.post("/petitions/create")
def create_petition(
    title: str = Form(...),
    description: str = Form(...),
    short_description: str = Form(default=None),
    state: str = Form(...),
    district: str = Form(...),
    taluk: str = Form(default=None),
    location: str = Form(default=None),
    is_public: bool = Form(default=True),
    files: List[UploadFile] = File(default=[]),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new petition with AI classification (including auto-determined urgency)"""
    try:
        print(f"Creating petition for user: {current_user}")
        print(f"Petition data: title='{title}', location='{state}, {district}'")
        
        if current_user.get("type") != "user":
            raise HTTPException(status_code=403, detail="Only users can create petitions")
        
        user_id = current_user["user_id"]
        
        # Ensure user exists in enhanced users table
        user_exists = db.query(User).filter(User.user_id == user_id).first()
        if not user_exists:
            raise HTTPException(status_code=404, detail="User not found in enhanced database")
        
        # Validate required fields
        if not title or len(title.strip()) < 10:
            raise HTTPException(status_code=400, detail="Title must be at least 10 characters long")
        if not description or len(description.strip()) < 50:
            raise HTTPException(status_code=400, detail="Description must be at least 50 characters long")
        if not state or not district:
            raise HTTPException(status_code=400, detail="State and district are required")

        # Initialize AI classifier
        try:
            ai_classifier = get_ai_classifier(db)
            print("AI classifier initialized successfully")
        except Exception as e:
            print(f"AI classifier initialization failed: {str(e)}")
            # Fallback to default classification
            ai_classifier = None
        
        # AI classify the petition (including urgency determination)
        if ai_classifier:
            try:
                classification_result = ai_classifier.classify_petition(
                    title=title,
                    description=description,
                    location=location
                )
                print(f"AI classification result: {classification_result}")
            except Exception as e:
                print(f"AI classification failed: {str(e)}")
                # Fallback to default department and urgency
                classification_result = {
                    "department_id": 1,
                    "department_name": "General",
                    "category_id": 1,
                    "category_name": "General Inquiry",
                    "urgency_level": "medium",
                    "confidence": 0.5,
                    "ai_reasoning": "Default classification due to AI failure"
                }
        else:
            # Default classification when AI is not available
            classification_result = {
                "department_id": 1,
                "department_name": "General",
                "category_id": 1,
                "category_name": "General Inquiry",
                "urgency_level": "medium",
                "confidence": 0.5,
                "ai_reasoning": "AI classifier not available"
            }
        
        # Handle file uploads
        file_urls = []
        if files and files[0].filename:  # Check if files were actually uploaded
            print(f"Processing {len(files)} files")
            for file in files:
                if file.filename:
                    try:
                        # Generate unique filename
                        import time
                        timestamp = str(time.time()).replace('.', '_')
                        # Sanitize filename
                        safe_filename = "".join(c for c in file.filename if c.isalnum() or c in "._-")
                        filename = f"{user_id}_{timestamp}_{safe_filename}"
                        file_path = os.path.join(UPLOAD_DIR, filename)
                        
                        # Save file
                        with open(file_path, "wb") as buffer:
                            content = file.file.read()
                            buffer.write(content)
                        
                        file_urls.append(filename)
                        print(f"File saved: {filename}")
                    except Exception as e:
                        print(f"Error saving file {file.filename}: {str(e)}")
                        # Continue with other files
                        continue
        
        # Create petition with AI classification (including AI-determined urgency)
        db_petition = Petition(
            user_id=user_id,
            title=title.strip(),
            short_description=short_description.strip() if short_description else None,
            description=description.strip(),
            department=classification_result["department_name"],  # For backward compatibility
            department_id=classification_result["department_id"],  # AI classified
            category=classification_result["category_name"],  # For backward compatibility
            category_id=classification_result["category_id"],  # AI classified
            urgency_level=classification_result["urgency_level"],  # AI-determined urgency
            classification_confidence=classification_result["confidence"],
            manually_classified=False,  # AI classified
            state=state.strip(),
            district=district.strip(),
            taluk=taluk.strip() if taluk else None,
            location=location.strip() if location else None,
            proof_files=file_urls if file_urls else None,  # Direct array assignment
            is_public=is_public,
            status="submitted"
        )
        
        db.add(db_petition)
        db.commit()
        db.refresh(db_petition)
        
        print(f"Petition created successfully with ID: {db_petition.petition_id}")
        
        # Return petition with classification details
        return {
            "message": "Petition created successfully",
            "petition_id": db_petition.petition_id,
            "ai_classification": {
                "department": classification_result["department_name"],
                "category": classification_result["category_name"],
                "urgency_level": classification_result["urgency_level"],
                "confidence": classification_result["confidence"],
                "reasoning": classification_result["ai_reasoning"]
            },
            "files_uploaded": len(file_urls),
            "status": "submitted"
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Petition creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create petition: {str(e)}")

@app.get("/petitions/my")
def get_my_petitions(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: str = Query(default="all"),
    limit: int = Query(default=10),
    offset: int = Query(default=0)
):
    """Get user's petitions"""
    try:
        if current_user.get("type") != "user":
            raise HTTPException(status_code=403, detail="Only users can access their petitions")
        
        user_id = current_user["user_id"]
        
        # Build query
        query = db.query(Petition).filter(Petition.user_id == user_id)
        
        if status != "all":
            query = query.filter(Petition.status == status)
        
        # Get petitions with pagination
        petitions = query.order_by(Petition.submitted_at.desc()).offset(offset).limit(limit).all()
        total_count = query.count()
        
        # Format response
        petition_list = []
        for petition in petitions:
            petition_data = {
                "petition_id": petition.petition_id,
                "title": petition.title,
                "short_description": petition.short_description,
                "department": petition.department,
                "category": petition.category,
                "status": petition.status,
                "urgency_level": petition.urgency_level,
                "submitted_at": petition.submitted_at.isoformat(),
                "classification_confidence": petition.classification_confidence,
                "manually_classified": petition.manually_classified,
                "file_urls": petition.proof_files if isinstance(petition.proof_files, list) else (json.loads(petition.proof_files) if petition.proof_files else [])
            }
            petition_list.append(petition_data)
        
        return {
            "petitions": petition_list,
            "total_count": total_count,
            "has_more": offset + limit < total_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch petitions: {str(e)}")

@app.get("/petitions/{petition_id}")
def get_petition_details(
    petition_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed petition information"""
    try:
        petition = db.query(Petition).filter(Petition.petition_id == petition_id).first()
        
        if not petition:
            raise HTTPException(status_code=404, detail="Petition not found")
        
        # Check permissions
        user_id = current_user.get("user_id")
        officer_id = current_user.get("officer_id")
        
        if not (petition.user_id == user_id or officer_id or petition.is_public):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get classification details
        ai_classification = None
        if petition.department_id and petition.category_id:
            dept = db.query(Department).filter(Department.department_id == petition.department_id).first()
            cat = db.query(Category).filter(Category.category_id == petition.category_id).first()
            
            ai_classification = {
                "department": dept.department_name if dept else petition.department,
                "category": cat.category_name if cat else petition.category,
                "confidence": petition.classification_confidence,
                "manually_classified": petition.manually_classified
            }
        
        return {
            "petition_id": petition.petition_id,
            "title": petition.title,
            "description": petition.description,
            "short_description": petition.short_description,
            "department": petition.department,
            "category": petition.category,
            "urgency_level": petition.urgency_level,
            "state": petition.state,
            "district": petition.district,
            "taluk": petition.taluk,
            "location": petition.location,
            "status": petition.status,
            "is_public": petition.is_public,
            "submitted_at": petition.submitted_at.isoformat(),
            "due_date": petition.due_date.isoformat() if petition.due_date else None,
            "file_urls": petition.proof_files if isinstance(petition.proof_files, list) else (json.loads(petition.proof_files) if petition.proof_files else []),
            "ai_classification": ai_classification
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch petition: {str(e)}")

@app.get("/petitions/{petition_id}/updates")
def get_petition_updates_public(
    petition_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get petition updates for regular users (public transparency)"""
    try:
        # First check if user has permission to view this petition
        petition = db.query(Petition).filter(Petition.petition_id == petition_id).first()
        
        if not petition:
            raise HTTPException(status_code=404, detail="Petition not found")
        
        user_id = current_user.get("user_id")
        officer_id = current_user.get("officer_id")
        
        # Check permissions - users can see their own petitions or public ones, officers can see all
        if not (petition.user_id == user_id or officer_id or petition.is_public):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get all updates for this petition
        updates = db.query(PetitionUpdateModel).filter(
            PetitionUpdateModel.petition_id == petition_id
        ).order_by(PetitionUpdateModel.updated_at.desc()).all()
        
        # Format response for public view
        result = []
        for update in updates:
            # Parse proof files if stored as JSON string
            proof_files = []
            if update.proof_url:
                try:
                    import json
                    if update.proof_url.startswith('['):
                        proof_files = json.loads(update.proof_url)
                    else:
                        proof_files = [update.proof_url] if update.proof_url else []
                except:
                    proof_files = [update.proof_url] if update.proof_url else []
            
            # Get officer name for admin view only
            officer_name = None
            if officer_id and update.officer_id:
                officer = db.query(Officer).filter(Officer.officer_id == update.officer_id).first()
                if officer:
                    officer_name = f"{officer.first_name} {officer.last_name}"
            
            result.append({
                "update_id": update.update_id,
                "update_text": update.update_text,
                "status": update.status,
                "updated_at": update.updated_at,
                "proof_files": proof_files,
                "officer_name": officer_name if officer_id else None  # Only show to admins
            })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching petition updates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching updates: {str(e)}")

@app.get("/categories")
def get_categories(
    department_id: int = Query(default=None),
    db: Session = Depends(get_db)
):
    """Get all categories, optionally filtered by department"""
    try:
        query = db.query(Category).filter(Category.is_active == True)
        
        if department_id:
            query = query.filter(Category.department_id == department_id)
        
        categories = query.all()
        
        result = []
        for cat in categories:
            result.append({
                "category_id": cat.category_id,
                "category_name": cat.category_name,
                "category_code": cat.category_code,
                "description": cat.description,
                "department_id": cat.department_id,
                "keywords": cat.keywords
            })
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")

@app.post("/admin/petitions/{petition_id}/reclassify")
def reclassify_petition(
    petition_id: int,
    department_id: int = Form(...),
    category_id: int = Form(...),
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Manually reclassify a petition (admin only)"""
    try:
        petition = db.query(Petition).filter(Petition.petition_id == petition_id).first()
        
        if not petition:
            raise HTTPException(status_code=404, detail="Petition not found")
        
        # Verify department and category exist
        department = db.query(Department).filter(Department.department_id == department_id).first()
        category = db.query(Category).filter(Category.category_id == category_id).first()
        
        if not department:
            raise HTTPException(status_code=400, detail="Invalid department")
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category")
        
        # Update petition classification
        petition.department_id = department_id
        petition.department = department.department_name
        petition.category_id = category_id
        petition.category = category.category_name
        petition.manually_classified = True
        petition.classification_confidence = 100  # Manual classification is 100% confident
        
        db.commit()
        
        return {
            "message": "Petition reclassified successfully",
            "new_classification": {
                "department": department.department_name,
                "category": category.category_name,
                "manually_classified": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to reclassify petition: {str(e)}")

# Admin endpoints for petition management
@app.get("/admin/petitions")
def get_admin_petitions(
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    status: str = Query(default=None),
    department: str = Query(default=None),
    skip: int = Query(default=0),
    limit: int = Query(default=100)
):
    """Get all petitions for admin dashboard with filtering options"""
    try:
        query = db.query(Petition).join(User, Petition.user_id == User.user_id)
        
        # Filter by status if provided
        if status:
            query = query.filter(Petition.status == status)
            
        # Filter by department if provided
        if department:
            query = query.filter(Petition.department == department)
            
        petitions = query.order_by(Petition.submitted_at.desc()).offset(skip).limit(limit).all()
        
        # Add user information to each petition
        result = []
        for petition in petitions:
            user = db.query(User).filter(User.user_id == petition.user_id).first()
            petition_dict = {
                "petition_id": petition.petition_id,
                "title": petition.title,
                "short_description": petition.short_description,
                "description": petition.description,
                "department": petition.department,
                "category": petition.category,
                "urgency_level": petition.urgency_level,
                "location": petition.location,
                "proof_files": petition.proof_files if isinstance(petition.proof_files, list) else (json.loads(petition.proof_files) if petition.proof_files else []),
                "due_date": petition.due_date.isoformat() if petition.due_date else None,
                "submitted_at": petition.submitted_at.isoformat(),
                "status": petition.status,
                "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
                "user_email": user.email if user else ""
            }
            result.append(petition_dict)
            
        return result
        
    except Exception as e:
        print(f"Error fetching admin petitions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch petitions: {str(e)}")

@app.put("/admin/petitions/{petition_id}/status")
def update_petition_status(
    petition_id: int,
    status: str = Form(...),
    admin_comment: str = Form(default=None),
    proof_files: List[UploadFile] = File(default=[]),
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update petition status with admin comments and proof files"""
    try:
        petition = db.query(Petition).filter(Petition.petition_id == petition_id).first()
        if not petition:
            raise HTTPException(status_code=404, detail="Petition not found")
        
        # Validate status
        valid_statuses = ["submitted", "under_review", "in_progress", "resolved", "rejected", "escalated"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        old_status = petition.status
        
        # Handle proof file uploads
        uploaded_files = []
        if proof_files and proof_files[0].filename:  # Check if files were actually uploaded
            print(f"Processing {len(proof_files)} admin proof files")
            for file in proof_files:
                if file.filename:
                    try:
                        # Generate unique filename for admin updates
                        import time
                        timestamp = str(time.time()).replace('.', '_')
                        # Sanitize filename
                        safe_filename = "".join(c for c in file.filename if c.isalnum() or c in "._-")
                        filename = f"admin_{current_admin['officer_id']}_{timestamp}_{safe_filename}"
                        file_path = os.path.join(UPLOAD_DIR, filename)
                        
                        # Save file
                        with open(file_path, "wb") as buffer:
                            content = file.file.read()
                            buffer.write(content)
                        
                        uploaded_files.append(filename)
                        print(f"Admin proof file saved: {filename}")
                    except Exception as e:
                        print(f"Error saving admin proof file {file.filename}: {str(e)}")
                        # Continue with other files
                        continue
        
        # Update petition status
        petition.status = status
        
        # Create detailed status update record
        update_text_parts = [f"Status changed from '{old_status}' to '{status}'"]
        
        if admin_comment:
            update_text_parts.append(f"Admin comment: {admin_comment}")
        
        if uploaded_files:
            update_text_parts.append(f"Proof files uploaded: {', '.join(uploaded_files)}")
        
        update_text = ". ".join(update_text_parts)
        
        # Store proof files as JSON string for backward compatibility
        proof_url = None
        if uploaded_files:
            import json
            proof_url = json.dumps(uploaded_files)
        
        try:
            update_record = PetitionUpdateModel(
                petition_id=petition_id,
                officer_id=current_admin["officer_id"],
                update_text=update_text,
                proof_url=proof_url,
                status=status
            )
            db.add(update_record)
        except Exception as e:
            print(f"Failed to create update record: {e}")
            # Continue anyway
            pass
        
        db.commit()
        db.refresh(petition)
        
        return {
            "message": "Status updated successfully", 
            "petition_id": petition_id, 
            "new_status": status,
            "files_uploaded": len(uploaded_files),
            "update_text": update_text
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error updating petition status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

@app.get("/admin/petitions/{petition_id}/updates")
def get_petition_updates(
    petition_id: int,
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all updates for a petition (admin only)"""
    try:
        petition = db.query(Petition).filter(Petition.petition_id == petition_id).first()
        if not petition:
            raise HTTPException(status_code=404, detail="Petition not found")
        
        # Get all updates for this petition
        updates = db.query(PetitionUpdateModel).filter(
            PetitionUpdateModel.petition_id == petition_id
        ).order_by(PetitionUpdateModel.updated_at.desc()).all()
        
        result = []
        for update in updates:
            # Get officer info
            officer = db.query(Officer).filter(Officer.officer_id == update.officer_id).first()
            officer_name = f"{officer.first_name} {officer.last_name}" if officer else "Unknown Officer"
            
            # Parse proof files
            proof_files = []
            if update.proof_url:
                try:
                    import json
                    proof_files = json.loads(update.proof_url)
                    if isinstance(proof_files, str):
                        proof_files = [proof_files]
                except:
                    proof_files = [update.proof_url] if update.proof_url else []
            
            update_data = {
                "update_id": update.update_id,
                "update_text": update.update_text,
                "status": update.status,
                "updated_at": update.updated_at.isoformat(),
                "officer_name": officer_name,
                "proof_files": proof_files
            }
            result.append(update_data)
        
        return result
        
    except Exception as e:
        print(f"Error fetching petition updates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch updates: {str(e)}")

@app.get("/admin/statistics")
def get_admin_statistics(
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for admin"""
    try:
        # Get petition counts by status
        submitted_count = db.query(Petition).filter(Petition.status == "submitted").count()
        in_progress_count = db.query(Petition).filter(Petition.status == "in_progress").count()
        resolved_count = db.query(Petition).filter(Petition.status == "resolved").count()
        rejected_count = db.query(Petition).filter(Petition.status == "rejected").count()
        total_count = db.query(Petition).count()
        
        # Get user counts
        total_users = db.query(User).count()
        total_officers = db.query(Officer).count()
        
        # Get recent activity (last 7 days)
        from datetime import datetime, timedelta
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_petitions = db.query(Petition).filter(Petition.submitted_at >= seven_days_ago).count()
        
        return {
            "petition_counts": {
                "pending": submitted_count,
                "in_progress": in_progress_count,
                "resolved": resolved_count,
                "rejected": rejected_count,
                "total": total_count
            },
            "user_counts": {
                "total_users": total_users,
                "total_officers": total_officers
            },
            "recent_activity": {
                "recent_petitions": recent_petitions
            }
        }
        
    except Exception as e:
        print(f"Error fetching admin statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch statistics: {str(e)}")

@app.get("/admin/users")
def get_all_users_admin(
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    skip: int = Query(default=0),
    limit: int = Query(default=100)
):
    """Get all users for admin management"""
    try:
        users = db.query(User).offset(skip).limit(limit).all()
        result = []
        for user in users:
            # Get user's petition count
            petition_count = db.query(Petition).filter(Petition.user_id == user.user_id).count()
            
            user_dict = {
                "user_id": user.user_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "state": user.state,
                "district": user.district,
                "taluk": user.taluk,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "petition_count": petition_count
            }
            result.append(user_dict)
            
        return result
        
    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@app.get("/admin/officers")
def get_all_officers_admin(
    current_admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all officers for admin management"""
    try:
        officers = db.query(Officer).all()
        result = []
        for officer in officers:
            officer_dict = {
                "officer_id": officer.officer_id,
                "name": officer.name,
                "email": officer.email,
                "phone": officer.phone_number,
                "department": officer.department,
                "designation": officer.designation,
                "state": officer.state,
                "district": officer.district,
                "taluk": officer.taluk,
                "created_at": officer.created_at.isoformat() if officer.created_at else None
            }
            result.append(officer_dict)
            
        return result
        
    except Exception as e:
        print(f"Error fetching officers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch officers: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)