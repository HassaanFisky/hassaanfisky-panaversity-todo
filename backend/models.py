"""
Panaversity Hackathon II — Backend
SQLModel ORM models + Pydantic request/response schemas.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


# ─── ORM Table ───────────────────────────────────────────────────────────────


class Task(SQLModel, table=True):
    """Persisted task row in Supabase PostgreSQL."""

    __tablename__ = "tasks"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    user_id: str = Field(nullable=False, index=True)
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = Field(default=False)
    priority: str = Field(default="medium")                   # low | medium | high
    tags: Optional[list] = Field(default=None, sa_column=Column(JSON))  # stored as JSON array
    due_date: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Request schemas ──────────────────────────────────────────────────────────


class TaskCreate(SQLModel):
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = False
    priority: str = "medium"
    tags: Optional[list[str]] = None
    due_date: Optional[datetime] = None


class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    tags: Optional[list[str]] = None
    due_date: Optional[datetime] = None


class TaskPatch(SQLModel):
    """Used for PATCH /complete — only flips the completed flag."""
    completed: bool = True


# ─── Response schema ──────────────────────────────────────────────────────────


class TaskResponse(SQLModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    priority: str
    tags: Optional[list[str]]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
