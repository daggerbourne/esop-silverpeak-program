# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, User, UserRole
import os

# Allow database path to be configured via environment variable for Docker
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./esop.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database and create default admin user"""
    # Import here to avoid circular import
    from auth.auth_handler import get_password_hash
    
    Base.metadata.create_all(bind=engine)
    
    # Create default admin user if it doesn't exist
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            default_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
            admin = User(
                username="admin",
                email="admin@esop.local",
                hashed_password=get_password_hash(default_password),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"✓ Default admin user created (username: admin, password: {default_password})")
        else:
            print("✓ Admin user already exists")
    finally:
        db.close()
