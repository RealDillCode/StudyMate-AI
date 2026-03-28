"""
Assignment management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import uuid
import json

from app.core.database import get_async_session
from app.models.user import User
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.class_model import ClassEnrollment, Class
from app.api.auth import get_current_user
from app.schemas.assignment import (
    AssignmentCreate, AssignmentUpdate, AssignmentResponse,
    SubmissionCreate, SubmissionUpdate, SubmissionResponse
)
from app.services.file_service import FileService
from app.services.video_processor import VideoProcessor
from app.tasks import process_instruction_video

router = APIRouter()


@router.get("/class/{class_id}", response_model=List[AssignmentResponse])
async def get_class_assignments(
    class_id: str,
    include_completed: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get all assignments for a class"""
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
    
    # Get assignments
    query = select(Assignment).where(
        Assignment.class_id == class_id,
        Assignment.is_published == True
    )
    
    if not include_completed:
        # Filter out completed assignments for this user
        subquery = select(AssignmentSubmission.assignment_id).where(
            AssignmentSubmission.user_id == current_user.id,
            AssignmentSubmission.status == "completed"
        )
        query = query.where(~Assignment.id.in_(subquery))
    
    query = query.order_by(Assignment.due_date)
    
    result = await db.execute(query)
    assignments = result.scalars().all()
    
    return assignments


@router.post("/", response_model=AssignmentResponse)
async def create_assignment(
    assignment_data: AssignmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Create a new assignment (instructor/TA only)"""
    # Verify instructor/TA role
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == assignment_data.class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.role.in_(["instructor", "ta"]))
    )
    
    if not enrollment.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors and TAs can create assignments"
        )
    
    # Create assignment
    assignment = Assignment(
        id=str(uuid.uuid4()),
        class_id=assignment_data.class_id,
        created_by=current_user.id,
        title=assignment_data.title,
        description=assignment_data.description,
        instructions=assignment_data.instructions,
        assignment_type=assignment_data.assignment_type,
        category=assignment_data.category,
        assigned_date=assignment_data.assigned_date or datetime.utcnow(),
        due_date=assignment_data.due_date,
        total_points=assignment_data.total_points,
        grading_rubric=assignment_data.grading_rubric,
        allowed_ai_level=assignment_data.allowed_ai_level,
        ai_restrictions=assignment_data.ai_restrictions or [],
        is_published=assignment_data.is_published
    )
    
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    
    return assignment


@router.post("/{assignment_id}/upload-instructions")
async def upload_instruction_video(
    assignment_id: str,
    video: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Upload instruction video for assignment"""
    # Get assignment
    assignment = await db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Verify permissions
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == assignment.class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.role.in_(["instructor", "ta"]))
    )
    
    if not enrollment.scalar() and assignment.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to upload instructions for this assignment"
        )
    
    # Save video file
    file_service = FileService()
    video_path = await file_service.save_file(
        file=video,
        user_id=current_user.id,
        class_id=assignment.class_id,
        subfolder="assignment_videos"
    )
    
    # Update assignment
    assignment.instruction_video_path = video_path
    await db.commit()
    
    # Queue for processing (transcription, etc.)
    process_instruction_video.delay(assignment_id)
    
    return {"message": "Instruction video uploaded and queued for processing"}


@router.get("/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get specific assignment details"""
    assignment = await db.get(Assignment, assignment_id)
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Verify enrollment
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == assignment.class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    
    if not enrollment.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this assignment"
        )
    
    return assignment


@router.get("/{assignment_id}/submission", response_model=SubmissionResponse)
async def get_my_submission(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get current user's submission for an assignment"""
    submission = await db.execute(
        select(AssignmentSubmission)
        .where(AssignmentSubmission.assignment_id == assignment_id)
        .where(AssignmentSubmission.user_id == current_user.id)
    )
    
    submission = submission.scalar()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No submission found for this assignment"
        )
    
    return submission


@router.post("/{assignment_id}/submit", response_model=SubmissionResponse)
async def submit_assignment(
    assignment_id: str,
    submission_data: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Submit or update assignment submission"""
    # Get assignment
    assignment = await db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Verify enrollment
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == assignment.class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    
    enrollment_obj = enrollment.scalar()
    if not enrollment_obj:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this class"
        )
    
    # Check if submission exists
    existing = await db.execute(
        select(AssignmentSubmission)
        .where(AssignmentSubmission.assignment_id == assignment_id)
        .where(AssignmentSubmission.user_id == current_user.id)
    )
    
    submission = existing.scalar()
    
    if submission:
        # Update existing submission
        submission.content = submission_data.content
        submission.file_paths = submission_data.file_paths or []
        submission.status = "completed"
        submission.submitted_at = datetime.utcnow()
        submission.is_late = datetime.utcnow() > assignment.due_date if assignment.due_date else False
        submission.version += 1
        
        # Track AI usage
        submission.ai_assistance_used = submission_data.ai_assistance_used
        submission.ai_assistance_level = enrollment_obj.ai_assistance_level
        submission.ai_generated_percentage = submission_data.ai_generated_percentage
    else:
        # Create new submission
        submission = AssignmentSubmission(
            id=str(uuid.uuid4()),
            assignment_id=assignment_id,
            user_id=current_user.id,
            content=submission_data.content,
            file_paths=submission_data.file_paths or [],
            ai_assistance_used=submission_data.ai_assistance_used,
            ai_assistance_level=enrollment_obj.ai_assistance_level,
            ai_generated_percentage=submission_data.ai_generated_percentage,
            status="completed",
            submitted_at=datetime.utcnow(),
            is_late=datetime.utcnow() > assignment.due_date if assignment.due_date else False
        )
        
        db.add(submission)
    
    await db.commit()
    await db.refresh(submission)
    
    return submission


@router.put("/{assignment_id}/submission/progress")
async def update_submission_progress(
    assignment_id: str,
    progress_percentage: float,
    time_spent_minutes: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Update submission progress (for tracking work in progress)"""
    # Get or create submission
    existing = await db.execute(
        select(AssignmentSubmission)
        .where(AssignmentSubmission.assignment_id == assignment_id)
        .where(AssignmentSubmission.user_id == current_user.id)
    )
    
    submission = existing.scalar()
    
    if not submission:
        # Create draft submission
        submission = AssignmentSubmission(
            id=str(uuid.uuid4()),
            assignment_id=assignment_id,
            user_id=current_user.id,
            status="in_progress",
            progress_percentage=progress_percentage,
            time_spent_minutes=time_spent_minutes
        )
        db.add(submission)
    else:
        submission.progress_percentage = progress_percentage
        submission.time_spent_minutes = time_spent_minutes
        submission.status = "in_progress" if progress_percentage < 100 else "completed"
    
    await db.commit()
    
    return {"message": "Progress updated", "progress": progress_percentage}