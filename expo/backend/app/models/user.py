"""
User model and authentication
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    
    first_name = Column(String)
    last_name = Column(String)
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    enrollments = relationship("ClassEnrollment", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    assignments = relationship("AssignmentSubmission", back_populates="user", cascade="all, delete-orphan")
    writing_styles = relationship("WritingStyle", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    """User profile with additional information"""
    __tablename__ = "user_profiles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, unique=True, index=True)
    
    # Academic Information
    university = Column(String)
    major = Column(String)
    year = Column(Integer)  # 1-4 for undergrad, 5+ for grad
    gpa = Column(String)
    
    # Preferences
    preferred_ai_level = Column(String, default="moderate")  # minimal, moderate, full, autonomous
    study_preferences = Column(JSON, default={})  # Store various study preferences
    
    # Learning Analytics
    total_study_hours = Column(Integer, default=0)
    assignments_completed = Column(Integer, default=0)
    average_assignment_score = Column(Integer)
    
    # Settings
    timezone = Column(String, default="UTC")
    notification_preferences = Column(JSON, default={})
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="profile")