"""
Panaversity Hackathon II — Backend
Task CRUD router.
All routes are scoped to /api/{user_id}/tasks and require a valid JWT.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlmodel import Session, select

from auth import verify_user_matches
from database import get_session
from models import Task, TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/api/{user_id}", tags=["tasks"])


# ─── List ─────────────────────────────────────────────────────────────────────


@router.get(
    "/tasks",
    response_model=list[TaskResponse],
    summary="List tasks",
)
def list_tasks(
    user_id: str = Path(...),
    completed: Optional[bool] = Query(default=None, description="Filter by completion status"),
    priority: Optional[str] = Query(default=None, description="Filter: low | medium | high"),
    search: Optional[str] = Query(default=None, description="Full-text search on title & description"),
    _verified: str = Depends(verify_user_matches),
    session: Session = Depends(get_session),
) -> list[Task]:
    stmt = select(Task).where(Task.user_id == user_id)
    if completed is not None:
        stmt = stmt.where(Task.completed == completed)
    if priority and priority in ("low", "medium", "high"):
        stmt = stmt.where(Task.priority == priority)
    stmt = stmt.order_by(Task.created_at.desc())  # type: ignore[attr-defined]

    tasks: list[Task] = list(session.exec(stmt).all())

    if search:
        q = search.lower()
        tasks = [
            t
            for t in tasks
            if q in t.title.lower()
            or (t.description and q in t.description.lower())
        ]
    return tasks


# ─── Create ───────────────────────────────────────────────────────────────────


@router.post(
    "/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create task",
)
def create_task(
    body: TaskCreate,
    user_id: str = Path(...),
    _verified: str = Depends(verify_user_matches),
    session: Session = Depends(get_session),
) -> Task:
    task = Task(**body.model_dump(), user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


# ─── Read one ─────────────────────────────────────────────────────────────────


@router.get(
    "/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Get single task",
)
def get_task(
    user_id: str = Path(...),
    task_id: str = Path(...),
    _verified: str = Depends(verify_user_matches),
    session: Session = Depends(get_session),
) -> Task:
    task = _get_or_404(session, task_id, user_id)
    return task


# ─── Full update ──────────────────────────────────────────────────────────────


@router.put(
    "/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Replace task (full update)",
)
def replace_task(
    body: TaskUpdate,
    user_id: str = Path(...),
    task_id: str = Path(...),
    _verified: str = Depends(verify_user_matches),
    session: Session = Depends(get_session),
) -> Task:
    task = _get_or_404(session, task_id, user_id)
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


# ─── Mark complete ────────────────────────────────────────────────────────────


@router.patch(
    "/tasks/{task_id}/complete",
    response_model=TaskResponse,
    summary="Mark task as completed",
)
def complete_task(
    user_id: str = Path(...),
    task_id: str = Path(...),
    _verified: str = Depends(verify_user_matches),
    session: Session = Depends(get_session),
) -> Task:
    task = _get_or_404(session, task_id, user_id)
    task.completed = True
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


# ─── Mark incomplete ──────────────────────────────────────────────────────────


@router.patch(
    "/tasks/{task_id}/uncomplete",
    response_model=TaskResponse,
    summary="Mark task as incomplete",
)
def uncomplete_task(
    user_id: str = Path(...),
    task_id: str = Path(...),
    _verified: str = Depends(verify_user_matches),
    session: Session = Depends(get_session),
) -> Task:
    task = _get_or_404(session, task_id, user_id)
    task.completed = False
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


# ─── Delete ───────────────────────────────────────────────────────────────────


@router.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task",
)
def delete_task(
    user_id: str = Path(...),
    task_id: str = Path(...),
    _verified: str = Depends(verify_user_matches),
    session: Session = Depends(get_session),
) -> None:
    task = _get_or_404(session, task_id, user_id)
    session.delete(task)
    session.commit()


# ─── Internal ─────────────────────────────────────────────────────────────────


def _get_or_404(session: Session, task_id: str, user_id: str) -> Task:
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task '{task_id}' not found.",
        )
    return task
