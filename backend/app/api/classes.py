"""
Class management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.core.database import get_async_session
from app.models.user import User
from app.models.class_model import Class, ClassEnrollment
from app.api.auth import get_current_user
from app.schemas.classes import ClassCreate, ClassUpdate, ClassResponse, EnrollmentResponse

router = APIRouter()


@router.get("/", response_model=List[ClassResponse])
async def get_user_classes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get all classes for current user"""
    # Get user's enrollments
    result = await db.execute(
        select(Class)
        .join(ClassEnrollment)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    classes = result.scalars().all()
    
    return classes


@router.post("/", response_model=ClassResponse)
async def create_class(
    class_data: ClassCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Create a new class"""
    # Create class
    new_class = Class(
        id=str(uuid.uuid4()),
        name=class_data.name,
        code=class_data.code,
        section=class_data.section,
        semester=class_data.semester,
        description=class_data.description,
        professor=class_data.professor,
        professor_email=class_data.professor_email,
        schedule=class_data.schedule,
        location=class_data.location,
        created_by=current_user.id
    )
    
    db.add(new_class)
    
    # Auto-enroll creator
    enrollment = ClassEnrollment(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        class_id=new_class.id,
        role="student",
        ai_assistance_level=class_data.default_ai_level or "moderate"
    )
    
    db.add(enrollment)
    await db.commit()
    await db.refresh(new_class)
    
    return new_class


@router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get specific class details"""
    # Check enrollment
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == class_id)
        .where(ClassEnrollment.user_id == current_user.id)
    )
    
    if not enrollment.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this class"
        )
    
    # Get class
    class_obj = await db.get(Class, class_id)
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    return class_obj


@router.put("/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: str,
    class_data: ClassUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Update class information"""
    # Get class
    class_obj = await db.get(Class, class_id)
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if user is creator or has appropriate role
    if class_obj.created_by != current_user.id:
        enrollment = await db.execute(
            select(ClassEnrollment)
            .where(ClassEnrollment.class_id == class_id)
            .where(ClassEnrollment.user_id == current_user.id)
            .where(ClassEnrollment.role.in_(["instructor", "ta"]))
        )
        
        if not enrollment.scalar():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this class"
            )
    
    # Update fields
    for field, value in class_data.dict(exclude_unset=True).items():
        setattr(class_obj, field, value)
    
    await db.commit()
    await db.refresh(class_obj)
    
    return class_obj


@router.delete("/{class_id}")
async def delete_class(
    class_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Delete a class (soft delete by marking inactive)"""
    # Get class
    class_obj = await db.get(Class, class_id)
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if user is creator
    if class_obj.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this class"
        )
    
    # Soft delete
    class_obj.is_active = False
    
    # Also deactivate all enrollments
    enrollments = await db.execute(
        select(ClassEnrollment).where(ClassEnrollment.class_id == class_id)
    )
    for enrollment in enrollments.scalars():
        enrollment.is_active = False
    
    await db.commit()
    
    return {"message": "Class deleted successfully"}


@router.post("/{class_id}/enroll", response_model=EnrollmentResponse)
async def enroll_in_class(
    class_id: str,
    ai_assistance_level: str = "moderate",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Enroll in a class"""
    # Check if class exists
    class_obj = await db.get(Class, class_id)
    if not class_obj or not class_obj.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found or inactive"
        )
    
    # Check if already enrolled
    existing = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == class_id)
        .where(ClassEnrollment.user_id == current_user.id)
    )
    
    if existing.scalar():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this class"
        )
    
    # Create enrollment
    enrollment = ClassEnrollment(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        class_id=class_id,
        role="student",
        ai_assistance_level=ai_assistance_level
    )
    
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    
    return enrollment


@router.post("/{class_id}/unenroll")
async def unenroll_from_class(
    class_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Unenroll from a class"""
    # Get enrollment
    result = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == class_id)
        .where(ClassEnrollment.user_id == current_user.id)
    )
    
    enrollment = result.scalar()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    # Soft delete enrollment
    enrollment.is_active = False
    await db.commit()
    
    return {"message": "Successfully unenrolled from class"}