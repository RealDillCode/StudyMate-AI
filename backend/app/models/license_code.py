from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.base import Base

class LicenseCode(Base):
	__tablename__ = 'license_codes'
	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	org_id = Column(UUID(as_uuid=True), ForeignKey('orgs.id', ondelete='CASCADE'), nullable=False)
	code = Column(String, unique=True, nullable=False, index=True)
	expires_at = Column(DateTime(timezone=True), nullable=True)
	is_used = Column(Boolean, default=False, nullable=False)
	used_by_employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id'), nullable=True)
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)