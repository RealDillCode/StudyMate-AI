"""
Writing style analysis and mimicry models
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, JSON, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class WritingStyle(Base):
    """User's writing style profile"""
    __tablename__ = "writing_styles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Style Name
    name = Column(String, nullable=False)  # e.g., "Academic", "Casual", "Technical"
    description = Column(Text)
    
    # Linguistic Features
    vocabulary_complexity = Column(Float)  # 0-1 scale
    sentence_length_avg = Column(Float)
    sentence_length_std = Column(Float)
    
    # Style Characteristics
    formality_level = Column(Float)  # 0-1 scale (0=informal, 1=formal)
    technical_level = Column(Float)  # 0-1 scale
    
    # Common Patterns
    common_phrases = Column(JSON, default=[])
    transition_words = Column(JSON, default=[])
    vocabulary_preferences = Column(JSON, default={})
    
    # Grammar Patterns
    grammar_patterns = Column(JSON, default={})
    punctuation_style = Column(JSON, default={})
    
    # Paragraph Structure
    paragraph_length_avg = Column(Float)
    paragraph_structure = Column(JSON, default={})
    
    # Tone and Voice
    tone_attributes = Column(JSON, default=[])  # e.g., ["professional", "friendly", "analytical"]
    voice_type = Column(String)  # active, passive, mixed
    
    # Training Data
    sample_count = Column(Integer, default=0)
    last_trained = Column(DateTime(timezone=True))
    training_status = Column(String, default="pending")  # pending, training, completed
    
    # Model Information
    model_path = Column(String)  # Path to fine-tuned model or parameters
    accuracy_score = Column(Float)
    
    # Settings
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="writing_styles")
    samples = relationship("WritingSample", back_populates="style", cascade="all, delete-orphan")


class WritingSample(Base):
    """Writing samples for style analysis"""
    __tablename__ = "writing_samples"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    style_id = Column(String, ForeignKey("writing_styles.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Sample Information
    title = Column(String)
    content = Column(Text, nullable=False)
    
    # Source
    source_type = Column(String)  # assignment, essay, email, note, etc.
    class_id = Column(String, ForeignKey("classes.id"))
    assignment_id = Column(String, ForeignKey("assignments.id"))
    
    # Analysis Results
    word_count = Column(Integer)
    sentence_count = Column(Integer)
    paragraph_count = Column(Integer)
    
    # Extracted Features
    features = Column(JSON, default={})  # Detailed linguistic features
    
    # Quality Metrics
    quality_score = Column(Float)  # 0-1 scale
    is_validated = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    style = relationship("WritingStyle", back_populates="samples")