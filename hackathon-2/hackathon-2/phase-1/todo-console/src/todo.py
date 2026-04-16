"""
Panaversity Hackathon II — Phase I
In-memory Todo manager with full CRUD operations.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import uuid


VALID_PRIORITIES = ("low", "medium", "high")


@dataclass
class Task:
    title: str
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    description: str = ""
    completed: bool = False
    priority: str = "medium"
    tags: list[str] = field(default_factory=list)
    due_date: Optional[str] = None
    created_at: str = field(
        default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    updated_at: str = field(
        default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M")
    )

    def __post_init__(self) -> None:
        if self.priority not in VALID_PRIORITIES:
            self.priority = "medium"

    def to_dict(self) -> dict[str, object]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "priority": self.priority,
            "tags": self.tags,
            "due_date": self.due_date,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class TaskNotFoundError(Exception):
    """Raised when a task ID does not exist in the store."""


class TodoManager:
    """In-memory todo manager. Thread-unsafe by design (single-user CLI)."""

    def __init__(self) -> None:
        self._store: dict[str, Task] = {}

    # ── Write operations ────────────────────────────────────────────────────

    def add(
        self,
        title: str,
        description: str = "",
        priority: str = "medium",
        tags: list[str] | None = None,
        due_date: Optional[str] = None,
    ) -> Task:
        """Create and store a new task. Returns the created task."""
        if not title.strip():
            raise ValueError("Task title cannot be empty.")
        task = Task(
            title=title.strip(),
            description=description.strip(),
            priority=priority if priority in VALID_PRIORITIES else "medium",
            tags=tags or [],
            due_date=due_date or None,
        )
        self._store[task.id] = task
        return task

    def delete(self, task_id: str) -> Task:
        """Remove a task by ID. Raises TaskNotFoundError if not found."""
        task = self._require(task_id)
        del self._store[task_id]
        return task

    def update(self, task_id: str, **kwargs: object) -> Task:
        """
        Update writable fields of a task.
        Raises TaskNotFoundError if not found.
        """
        task = self._require(task_id)
        _READONLY = {"id", "created_at"}
        for key, value in kwargs.items():
            if key in _READONLY:
                continue
            if not hasattr(task, key):
                continue
            if key == "priority" and value not in VALID_PRIORITIES:
                continue
            setattr(task, key, value)
        task.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M")
        return task

    def complete(self, task_id: str) -> Task:
        """Mark a task as completed."""
        return self.update(task_id, completed=True)

    def uncomplete(self, task_id: str) -> Task:
        """Mark a task as not completed."""
        return self.update(task_id, completed=False)

    # ── Read operations ─────────────────────────────────────────────────────

    def get(self, task_id: str) -> Task:
        """Fetch a single task. Raises TaskNotFoundError if not found."""
        return self._require(task_id)

    def list_all(
        self,
        *,
        filter_status: Optional[bool] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
    ) -> list[Task]:
        """
        Return tasks with optional filters.

        Args:
            filter_status: True = completed only, False = pending only, None = all.
            priority: Filter by 'low' | 'medium' | 'high'.
            search: Case-insensitive substring match on title and description.
        """
        tasks: list[Task] = list(self._store.values())

        if filter_status is not None:
            tasks = [t for t in tasks if t.completed == filter_status]

        if priority and priority in VALID_PRIORITIES:
            tasks = [t for t in tasks if t.priority == priority]

        if search:
            q = search.lower()
            tasks = [
                t
                for t in tasks
                if q in t.title.lower() or q in t.description.lower()
            ]

        return sorted(tasks, key=lambda t: t.created_at, reverse=True)

    def stats(self) -> dict[str, int]:
        """Return total / completed / pending counts."""
        all_tasks = list(self._store.values())
        completed = sum(1 for t in all_tasks if t.completed)
        return {
            "total": len(all_tasks),
            "completed": completed,
            "pending": len(all_tasks) - completed,
        }

    # ── Internal ─────────────────────────────────────────────────────────────

    def _require(self, task_id: str) -> Task:
        task = self._store.get(task_id.strip())
        if task is None:
            raise TaskNotFoundError(f"No task with ID '{task_id}'")
        return task
