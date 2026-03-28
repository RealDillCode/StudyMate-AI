"""
Main FastAPI application entry point for StudyMate AI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api import auth, classes, chats, materials, assignments, analytics
from app.core.config import settings
from app.core.database import create_db_and_tables

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle events
    """
    # Startup
    logger.info("Starting StudyMate AI Backend...")
    await create_db_and_tables()
    yield
    # Shutdown
    logger.info("Shutting down StudyMate AI Backend...")


# Create FastAPI instance
app = FastAPI(
    title="StudyMate AI",
    description="AI-powered learning platform for college students",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(classes.router, prefix="/api/classes", tags=["Classes"])
app.include_router(chats.router, prefix="/api/chats", tags=["Chats"])
app.include_router(materials.router, prefix="/api/materials", tags=["Materials"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to StudyMate AI API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}