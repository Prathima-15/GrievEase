import os
import bcrypt
from fastapi import FastAPI, HTTPException, Form, Depends, UploadFile, File, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine, or_
from models import Base, User, Petition, Officer
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import asyncpg
import json

class SignInRequest(BaseModel):
    email: str
    password: str


# Setup
UPLOAD_DIR = "uploaded_proofs"
DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"
SECRET_KEY = "qwesiopk"  # Replace this with a more secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 150  # Token expiry time in minutes

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Grievease API", description="API for Grievease application", version="1.0")

# After app initialization
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ===== JWT Utility =====
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="signin")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        officer_id = payload.get("officer_id")
        is_admin = payload.get("is_admin", False)
        
        if user_id is None and officer_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {
            "user_id": user_id,
            "officer_id": officer_id,
            "is_admin": is_admin
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    

# CORS setup for allowing cross-origin requests from your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Grievease API"}


@app.get("/users/")
async def get_all_users():
    db = SessionLocal()
    users = db.query(User).all()  # This fetches all users from the User table
    db.close()

    if not users:
        raise HTTPException(status_code=404, detail="No users found")

    return users


@app.delete("/users/")
def delete_all_users():
    db = SessionLocal()
    try:
        deleted = db.query(User).delete()
        db.commit()
        return {"message": f"Deleted {deleted} user(s) from the database."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting users: {str(e)}")
    finally:
        db.close()


def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


@app.post("/users/")
async def create_user(
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone_number: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    state: str = Form(None),
    district: str = Form(None),
    taluk: str = Form(None),
    id_type: str = Form(None),
    id_number: str = Form(None),
    id_proof: UploadFile = File(...)
):
    # Hash the password before saving it to the database
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Save uploaded file
    file_location = f"{UPLOAD_DIR}/{phone_number}_{id_proof.filename}"
    try:
        with open(file_location, "wb") as f:
            content = await id_proof.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    # Store user with file path and hashed password
    db = SessionLocal()
    print(f" first_name:{first_name}  Creating user with phone number: {phone_number}, email: {email}, id_type: {id_type},id_number: {id_number} state: {state} district: {district} taluk: {taluk}")
    db_user = User(
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        email=email,
        password=hashed_password.decode('utf-8'),
        state= state,
        district= district,
        taluk=taluk,
        id_type=id_type,
        id_number=id_number,
        id_proof_url=file_location
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        # Create the access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user.email, "user_id": db_user.user_id, "is_admin": False},
            expires_delta=access_token_expires
        )

        return JSONResponse(
            content={
            "acknowledged": True,
            "message": "Sign up successful",
            "token": access_token,
            "firstname": db_user.first_name,
            "email": db_user.email
            },
            status_code=200
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()
        
@app.post("/officers/")
async def create_officer(
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone_number: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    department: str = Form(...),
    designation: str = Form(...),
    state: str = Form(None),
    district: str = Form(None),
    taluk: str = Form(None),
):
    # Hash the password before saving it to the database
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Store officer with hashed password
    db = SessionLocal()
    print(f"Creating officer with name: {first_name} {last_name}, email: {email}, department: {department}, designation: {designation}")
    db_officer = Officer(
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        email=email,
        password=hashed_password.decode('utf-8'),
        department=department,
        designation=designation,
        state= state,
        district= district,
        taluk=taluk,
    )
    try:
        db.add(db_officer)
        db.commit()
        db.refresh(db_officer)
        # Create the access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_officer.email, "officer_id": db_officer.officer_id, "is_admin": True},
            expires_delta=access_token_expires
        )

        return JSONResponse(
            content={
            "acknowledged": True,
            "message": "Officer registration successful",
            "token": access_token,
            "firstname": db_officer.first_name,
            "email": db_officer.email,
            "department": db_officer.department,
            "designation": db_officer.designation,
            "state": db_officer.state,
            "district": db_officer.district,
            "taluk": db_officer.taluk,
            },
            status_code=200
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@app.post("/checkuser")
async def check_user_exists(
    email: str = Form(None),
    phone_number: str = Form(None)
):
    db = SessionLocal()
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
        print(user)
        return {"exists": bool(user)}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error checking user: {str(e)}")
    finally:
        db.close()


# API Endpoints

@app.post("/signin")
async def signin(data: SignInRequest):
    email = data.email
    password = data.password
    db = SessionLocal()
    try:
        # Fetch the user by email
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify the password
        if not verify_password(password, user.password):
            raise HTTPException(status_code=401, detail="Incorrect password")

        # Create the access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.user_id, "is_admin": False},
            expires_delta=access_token_expires
        )

        # Return the token to the user
        return {"access_token": access_token,
                "first_name": user.first_name,
                "email": user.email,
                "token_type": "bearer"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during sign-in: {str(e)}")
    finally:
        db.close()

@app.post("/admin/signin")
async def admin_signin(data: SignInRequest):
    email = data.email
    password = data.password
    db = SessionLocal()
    try:
        # Fetch the officer by email
        officer = db.query(Officer).filter(Officer.email == email).first()
        if not officer:
            raise HTTPException(status_code=404, detail="Officer not found")
        
        # Verify the password
        if not verify_password(password, officer.password):
            raise HTTPException(status_code=401, detail="Incorrect password")

        # Create the access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": officer.email, 
                "officer_id": officer.officer_id, 
                "is_admin": True,
                "department": officer.department,
                "designation": officer.designation
            },
            expires_delta=access_token_expires
        )

        # Return the token to the officer
        return {
            "access_token": access_token,
            "first_name": officer.first_name,
            "email": officer.email,
            "department": officer.department,
            "designation": officer.designation,
            "token_type": "bearer"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during officer sign-in: {str(e)}")
    finally:
        db.close()




#PETITION DATABASE ENDPOINTS

connections: Dict[int, List[WebSocket]] = {}

def serialize_petition(petition):
    # keep fields in sync with PetitionOut
    return {
        "petition_id": getattr(petition, "petition_id", None),
        "title": getattr(petition, "title", None),
        "short_description": getattr(petition, "short_description", None),
        "description": getattr(petition, "description", None),
        "department": getattr(petition, "department", None),
        "category": getattr(petition, "category", None),
        "urgency_level": getattr(petition, "urgency_level", None),
        "location": getattr(petition, "location", None),
        "proof_files": getattr(petition, "proof_files", []) or [],
        "due_date": getattr(petition, "due_date", None).isoformat() if getattr(petition, "due_date", None) else None,
        "submitted_at": getattr(petition, "submitted_at", None).isoformat() if getattr(petition, "submitted_at", None) else None,
        "status": getattr(petition, "status", None),
    }

@app.websocket("/ws/petitions/my/{user_id}")
async def petitions_ws(websocket: WebSocket, user_id: int):
    """
    WebSocket endpoint for a specific user. Clients should connect to:
      ws://<host>:<port>/ws/petitions/my/<user_id>
    (If you need auth over WS, send token after connecting or include ?token=... and validate.)
    """
    await websocket.accept()
    connections.setdefault(user_id, []).append(websocket)
    try:
        while True:
            # keep connection alive; clients may send pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        if user_id in connections and websocket in connections[user_id]:
            connections[user_id].remove(websocket)
            if not connections[user_id]:
                del connections[user_id]
    except Exception:
        if user_id in connections and websocket in connections[user_id]:
            connections[user_id].remove(websocket)
            if not connections[user_id]:
                del connections[user_id]

global_connections: List[WebSocket] = []
@app.websocket("/ws/petitions")
async def global_petitions_ws(websocket: WebSocket):
    """Global websocket; fallback for all clients."""
    await websocket.accept()
    global_connections.append(websocket)
    print("Global WS connected, total:", len(global_connections))
    try:
        while True:
            await websocket.receive_text()  # keep alive
    except WebSocketDisconnect:
        try:
            global_connections.remove(websocket)
        except ValueError:
            pass
        print("Global WS disconnected, total:", len(global_connections))
    except Exception as e:
        try:
            global_connections.remove(websocket)
        except ValueError:
            pass
        print("Global WS error:", e)

# update notify_user_petitions to also notify global clients
async def notify_user_petitions(user_id: int, petitions):
    if user_id not in connections and not global_connections:
        return

    payload = {"type": "update", "petitions": [serialize_petition(p) for p in petitions]}

    # per-user sends
    to_remove = []
    for ws in list(connections.get(user_id, [])):
        try:
            await ws.send_json(payload)
        except Exception:
            to_remove.append(ws)
    for ws in to_remove:
        try:
            connections[user_id].remove(ws)
        except ValueError:
            pass
    if user_id in connections and not connections[user_id]:
        del connections[user_id]

    # global sends (fallback)
    g_remove = []
    for ws in list(global_connections):
        try:
            await ws.send_json(payload)
        except Exception:
            g_remove.append(ws)
    for ws in g_remove:
        try:
            global_connections.remove(ws)
        except ValueError:
            pass

@app.post("/petition/submit")
async def submit_petition(
    title: str = Form(...),
    short_description: str = Form(...),
    description: str = Form(...),
    location: str = Form(None),
    proof_files: list[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=403, detail="Only regular users can submit petitions")
        
    db = SessionLocal()
    try:
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Save files
        saved_files = []
        if proof_files:
            for file in proof_files:
                try:
                    filename = f"{user_id}_{datetime.utcnow().timestamp()}_{file.filename}"
                    filepath = os.path.join(UPLOAD_DIR, filename)
                    with open(filepath, "wb") as f:
                        content = await file.read()
                        f.write(content)
                    saved_files.append(filename)
                except Exception as e:
                    print(f"Error saving file {file.filename}: {str(e)}")
                    # Continue with other files even if one fails

        # Mock AI API results
        department = "Public Works"
        category = "Infrastructure"
        urgency_level = "High"
        due_days = {"Low": 7, "Medium": 3, "High": 1}
        due_date = datetime.now(timezone.utc) + timedelta(days=due_days.get(urgency_level, 3))

        # Create Petition
        petition = Petition(
            user_id=user_id,
            title=title,
            short_description=short_description,
            description=description,
            department=department,
            category=category,
            urgency_level=urgency_level,
            location=location,
            proof_files=saved_files,  # Now passing as array directly
            due_date=due_date,
        )
        db.add(petition)
        db.commit()
        db.refresh(petition)

        # notify connected clients for this user (non-blocking)
        try:
            user_petitions = db.query(Petition).filter(Petition.user_id == user_id).order_by(Petition.submitted_at.desc()).all()
            asyncio.create_task(notify_user_petitions(user_id, user_petitions))
        except Exception as e:
            print("Failed to notify websockets:", e)

        return {"message": "Petition submitted", "petition_id": petition.petition_id}
    except Exception as e:
        db.rollback()
        print(f"Error submitting petition: {str(e)}")  # Log the error
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit petition: {str(e)}"
        )
    finally:
        db.close()


        
class PetitionOut(BaseModel):
    petition_id: int
    title: str
    short_description: str
    description: str
    department: str
    category: str
    urgency_level: str
    location: Optional[str]
    proof_files: List[str]
    due_date: datetime
    submitted_at: datetime
    status: str

    class Config:
        orm_mode = True

    @property
    def file_urls(self) -> List[str]:
        return [f"http://localhost:8000/uploads/{file}" for file in self.proof_files]

# Add this function before the get_my_petitions endpoint
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/petitions/my", response_model=List[PetitionOut])
def get_my_petitions(
    current_user: dict = Depends(get_current_user),  
    db: Session = Depends(get_db)
):
    print(current_user)
    user_id = current_user.get("user_id")  # <-- extract user_id
    if not user_id:
        raise HTTPException(status_code=403, detail="Only regular users can view their petitions")
    print(f"Fetching petitions for user_id: {user_id}")
    try:
        petitions = (
            db.query(Petition)
            .filter(Petition.user_id == user_id)
            .order_by(Petition.submitted_at.desc())
            .all()
        )
        print(f"Found {len(petitions)} petitions")
        return petitions
    except Exception as e:
        print(f"Error fetching petitions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch petitions: {str(e)}"
        )

@app.get("/petitions/{petition_id}", response_model=PetitionOut)
def get_petition(
    petition_id: int,
    current_user: dict = Depends(get_current_user),  # <-- change here
    db: Session = Depends(get_db)
):
    user_id = current_user.get("user_id")  # <-- extract user_id
    print(f"Fetching petition {petition_id} for user_id: {user_id}")
    try:
        petition = (
            db.query(Petition)
            .filter(Petition.petition_id == petition_id)
            .first()
        )
        
        if not petition:
            raise HTTPException(status_code=404, detail="Petition not found")
            
        # Check if user has access to this petition
        if petition.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this petition")
            
        print(f"Found petition: {petition.title}")
        return petition
    except Exception as e:
        print(f"Error fetching petition: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch petition: {str(e)}"
        )

@app.put("/petitions/{petition_id}/edit")
async def edit_petition(
    petition_id: int,
    title: str = Form(...),
    short_description: str = Form(...),
    description: str = Form(...),
    location: str = Form(None),
    proof_files: list[UploadFile] = File(None),
    existing_files: list[str] = Form(None),
    removed_files: list[str] = Form(None),
    current_user: dict = Depends(get_current_user),  # <-- fix here
    db: Session = Depends(get_db)
):
    try:
        user_id = current_user.get("user_id")  # <-- extract user_id
        # Get the petition
        petition = db.query(Petition).filter(Petition.petition_id == petition_id).first()
        if not petition:
            raise HTTPException(status_code=404, detail="Petition not found")
            
        # Check if user owns the petition
        if petition.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this petition")

        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Handle new files
        new_files = []
        if proof_files:
            for file in proof_files:
                try:
                    filename = f"{user_id}_{datetime.utcnow().timestamp()}_{file.filename}"
                    filepath = os.path.join(UPLOAD_DIR, filename)
                    with open(filepath, "wb") as f:
                        content = await file.read()
                        f.write(content)
                    new_files.append(filename)
                except Exception as e:
                    print(f"Error saving file {file.filename}: {str(e)}")
                    # Continue with other files even if one fails

        # Handle removed files
        if removed_files:
            for file in removed_files:
                try:
                    filepath = os.path.join(UPLOAD_DIR, file)
                    if os.path.exists(filepath):
                        os.remove(filepath)
                except Exception as e:
                    print(f"Error removing file {file}: {str(e)}")
                    # Continue with other files even if one fails

        # Update petition
        petition.title = title
        petition.short_description = short_description
        petition.description = description
        petition.location = location
        
        # Update proof files
        current_files = existing_files or []
        petition.proof_files = current_files + new_files

        db.commit()
        db.refresh(petition)

        # notify connected clients for this user (non-blocking)
        try:
            user_petitions = db.query(Petition).filter(Petition.user_id == user_id).order_by(Petition.submitted_at.desc()).all()
            asyncio.create_task(notify_user_petitions(user_id, user_petitions))
        except Exception as e:
            print("Failed to notify websockets:", e)

        return {"message": "Petition updated successfully", "petition_id": petition.petition_id}
    except Exception as e:
        db.rollback()
        print(f"Error updating petition: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update petition: {str(e)}"
        )

# ADMIN ENDPOINTS

@app.get("/admin/petitions")
def get_all_petitions_admin(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: str = None,
    department: str = None,
    skip: int = 0,
    limit: int = 100
):
    """Get all petitions for admin dashboard with filtering options"""
    officer_id = current_user.get("officer_id")
    if not officer_id:
        raise HTTPException(status_code=403, detail="Only officers can access this endpoint")
    
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
            petition_dict = serialize_petition(petition)
            petition_dict["user_name"] = f"{user.first_name} {user.last_name}" if user else "Unknown"
            petition_dict["user_email"] = user.email if user else ""
            result.append(petition_dict)
            
        return result
        
    except Exception as e:
        print(f"Error fetching admin petitions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch petitions: {str(e)}")

@app.get("/admin/statistics")
def get_admin_statistics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for admin"""
    officer_id = current_user.get("officer_id")
    if not officer_id:
        raise HTTPException(status_code=403, detail="Only officers can access this endpoint")
    
    try:
        # Get petition counts by status
        pending_count = db.query(Petition).filter(Petition.status == "open").count()
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
                "pending": pending_count,
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

@app.put("/admin/petitions/{petition_id}/status")
def update_petition_status(
    petition_id: int,
    status: str = Form(...),
    admin_comment: str = Form(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update petition status (admin only)"""
    officer_id = current_user.get("officer_id")
    if not officer_id:
        raise HTTPException(status_code=403, detail="Only officers can update petition status")
    
    try:
        petition = db.query(Petition).filter(Petition.petition_id == petition_id).first()
        if not petition:
            raise HTTPException(status_code=404, detail="Petition not found")
        
        # Validate status
        valid_statuses = ["open", "in_progress", "resolved", "rejected", "escalated"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        petition.status = status
        
        # If there's an admin comment, you might want to store it in a separate comments table
        # For now, we'll just log it
        if admin_comment:
            print(f"Admin comment for petition {petition_id}: {admin_comment}")
        
        db.commit()
        db.refresh(petition)
        
        # Notify user via websocket if they're connected
        try:
            user_petitions = db.query(Petition).filter(Petition.user_id == petition.user_id).order_by(Petition.submitted_at.desc()).all()
            asyncio.create_task(notify_user_petitions(petition.user_id, user_petitions))
        except Exception as e:
            print("Failed to notify websockets:", e)
        
        return {"message": "Status updated successfully", "petition_id": petition_id, "new_status": status}
        
    except Exception as e:
        db.rollback()
        print(f"Error updating petition status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

@app.get("/admin/users")
def get_all_users_admin(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all users for admin management"""
    officer_id = current_user.get("officer_id")
    if not officer_id:
        raise HTTPException(status_code=403, detail="Only officers can access this endpoint")
    
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
                "otp_verified": user.otp_verified,
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all officers for admin management"""
    officer_id = current_user.get("officer_id")
    if not officer_id:
        raise HTTPException(status_code=403, detail="Only officers can access this endpoint")
    
    try:
        officers = db.query(Officer).all()
        result = []
        for officer in officers:
            officer_dict = {
                "officer_id": officer.officer_id,
                "first_name": officer.first_name,
                "last_name": officer.last_name,
                "email": officer.email,
                "phone_number": officer.phone_number,
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

# Analytics endpoint for admin
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
        
        # Calculate average resolution time (mock data for now)
        avg_resolution_time = 7  # days
        
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
        
        # Recent activity (mock data)
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

@app.on_event("startup")
async def start_pg_listener():
    """
    Background task: open an asyncpg connection and LISTEN on 'petition_updates'.
    When a notification arrives, schedule notify_user_petitions or a global broadcast.
    """
    async def _listener():
        try:
            conn = await asyncpg.connect(DATABASE_URL)
            await conn.add_listener('petition_updates', _pg_notify)  # callback below
            # keep the connection alive until app shutdown
            while True:
                await asyncio.sleep(3600)
        except Exception as e:
            print("Postgres listener failed:", e)

    async def _pg_notify(connection, pid, channel, payload):
        # payload expected to be JSON text from your triggers
        try:
            obj = json.loads(payload)
        except Exception:
            obj = payload

        # if payload includes user_id, fetch that user's petitions and notify them
        user_id = None
        if isinstance(obj, dict):
            # your trigger used row_to_json(NEW) so likely includes user_id
            user_id = obj.get("user_id") or obj.get("user_id_id") or obj.get("userId")

        if user_id:
            # run DB query in threadpool to avoid blocking asyncio loop
            loop = asyncio.get_event_loop()
            def get_user_petitions():
                db = SessionLocal()
                try:
                    return db.query(Petition).filter(Petition.user_id == int(user_id)).order_by(Petition.submitted_at.desc()).all()
                finally:
                    db.close()
            try:
                petitions = await loop.run_in_executor(None, get_user_petitions)
                # notify per-user websockets (non-blocking)
                await notify_user_petitions(int(user_id), petitions)
            except Exception as e:
                print("Error fetching/notifying user petitions:", e)
        else:
            # broadcast a lightweight update message to global connections
            payload_msg = {"type": "update"}
            to_remove = []
            for ws in list(global_connections):
                try:
                    await ws.send_json(payload_msg)
                except Exception:
                    to_remove.append(ws)
            for ws in to_remove:
                try:
                    global_connections.remove(ws)
                except ValueError:
                    pass

    # start listener task
    asyncio.create_task(_listener())