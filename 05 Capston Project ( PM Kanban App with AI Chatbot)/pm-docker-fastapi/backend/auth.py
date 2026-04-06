import os
from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
from fastapi import Cookie, HTTPException

COOKIE_NAME = "session"
ALGORITHM = "HS256"
ACCESS_DAYS = 7

MVP_USERNAME = "user"
MVP_PASSWORD = "password"


def _secret() -> str:
    return os.environ.get("AUTH_SECRET", "dev-insecure-change-in-production")


def create_access_token(username: str) -> str:
    expire = datetime.now(UTC) + timedelta(days=ACCESS_DAYS)
    return jwt.encode(
        {"sub": username, "exp": expire},
        _secret(),
        algorithm=ALGORITHM,
    )


def decode_username(token: str) -> str | None:
    try:
        payload = jwt.decode(token, _secret(), algorithms=[ALGORITHM])
        sub = payload.get("sub")
        return str(sub) if isinstance(sub, str) else None
    except jwt.PyJWTError:
        return None


def require_user(session: Annotated[str | None, Cookie()] = None) -> str:
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = decode_username(session)
    if username is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return username
