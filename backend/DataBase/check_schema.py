#!/usr/bin/env python3

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database configuration
DATABASE_URL = "postgresql://postgres:1234@localhost/grievease_db"

def check_schema():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check the actual column type in the database
        result = db.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'petitions' AND column_name = 'proof_files'
        """))
        
        row = result.fetchone()
        if row:
            print(f'Column: {row[0]}, Type: {row[1]}, Nullable: {row[2]}')
        else:
            print('proof_files column not found')
            
        # Check all columns in petitions table
        result2 = db.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'petitions'
            ORDER BY ordinal_position
        """))
        
        print("\nAll columns in petitions table:")
        for col in result2.fetchall():
            print(f'  {col[0]}: {col[1]}')
            
    except Exception as e:
        print(f'Error: {e}')
    finally:
        db.close()

if __name__ == "__main__":
    check_schema()