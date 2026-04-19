"""
Panaversity Hackathon II — Backend
JWT authentication via python-jose.

Tokens are issued by Better Auth (frontend) and verified here using the
shared BETTER_AUTH_SECRET. Algorithm: HS256.
"""
from __future__ import annotations

import os

from fastapi import Depends, HTTPException, Path, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

_SECRET: str = os.getenv("BETTER_AUTH_SECRET", "")
_ALGORITHM = "HS256"

_bearer_scheme = HTTPBearer(auto_error=True)


# ─── Token helpers ────────────────────────────────────────────────────────────


def _decode(token: str) -> dict:
    """
    Decode and verify a Better Auth JWT.
    Raises HTTP 401 on any failure.
    """
    if not _SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server auth misconfiguration: BETTER_AUTH_SECRET not set.",
        )
    try:
        return jwt.decode(
            token,
            _SECRET,
            algorithms=[_ALGORITHM],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# ─── Dependencies ─────────────────────────────────────────────────────────────


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> str:
    """
    FastAPI dependency — extracts and returns the authenticated user's ID.
    Better Auth JWT typically uses 'sub' for the user ID.
    """
    payload = _decode(credentials.credentials)
    # Better Auth may use 'sub', 'userId', or 'id' depending on plugin config.
    user_id: str | None = (
        payload.get("sub") or payload.get("userId") or payload.get("id")
    )
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing user identifier.",
        )
    return str(user_id)


async def verify_user_matches(
    user_id: str = Path(...),
    token_user_id: str = Depends(get_current_user_id),
) -> str:
    """
    FastAPI dependency — ensures the JWT's user ID matches the path parameter.
    Prevents user A from accessing user B's tasks.
    """
    if token_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource.",
        )
    return token_user_id
