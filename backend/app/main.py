from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import structlog
import os

from app.core.config import settings
from app.api.routes import auth, license, sessions, reports

logger = structlog.get_logger()
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="OptiVise API", openapi_url=f"{settings.API_PREFIX}/openapi.json")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda r, e: JSONResponse(status_code=429, content={"detail": "rate limit exceeded"}))

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.CORS_ORIGINS,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

@app.middleware("http")
async def add_request_id_and_log(request: Request, call_next):
	request_id = request.headers.get("x-request-id") or os.urandom(8).hex()
	context = structlog.contextvars.bind_contextvars(request_id=request_id)
	response = await call_next(request)
	response.headers["x-request-id"] = request_id
	structlog.contextvars.clear_contextvars()
	return response

@app.get("/health")
async def health():
	return {"status": "ok"}

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(license.router, prefix=settings.API_PREFIX)
app.include_router(sessions.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)