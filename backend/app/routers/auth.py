from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.auth import get_current_user, require_user, hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.Token)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user. Default role is student."""
    # Check if user already exists
    existing = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Verify enrollment number if registering as a student
    if user_data.role == "student" and user_data.enrollment_no:
        student = (
            db.query(models.Student)
            .filter(models.Student.enrollment_number == user_data.enrollment_no)
            .first()
        )
        if not student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No student record found with enrollment number {user_data.enrollment_no}"
            )
            
    db_user = models.User(
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
        enrollment_no=user_data.enrollment_no,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    token = create_access_token(data={"sub": db_user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role,
        "username": db_user.username,
        "enrollment_no": db_user.enrollment_no,
    }


@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Log in and retrieve JWT access token."""
    user = db.query(models.User).filter(models.User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    token = create_access_token(data={"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "enrollment_no": user.enrollment_no,
    }


@router.get("/me")
def get_me(current_user: models.User = Depends(require_user)):
    """Retrieve logged-in user profile."""
    return {
        "username": current_user.username,
        "role": current_user.role,
        "enrollment_no": current_user.enrollment_no,
    }
