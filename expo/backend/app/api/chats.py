"""
Chat API endpoints with AI integration
"""
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
import json
from datetime import datetime

from app.core.database import get_async_session
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage, MessageRole
from app.models.class_model import ClassEnrollment
from app.api.auth import get_current_user
from app.schemas.chat import ChatSessionCreate, ChatMessageCreate, ChatSessionResponse, ChatMessageResponse
from app.services.ai_service import AIService
from app.services.vector_service import VectorService

router = APIRouter()


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    class_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get all chat sessions for user, optionally filtered by class"""
    query = select(ChatSession).where(ChatSession.user_id == current_user.id)
    
    if class_id:
        query = query.where(ChatSession.class_id == class_id)
    
    result = await db.execute(query.order_by(ChatSession.last_activity.desc()))
    sessions = result.scalars().all()
    
    return sessions


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    session_data: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Create a new chat session"""
    # Verify enrollment in class
    enrollment = await db.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == session_data.class_id)
        .where(ClassEnrollment.user_id == current_user.id)
        .where(ClassEnrollment.is_active == True)
    )
    
    if not enrollment.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this class"
        )
    
    # Create session
    session = ChatSession(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        class_id=session_data.class_id,
        title=session_data.title or "New Chat Session",
        description=session_data.description,
        context_materials=session_data.context_materials or [],
        assignment_id=session_data.assignment_id,
        ai_assistance_level=session_data.ai_assistance_level or enrollment.scalar().ai_assistance_level,
        custom_instructions=session_data.custom_instructions
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get specific chat session"""
    session = await db.get(ChatSession, session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this chat session"
        )
    
    return session


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    session_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get messages for a chat session"""
    # Verify session ownership
    session = await db.get(ChatSession, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    # Get messages
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    
    messages = result.scalars().all()
    return list(reversed(messages))  # Return in chronological order


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: str,
    message_data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Send a message and get AI response"""
    # Verify session ownership
    session = await db.get(ChatSession, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    # Create user message
    user_message = ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role=MessageRole.USER,
        content=message_data.content,
        attachments=message_data.attachments or []
    )
    
    db.add(user_message)
    
    # Get AI service
    ai_service = AIService(db)
    vector_service = VectorService()
    
    # Get context from materials if specified
    context = ""
    if session.context_materials:
        # Retrieve relevant chunks from vector database
        relevant_chunks = await vector_service.search(
            query=message_data.content,
            material_ids=session.context_materials,
            limit=5
        )
        context = "\n\n".join([chunk.content for chunk in relevant_chunks])
    
    # Get recent messages for context
    recent_messages = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
    )
    
    message_history = [
        {"role": msg.role.value, "content": msg.content}
        for msg in reversed(recent_messages.scalars().all())
    ]
    
    # Generate AI response
    ai_response = await ai_service.generate_response(
        message=message_data.content,
        message_history=message_history,
        context=context,
        assistance_level=session.ai_assistance_level,
        custom_instructions=session.custom_instructions
    )
    
    # Create AI message
    ai_message = ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role=MessageRole.ASSISTANT,
        content=ai_response["content"],
        tokens_used=ai_response.get("tokens_used"),
        model_used=ai_response.get("model"),
        citations=ai_response.get("citations", [])
    )
    
    db.add(ai_message)
    
    # Update session stats
    session.message_count += 2
    session.total_tokens_used += ai_response.get("tokens_used", 0)
    session.last_activity = datetime.utcnow()
    
    await db.commit()
    await db.refresh(ai_message)
    
    return ai_message


@router.websocket("/ws/{session_id}")
async def websocket_chat(
    websocket: WebSocket,
    session_id: str,
    db: AsyncSession = Depends(get_async_session)
):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()
    
    try:
        # Verify session exists
        session = await db.get(ChatSession, session_id)
        if not session:
            await websocket.send_text(json.dumps({
                "error": "Session not found"
            }))
            await websocket.close()
            return
        
        ai_service = AIService(db)
        vector_service = VectorService()
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Create user message
            user_message = ChatMessage(
                id=str(uuid.uuid4()),
                session_id=session_id,
                role=MessageRole.USER,
                content=message_data["content"]
            )
            
            db.add(user_message)
            await db.commit()
            
            # Send acknowledgment
            await websocket.send_text(json.dumps({
                "type": "user_message",
                "id": user_message.id,
                "content": user_message.content
            }))
            
            # Get context if needed
            context = ""
            if session.context_materials:
                relevant_chunks = await vector_service.search(
                    query=message_data["content"],
                    material_ids=session.context_materials,
                    limit=5
                )
                context = "\n\n".join([chunk.content for chunk in relevant_chunks])
            
            # Generate AI response (streaming)
            async for chunk in ai_service.generate_streaming_response(
                message=message_data["content"],
                context=context,
                assistance_level=session.ai_assistance_level
            ):
                await websocket.send_text(json.dumps({
                    "type": "ai_chunk",
                    "content": chunk
                }))
            
            # Save complete AI response
            # (Implementation depends on how streaming response is accumulated)
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()


@router.put("/messages/{message_id}/feedback")
async def update_message_feedback(
    message_id: str,
    helpful: bool,
    feedback_text: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Update feedback for a message"""
    # Get message
    message = await db.get(ChatMessage, message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Verify ownership through session
    session = await db.get(ChatSession, message.session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this message"
        )
    
    # Update feedback
    message.helpful = helpful
    message.feedback_text = feedback_text
    
    await db.commit()
    
    return {"message": "Feedback updated successfully"}