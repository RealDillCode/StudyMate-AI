from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.base import Base

class Session(Base):
	__tablename__ = 'sessions'
	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)
	org_id = Column(UUID(as_uuid=True), ForeignKey('orgs.id', ondelete='CASCADE'), nullable=False)
	start_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
	end_at = Column(DateTime(timezone=True), nullable=True)