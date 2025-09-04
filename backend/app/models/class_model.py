"""
Class and enrollment models
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, JSON, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Class(Base):
    """Class/Course model"""
    __tablename__ = "classes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Basic Information
    name = Column(String, nullable=False)
    code = Column(String)  # e.g., "CS101"
    section = Column(String)  # e.g., "001"
    semester = Column(String)  # e.g., "Fall 2024"
    
    # Details
    description = Column(Text)
    professor = Column(String)
    professor_email = Column(String)
    
    # Schedule
    schedule = Column(JSON)  # Store days and times
    location = Column(String)
    
    # Settings
    ai_settings = Column(JSON, default={})  # Class-specific AI settings
    grading_scale = Column(JSON)  # Store grading scale information
    
    # Metadata
    created_by = Column(String, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    enrollments = relationship("ClassEnrollment", back_populates="class_obj", cascade="all, delete-orphan")
    materials = relationship("Material", back_populates="class_obj", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="class_obj", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="class_obj", cascade="all, delete-orphan")


class ClassEnrollment(Base):
    """Student enrollment in classes"""
    __tablename__ = "class_enrollments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    
    # Enrollment Details
    enrollment_date = Column(DateTime(timezone=True), server_default=func.now())
    role = Column(String, default="student")  # student, ta, instructor
    
    # Progress Tracking
    current_grade = Column(Float)
    attendance_rate = Column(Float)
    participation_score = Column(Float)
    
    # Learning Progress
    topics_covered = Column(JSON, default=[])  # List of covered topics
    knowledge_gaps = Column(JSON, default=[])  # Identified areas needing improvement
    study_time_minutes = Column(Integer, default=0)
    
    # AI Assistance Settings (per class)
    ai_assistance_level = Column(String, default="moderate")
    custom_ai_instructions = Column(Text)  # Custom instructions for this class
    
    # Status
    is_active = Column(Boolean, default=True)
    completed = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="enrollments")
    class_obj = relationship("Class", back_populates="enrollments")