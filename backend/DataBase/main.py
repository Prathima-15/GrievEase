import os
import bcrypt
from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, or_
from models import Base, User

UPLOAD_DIR = "uploaded_proofs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"

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
        return JSONResponse(
            content={"message": "Sign up successful", "user_id": db_user.user_id,"acknowledgment":True},
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
