from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.db.base import Base

class RoleEnum(str, enum.Enum):
	employee = 'employee'
	manager = 'manager'

class Employee(Base):
	__tablename__ = 'employees'
	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	org_id = Column(UUID(as_uuid=True), ForeignKey('orgs.id', ondelete='CASCADE'), nullable=False)
	email = Column(String, unique=True, nullable=False, index=True)
	password_hash = Column(String, nullable=False)
	role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.employee)
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)