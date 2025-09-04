"""
Assignment and submission models
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, JSON, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Assignment(Base):
    """Class assignments"""
    __tablename__ = "assignments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Assignment Information
    title = Column(String, nullable=False)
    description = Column(Text)
    instructions = Column(Text)
    
    # Type and Category
    assignment_type = Column(String)  # homework, quiz, exam, project, paper
    category = Column(String)  # problem_set, essay, lab, etc.
    
    # Files
    attachment_paths = Column(JSON, default=[])  # List of file paths
    resource_links = Column(JSON, default=[])  # External resources
    
    # Screen Recording
    instruction_video_path = Column(String)  # Path to instruction video
    instruction_video_transcript = Column(Text)
    
    # Dates
    assigned_date = Column(DateTime(timezone=True))
    due_date = Column(DateTime(timezone=True))
    
    # Grading
    total_points = Column(Float)
    grading_rubric = Column(JSON)  # Structured rubric
    
    # AI Assistance Settings
    allowed_ai_level = Column(String, default="full")  # Override class default
    ai_restrictions = Column(JSON, default=[])  # Specific restrictions
    
    # Status
    is_published = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    class_obj = relationship("Class", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="assignment")


class AssignmentSubmission(Base):
    """Student assignment submissions"""
    __tablename__ = "assignment_submissions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    assignment_id = Column(String, ForeignKey("assignments.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Submission Content
    content = Column(Text)  # Text submission
    file_paths = Column(JSON, default=[])  # Submitted files
    
    # AI Assistance Tracking
    ai_assistance_used = Column(Boolean, default=False)
    ai_assistance_level = Column(String)
    ai_interaction_count = Column(Integer, default=0)
    ai_generated_percentage = Column(Float)  # Percentage of AI-generated content
    
    # Progress Tracking
    status = Column(String, default="not_started")  # not_started, in_progress, completed, graded
    progress_percentage = Column(Float, default=0.0)
    time_spent_minutes = Column(Integer, default=0)
    
    # Submission Details
    submitted_at = Column(DateTime(timezone=True))
    is_late = Column(Boolean, default=False)
    
    # Grading
    score = Column(Float)
    feedback = Column(Text)
    graded_at = Column(DateTime(timezone=True))
    graded_by = Column(String, ForeignKey("users.id"))
    
    # Version Control
    version = Column(Integer, default=1)
    previous_versions = Column(JSON, default=[])  # Store previous submission versions
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    user = relationship("User", back_populates="assignments")