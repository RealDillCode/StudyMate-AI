"""
Material upload and management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
import os
from pathlib import Path

from app.core.database import get_async_session
from app.core.config import settings
from app.models.user import User
from app.models.material import Material, MaterialChunk
from app.models.class_model import ClassEnrollment
from app.api.auth import get_current_user
from app.schemas.material import MaterialResponse, MaterialChunkResponse
from app.services.file_service import FileService
from app.services.document_processor import DocumentProcessor
from app.tasks import process_material_async

router = APIRouter()


@router.get("/class/{class_id}", response_model=List[MaterialResponse])
async def get_class_materials(
    class_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get all materials for a class"""
    # Verify enrollment
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    
    if not enrollment.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this class"
        )
    
    # Get materials
    result = await db.execute(
        select(Material)
        .where(Material.class_id == class_id)
        .order_by(Material.created_at.desc())
    )
    
    materials = result.scalars().all()
    return materials


@router.post("/upload", response_model=MaterialResponse)
async def upload_material(
    class_id: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Upload a new material"""
    # Verify enrollment
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    
    if not enrollment.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this class"
        )
    
    # Validate file
    file_extension = Path(file.filename).suffix.lower()[1:]
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_extension} not allowed"
        )
    
    if file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum of {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
        )
    
    # Save file
    file_service = FileService()
    file_path = await file_service.save_file(
        file=file,
        user_id=current_user.id,
        class_id=class_id
    )
    
    # Create material record
    material = Material(
        id=str(uuid.uuid4()),
        class_id=class_id,
        uploaded_by=current_user.id,
        title=title,
        description=description,
        file_type=file_extension,
        file_size=file.size,
        file_path=file_path,
        is_processed=False,
        processing_status="pending"
    )
    
    db.add(material)
    await db.commit()
    await db.refresh(material)
    
    # Queue for processing
    process_material_async.delay(material.id)
    
    return material


@router.get("/{material_id}", response_model=MaterialResponse)
async def get_material(
    material_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get specific material details"""
    material = await db.get(Material, material_id)
    
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    # Verify enrollment in class
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == material.class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    
    if not enrollment.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this material"
        )
    
    return material


@router.delete("/{material_id}")
async def delete_material(
    material_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Delete a material"""
    material = await db.get(Material, material_id)
    
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    # Check if user is uploader or has appropriate permissions
    if material.uploaded_by != current_user.id:
        enrollment = await db.execute(
            select(ClassEnrollment)
            .where(ClassEnrollment.class_id == material.class_id)
            .where(ClassEnrollment.user_id == current_user.id)
            .where(ClassEnrollment.role.in_(["instructor", "ta"]))
        )
        
        if not enrollment.scalar():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this material"
            )
    
    # Delete file
    file_service = FileService()
    await file_service.delete_file(material.file_path)
    
    # Delete from database
    await db.delete(material)
    await db.commit()
    
    return {"message": "Material deleted successfully"}


@router.get("/{material_id}/chunks", response_model=List[MaterialChunkResponse])
async def get_material_chunks(
    material_id: str,
    page: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get processed chunks of a material"""
    # Verify access to material
    material = await db.get(Material, material_id)
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == material.class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    
    if not enrollment.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this material"
        )
    
    # Get chunks
    query = select(MaterialChunk).where(MaterialChunk.material_id == material_id)
    
    if page is not None:
        query = query.where(MaterialChunk.page_number == page)
    
    query = query.order_by(MaterialChunk.chunk_index)
    
    result = await db.execute(query)
    chunks = result.scalars().all()
    
    return chunks


@router.post("/{material_id}/reprocess")
async def reprocess_material(
    material_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Reprocess a material (re-extract text, create embeddings, etc.)"""
    material = await db.get(Material, material_id)
    
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    # Verify permissions
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == material.class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.role.in_(["instructor", "ta", "student"]))
    )
    
    if not enrollment.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to reprocess this material"
        )
    
    # Reset processing status
    material.is_processed = False
    material.processing_status = "pending"
    material.processing_error = None
    
    # Delete existing chunks
    await db.execute(
        select(MaterialChunk).where(MaterialChunk.material_id == material_id)
    )
    
    await db.commit()
    
    # Queue for reprocessing
    process_material_async.delay(material_id)
    
    return {"message": "Material queued for reprocessing"}