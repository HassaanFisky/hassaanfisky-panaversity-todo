"""
Panaversity Hackathon II — Backend
SQLModel engine + session factory for Supabase PostgreSQL.
"""
from __future__ import annotations

import os
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine

_raw_url = os.getenv("DATABASE_URL", "")

if not _raw_url:
    raise RuntimeError(
        "DATABASE_URL is not set. "
        "Set it to your Supabase connection string before starting the server."
    )

# Supabase requires SSL; append if the user forgot it.
_DATABASE_URL: str = (
    _raw_url if "sslmode" in _raw_url else f"{_raw_url}?sslmode=require"
)

engine = create_engine(
    _DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={"options": "-c timezone=utc"},
)


def create_tables() -> None:
    """Create all SQLModel tables if they do not exist."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency: yields an active DB session per request."""
    with Session(engine) as session:
        yield session
