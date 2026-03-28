"""
Database models for StudyMate AI
"""
from app.models.user import User, UserProfile
from app.models.class_model import Class, ClassEnrollment
from app.models.chat import ChatSession, ChatMessage
from app.models.material import Material, MaterialChunk
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.writing_style import WritingStyle, WritingSample

__all__ = [
    "User",
    "UserProfile",
    "Class",
    "ClassEnrollment",
    "ChatSession",
    "ChatMessage",
    "Material",
    "MaterialChunk",
    "Assignment",
    "AssignmentSubmission",
    "WritingStyle",
    "WritingSample"
]