from sqlalchemy import Column, DateTime, String, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
import enum
from app.db.base import Base

class ActorType(str, enum.Enum):
	system = 'system'
	employee = 'employee'
	manager = 'manager'

class AuditLog(Base):
	__tablename__ = 'audit_logs'
	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	actor_type = Column(Enum(ActorType), nullable=False)
	actor_id = Column(UUID(as_uuid=True), nullable=True)
	action = Column(String, nullable=False)
	at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
	meta = Column(JSONB, nullable=True)