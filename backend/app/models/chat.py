"""
Chat session and message models
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, JSON, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
import enum


class MessageRole(enum.Enum):
    """Message role enumeration"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatSession(Base):
    """Chat session for a specific class"""
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    
    # Session Information
    title = Column(String)
    description = Column(Text)
    
    # Context
    context_materials = Column(JSON, default=[])  # List of material IDs being referenced
    assignment_id = Column(String, ForeignKey("assignments.id"))  # If related to specific assignment
    
    # AI Settings for this session
    ai_assistance_level = Column(String)
    custom_instructions = Column(Text)
    
    # Analytics
    message_count = Column(Integer, default=0)
    total_tokens_used = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    class_obj = relationship("Class", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    assignment = relationship("Assignment", back_populates="chat_sessions")


class ChatMessage(Base):
    """Individual chat messages"""
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    
    # Message Content
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    
    # Metadata
    tokens_used = Column(Integer)
    model_used = Column(String)
    
    # Attachments and References
    attachments = Column(JSON, default=[])  # File attachments
    citations = Column(JSON, default=[])  # References to materials
    
    # Feedback
    helpful = Column(Boolean)  # User feedback
    feedback_text = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")