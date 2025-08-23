import os
import bcrypt
from fastapi import FastAPI, HTTPException, Form, Depends, UploadFile, File
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
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"Fetching petitions for user_id: {current_user}")
    try:
        petitions = (
            db.query(Petition)
            .filter(Petition.user_id == current_user)
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
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"Fetching petition {petition_id} for user_id: {current_user}")
    try:
        petition = (
            db.query(Petition)
            .filter(Petition.petition_id == petition_id)
            .first()
        )
        
        if not petition:
            raise HTTPException(status_code=404, detail="Petition not found")
            
        # Check if user has access to this petition
        if petition.user_id != current_user:
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
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get the petition
        petition = db.query(Petition).filter(Petition.petition_id == petition_id).first()
        if not petition:
            raise HTTPException(status_code=404, detail="Petition not found")
            
        # Check if user owns the petition
        if petition.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to edit this petition")

        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Handle new files
        new_files = []
        if proof_files:
            for file in proof_files:
                try:
                    filename = f"{current_user}_{datetime.utcnow().timestamp()}_{file.filename}"
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

        return {"message": "Petition updated successfully", "petition_id": petition.petition_id}
    except Exception as e:
        db.rollback()
        print(f"Error updating petition: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update petition: {str(e)}"
        )