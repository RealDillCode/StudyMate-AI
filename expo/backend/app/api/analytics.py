"""
Analytics and progress tracking API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_async_session
from app.models.user import User, UserProfile
from app.models.class_model import ClassEnrollment
from app.models.assignment import AssignmentSubmission
from app.models.chat import ChatSession, ChatMessage
from app.api.auth import get_current_user
from app.schemas.analytics import (
    StudyStatsResponse,
    ClassProgressResponse,
    WritingAnalyticsResponse
)

router = APIRouter()


@router.get("/study-stats", response_model=StudyStatsResponse)
async def get_study_stats(
    time_range: str = "week",  # week, month, semester
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get overall study statistics for user"""
    # Calculate date range
    now = datetime.utcnow()
    if time_range == "week":
        start_date = now - timedelta(days=7)
    elif time_range == "month":
        start_date = now - timedelta(days=30)
    else:  # semester
        start_date = now - timedelta(days=120)
    
    # Get study time from enrollments
    enrollments = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    
    total_study_minutes = sum([e.study_time_minutes for e in enrollments.scalars()])
    
    # Get assignment statistics
    submissions = await db.execute(
        select(AssignmentSubmission)
        .where(AssignmentSubmission.user_id == current_user.id)
        .where(AssignmentSubmission.submitted_at >= start_date)
    )
    
    submissions_list = list(submissions.scalars())
    assignments_completed = len([s for s in submissions_list if s.status == "completed"])
    assignments_in_progress = len([s for s in submissions_list if s.status == "in_progress"])
    
    # Calculate average score
    graded_submissions = [s for s in submissions_list if s.score is not None]
    average_score = (
        sum([s.score for s in graded_submissions]) / len(graded_submissions)
        if graded_submissions else 0
    )
    
    # Get AI usage statistics
    ai_sessions = await db.execute(
        select(func.count(ChatSession.id))
        .where(ChatSession.user_id == current_user.id)
        .where(ChatSession.created_at >= start_date)
    )
    ai_session_count = ai_sessions.scalar()
    
    # Get message count and tokens used
    messages = await db.execute(
        select(
            func.count(ChatMessage.id),
            func.sum(ChatMessage.tokens_used)
        )
        .join(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .where(ChatMessage.created_at >= start_date)
    )
    
    message_count, total_tokens = messages.first()
    
    # Get class count
    active_classes = await db.execute(
        select(func.count(ClassEnrollment.id))
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    class_count = active_classes.scalar()
    
    return StudyStatsResponse(
        total_study_hours=total_study_minutes / 60,
        assignments_completed=assignments_completed,
        assignments_in_progress=assignments_in_progress,
        average_score=average_score,
        ai_sessions=ai_session_count or 0,
        ai_messages=message_count or 0,
        tokens_used=total_tokens or 0,
        active_classes=class_count or 0,
        time_range=time_range
    )


@router.get("/class/{class_id}/progress", response_model=ClassProgressResponse)
async def get_class_progress(
    class_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get detailed progress for a specific class"""
    # Verify enrollment
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    
    enrollment_obj = enrollment.scalar()
    if not enrollment_obj:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this class"
        )
    
    # Get assignment progress
    submissions = await db.execute(
        select(AssignmentSubmission)
        .join(Assignment)
        .where(Assignment.class_id == class_id)
        .where(AssignmentSubmission.user_id == current_user.id)
    )
    
    submissions_list = list(submissions.scalars())
    
    # Calculate metrics
    total_assignments = len(submissions_list)
    completed_assignments = len([s for s in submissions_list if s.status == "completed"])
    
    # Calculate grade
    graded = [s for s in submissions_list if s.score is not None and s.assignment.total_points]
    if graded:
        total_earned = sum([s.score for s in graded])
        total_possible = sum([s.assignment.total_points for s in graded])
        current_grade = (total_earned / total_possible) * 100 if total_possible > 0 else 0
    else:
        current_grade = None
    
    # Get chat activity
    chat_sessions = await db.execute(
        select(func.count(ChatSession.id))
        .where(ChatSession.class_id == class_id)
        .where(ChatSession.user_id == current_user.id)
    )
    chat_count = chat_sessions.scalar()
    
    # Get topics and knowledge gaps from enrollment
    topics_covered = enrollment_obj.topics_covered or []
    knowledge_gaps = enrollment_obj.knowledge_gaps or []
    
    return ClassProgressResponse(
        class_id=class_id,
        enrollment_date=enrollment_obj.enrollment_date,
        current_grade=current_grade or enrollment_obj.current_grade,
        attendance_rate=enrollment_obj.attendance_rate,
        participation_score=enrollment_obj.participation_score,
        assignments_completed=completed_assignments,
        assignments_total=total_assignments,
        study_time_hours=enrollment_obj.study_time_minutes / 60,
        chat_sessions=chat_count or 0,
        topics_covered=topics_covered,
        knowledge_gaps=knowledge_gaps,
        ai_assistance_level=enrollment_obj.ai_assistance_level
    )


@router.get("/writing-analytics", response_model=WritingAnalyticsResponse)
async def get_writing_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get writing style analytics for user"""
    # Get writing styles
    styles = await db.execute(
        select(WritingStyle)
        .where(WritingStyle.user_id == current_user.id)
        .where(WritingStyle.is_active == True)
    )
    
    styles_list = list(styles.scalars())
    
    if not styles_list:
        return WritingAnalyticsResponse(
            total_styles=0,
            total_samples=0,
            average_complexity=0,
            average_formality=0,
            most_common_tone=[],
            improvement_suggestions=["Upload writing samples to create your first style profile"]
        )
    
    # Calculate analytics
    total_samples = sum([s.sample_count for s in styles_list])
    avg_complexity = sum([s.vocabulary_complexity for s in styles_list if s.vocabulary_complexity]) / len(styles_list)
    avg_formality = sum([s.formality_level for s in styles_list if s.formality_level]) / len(styles_list)
    
    # Get most common tones
    all_tones = []
    for style in styles_list:
        if style.tone_attributes:
            all_tones.extend(style.tone_attributes)
    
    # Count tone frequencies
    tone_counts = {}
    for tone in all_tones:
        tone_counts[tone] = tone_counts.get(tone, 0) + 1
    
    most_common_tones = sorted(tone_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Generate suggestions
    suggestions = []
    if avg_complexity < 0.3:
        suggestions.append("Consider using more varied vocabulary to enhance your writing")
    if avg_formality < 0.5:
        suggestions.append("For academic writing, try increasing formality level")
    if total_samples < 10:
        suggestions.append("Upload more writing samples for better style analysis")
    
    return WritingAnalyticsResponse(
        total_styles=len(styles_list),
        total_samples=total_samples,
        average_complexity=avg_complexity,
        average_formality=avg_formality,
        most_common_tone=[t[0] for t in most_common_tones],
        improvement_suggestions=suggestions
    )


@router.post("/track-activity")
async def track_activity(
    activity_type: str,
    class_id: Optional[str] = None,
    duration_minutes: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Track user study activity"""
    if class_id:
        # Update class-specific study time
        enrollment = await db.execute(
            select(ClassEnrollment)
            .where(ClassEnrollment.class_id == class_id)
            .where(ClassEnrollment.user_id == current_user.id)
        )
        
        enrollment_obj = enrollment.scalar()
        if enrollment_obj and duration_minutes:
            enrollment_obj.study_time_minutes += duration_minutes
            await db.commit()
    
    # Update user profile stats
    profile = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    
    profile_obj = profile.scalar()
    if profile_obj and duration_minutes:
        profile_obj.total_study_hours += duration_minutes / 60
        await db.commit()
    
    return {"message": "Activity tracked successfully"}