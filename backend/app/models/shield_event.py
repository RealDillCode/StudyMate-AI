from sqlalchemy import Column, DateTime, ForeignKey, String, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
import enum
from app.db.base import Base

class ShieldEventType(str, enum.Enum):
	attempt = 'attempt'
	bypass = 'bypass'
	grace = 'grace'

class ShieldEvent(Base):
	__tablename__ = 'shield_events'
	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	session_id = Column(UUID(as_uuid=True), ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False)
	event_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
	type = Column(Enum(ShieldEventType), nullable=False)
	app_token = Column(String, nullable=True)
	category = Column(String, nullable=True)
	notes = Column(String, nullable=True)