"""
Database configuration and session management
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Create async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create base class for models
Base = declarative_base()


async def get_async_session() -> AsyncSession:
    """
    Dependency to get database session
    """
    async with async_session_maker() as session:
        yield session


async def create_db_and_tables():
    """
    Create database tables
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)