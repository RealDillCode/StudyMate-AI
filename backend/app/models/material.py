"""
Course material models
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, JSON, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Material(Base):
    """Course materials (textbooks, notes, videos, etc.)"""
    __tablename__ = "materials"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    uploaded_by = Column(String, ForeignKey("users.id"), nullable=False)
    
    # File Information
    title = Column(String, nullable=False)
    description = Column(Text)
    file_type = Column(String)  # pdf, docx, video, etc.
    file_size = Column(Integer)  # in bytes
    file_path = Column(String)  # S3 or local path
    
    # For videos
    duration_seconds = Column(Integer)  # For video/audio files
    transcript = Column(Text)  # Transcribed content
    
    # Content Processing
    is_processed = Column(Boolean, default=False)
    processing_status = Column(String, default="pending")  # pending, processing, completed, failed
    processing_error = Column(Text)
    
    # Metadata
    metadata = Column(JSON, default={})  # Store extracted metadata
    tags = Column(JSON, default=[])
    
    # Vector Embeddings Info
    embedding_count = Column(Integer, default=0)
    last_embedded = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    class_obj = relationship("Class", back_populates="materials")
    chunks = relationship("MaterialChunk", back_populates="material", cascade="all, delete-orphan")


class MaterialChunk(Base):
    """Chunks of materials for vector search"""
    __tablename__ = "material_chunks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    material_id = Column(String, ForeignKey("materials.id"), nullable=False)
    
    # Content
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer)  # Order in the original document
    
    # For PDFs/Documents
    page_number = Column(Integer)
    
    # For Videos
    start_time = Column(Float)  # in seconds
    end_time = Column(Float)
    
    # Vector Embedding
    embedding_id = Column(String)  # ID in vector database
    embedding_model = Column(String)
    
    # Metadata
    metadata = Column(JSON, default={})
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    material = relationship("Material", back_populates="chunks")