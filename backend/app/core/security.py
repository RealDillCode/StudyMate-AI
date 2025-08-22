from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from argon2 import PasswordHasher

from app.core.config import settings

hasher = PasswordHasher()
oauth2_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
	return hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
	try:
		return hasher.verify(password_hash, password)
	except Exception:
		return False


def create_access_token(sub: str) -> str:
	exp = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.ACCESS_TTL_MIN)
	payload = {"sub": sub, "exp": exp}
	return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def create_refresh_token(sub: str) -> str:
	exp = datetime.now(tz=timezone.utc) + timedelta(days=settings.REFRESH_TTL_DAYS)
	payload = {"sub": sub, "exp": exp, "type": "refresh"}
	return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def get_current_user_id(creds: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme)) -> str:
	if not creds or creds.scheme.lower() != 'bearer':
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Not authenticated')
	try:
		payload = jwt.decode(creds.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
		return str(payload.get('sub'))
	except Exception:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')