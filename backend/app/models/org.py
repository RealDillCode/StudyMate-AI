from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.base import Base

class Org(Base):
	__tablename__ = 'orgs'
	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	name = Column(String, nullable=False)
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)