import os
import bcrypt
from fastapi import FastAPI, HTTPException, Form, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, or_
from models import Base, User
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel

class SignInRequest(BaseModel):
    email: str
    password: str


# Setup
UPLOAD_DIR = "uploaded_proofs"
DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"
SECRET_KEY = "qwesiopk"  # Replace this with a more secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Token expiry time in minutes

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Grievease API", description="API for Grievease application", version="1.0")


# CORS setup for allowing cross-origin requests from your React app
from fastapi.middleware.cors import CORSMiddleware
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
            data={"sub": db_user.email}, expires_delta=access_token_expires
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

        return {"exists": bool(user)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking user: {str(e)}")
    finally:
        db.close()


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

# JWT Utility Functions

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)  # Default to 15 minutes
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

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
            data={"sub": user.email}, expires_delta=access_token_expires
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
