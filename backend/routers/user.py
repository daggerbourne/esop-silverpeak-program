# routers/user.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from auth.auth_handler import (
    get_current_active_user,
    get_current_admin_user,
    get_password_hash,
    verify_password,
    get_user_by_id
)
from database import get_db
from schemas import UserResponse, UserUpdate, PasswordReset, PasswordResetAdmin
from models import User

router = APIRouter()


@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return current_user


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)
):
    """List all users (admin only)"""
    users = db.query(User).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)
):
    """Get user by ID (admin only)"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)
):
    """Update user details (admin only)"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.email is not None:
        # Check if email is already taken by another user
        existing_email = db.query(User).filter(
            User.email == user_update.email,
            User.id != user_id
        ).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = user_update.email
    
    if user_update.role is not None:
        user.role = user_update.role
    
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/me/reset-password")
async def reset_own_password(
    password_data: PasswordReset,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Reset current user's own password"""
    if not password_data.current_password:
        raise HTTPException(
            status_code=400,
            detail="Current password is required"
        )
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}


@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    password_data: PasswordResetAdmin,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user)
):
    """Reset any user's password (admin only)"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": f"Password reset successfully for user {user.username}"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a user (admin only)"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user.username} deleted successfully"}
