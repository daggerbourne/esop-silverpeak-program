# routers/auth.py
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session

from auth.auth_handler import (
    authenticate_user, 
    ACCESS_TOKEN_EXPIRE_MINUTES, 
    create_access_token, 
    get_user, 
    get_password_hash,
    get_current_admin_user
)
from database import get_db
from schemas import Token, UserCreate, UserResponse
from models import User

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register_user(
    user: UserCreate, 
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)  # Only admins can register new users
):
    """Register a new user (admin only)"""
    # Check if username already exists
    db_user = get_user(db, user.username)
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=400, 
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login endpoint - returns JWT token"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")
