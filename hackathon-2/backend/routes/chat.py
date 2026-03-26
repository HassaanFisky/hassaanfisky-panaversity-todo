"""
Panaversity Hackathon II — Phase III
AI chat with Groq tool_calling.
Tasks are manipulated via tool calls; history is stored in Supabase.
"""
from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Path, status
from groq import Groq
from pydantic import BaseModel
from sqlalchemy import JSON, Column
from sqlmodel import Field, Session, SQLModel, select

from auth import verify_user_matches
from database import get_session
from models import Task, TaskCreate
from routes.tasks import _get_or_404

router = APIRouter(prefix="/api/{user_id}", tags=["chat"])

_groq = Groq(api_key=os.environ["GROQ_API_KEY"])
_MODEL = "llama-3.3-70b-versatile"

# ─── Message store ────────────────────────────────────────────────────────────


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"

    id: int | None = Field(default=None, primary_key=True)
    user_id:   str = Field(nullable=False, index=True)
    role:      str = Field(nullable=False)                  # user | assistant | tool
    content:   str = Field(default="")
    tool_calls: Any | None = Field(default=None, sa_column=Column(JSON))
    tool_call_id: str | None = Field(default=None)
    name:      str | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Request / response ───────────────────────────────────────────────────────


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply:       str
    tool_calls_made: list[str]


# ─── Tool definitions ─────────────────────────────────────────────────────────

TOOLS: list[dict] = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title":       {"type": "string",  "description": "Task title (required)"},
                    "description": {"type": "string",  "description": "Optional description"},
                    "priority":    {"type": "string",  "enum": ["low", "medium", "high"]},
                    "due_date":    {"type": "string",  "description": "ISO 8601 datetime, optional"},
                    "tags":        {"type": "array", "items": {"type": "string"}},
                },
                "required": ["title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List the user's tasks, optionally filtered.",
            "parameters": {
                "type": "object",
                "properties": {
                    "completed": {"type": "boolean", "description": "true=done, false=pending, omit=all"},
                    "priority":  {"type": "string",  "enum": ["low", "medium", "high"]},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed by its ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"},
                },
                "required": ["task_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Permanently delete a task by its ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"},
                },
                "required": ["task_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update a task's title, description, priority, tags, or due date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id":     {"type": "string"},
                    "title":       {"type": "string"},
                    "description": {"type": "string"},
                    "priority":    {"type": "string", "enum": ["low", "medium", "high"]},
                    "due_date":    {"type": "string"},
                    "tags":        {"type": "array", "items": {"type": "string"}},
                },
                "required": ["task_id"],
            },
        },
    },
]

# ─── Tool executor ────────────────────────────────────────────────────────────


def _execute_tool(
    name: str,
    args: dict[str, Any],
    user_id: str,
    session: Session,
) -> str:
    """Execute a tool and return its result as a JSON string."""

    if name == "list_tasks":
        stmt = select(Task).where(Task.user_id == user_id)
        if "completed" in args:
            stmt = stmt.where(Task.completed == args["completed"])
        if "priority" in args:
            stmt = stmt.where(Task.priority == args["priority"])
        tasks = list(session.exec(stmt).all())
        return json.dumps(
            [
                {
                    "id":        t.id,
                    "title":     t.title,
                    "priority":  t.priority,
                    "completed": t.completed,
                    "due_date":  t.due_date.isoformat() if t.due_date else None,
                }
                for t in tasks
            ]
        )

    if name == "add_task":
        task = Task(
            user_id=user_id,
            title=args["title"],
            description=args.get("description"),
            priority=args.get("priority", "medium"),
            tags=args.get("tags"),
            due_date=datetime.fromisoformat(args["due_date"]) if args.get("due_date") else None,
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return json.dumps({"id": task.id, "title": task.title, "status": "created"})

    if name == "complete_task":
        task = _get_or_404(session, args["task_id"], user_id)
        task.completed = True
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        return json.dumps({"id": task.id, "title": task.title, "status": "completed"})

    if name == "delete_task":
        task = _get_or_404(session, args["task_id"], user_id)
        title = task.title
        session.delete(task)
        session.commit()
        return json.dumps({"id": args["task_id"], "title": title, "status": "deleted"})

    if name == "update_task":
        task = _get_or_404(session, args["task_id"], user_id)
        for field in ("title", "description", "priority", "tags"):
            if field in args:
                setattr(task, field, args[field])
        if "due_date" in args:
            task.due_date = datetime.fromisoformat(args["due_date"]) if args["due_date"] else None
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        return json.dumps({"id": task.id, "title": task.title, "status": "updated"})

    return json.dumps({"error": f"Unknown tool: {name}"})


# ─── Route ────────────────────────────────────────────────────────────────────


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with AI task assistant",
)
def chat(
    body: ChatRequest,
    user_id: str = Path(...),
    _verified: str = Depends(verify_user_matches),
    session: Session = Depends(get_session),
) -> ChatResponse:
    # Load history from DB
    history_rows = list(
        session.exec(
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at.asc())  # type: ignore[attr-defined]
            .limit(40)
        ).all()
    )

    messages: list[dict] = [
        {
            "role": "system",
            "content": (
                "You are a helpful task management assistant. "
                "You have access to tools to add, list, complete, delete, and update tasks. "
                "Always confirm actions before making irreversible changes. "
                "Be concise and friendly."
            ),
        }
    ]

    for row in history_rows:
        msg: dict[str, Any] = {"role": row.role, "content": row.content}
        if row.tool_calls:
            msg["tool_calls"] = row.tool_calls
        if row.tool_call_id:
            msg["tool_call_id"] = row.tool_call_id
        if row.name:
            msg["name"] = row.name
        messages.append(msg)

    # Append new user message
    messages.append({"role": "user", "content": body.message})

    # Save user message
    session.add(ChatMessage(user_id=user_id, role="user", content=body.message))
    session.commit()

    tool_calls_made: list[str] = []
    final_reply = ""

    # Agentic loop — run until no more tool calls
    while True:
        response = _groq.chat.completions.create(
            model=_MODEL,
            messages=messages,  # type: ignore[arg-type]
            tools=TOOLS,        # type: ignore[arg-type]
            tool_choice="auto",
            max_tokens=1024,
        )
        msg = response.choices[0].message

        if msg.tool_calls:
            # Add assistant tool-call message
            assistant_msg: dict[str, Any] = {
                "role":    "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {
                        "id":       tc.id,
                        "type":     "function",
                        "function": {
                            "name":      tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in msg.tool_calls
                ],
            }
            messages.append(assistant_msg)
            session.add(
                ChatMessage(
                    user_id=user_id,
                    role="assistant",
                    content=msg.content or "",
                    tool_calls=assistant_msg["tool_calls"],
                )
            )

            # Execute each tool
            for tc in msg.tool_calls:
                args = json.loads(tc.function.arguments)
                result = _execute_tool(tc.function.name, args, user_id, session)
                tool_calls_made.append(tc.function.name)

                tool_msg: dict[str, Any] = {
                    "role":         "tool",
                    "tool_call_id": tc.id,
                    "name":         tc.function.name,
                    "content":      result,
                }
                messages.append(tool_msg)
                session.add(
                    ChatMessage(
                        user_id=user_id,
                        role="tool",
                        content=result,
                        tool_call_id=tc.id,
                        name=tc.function.name,
                    )
                )

            session.commit()
            # Continue loop so model can process tool results

        else:
            # Final text response
            final_reply = msg.content or ""
            session.add(
                ChatMessage(user_id=user_id, role="assistant", content=final_reply)
            )
            session.commit()
            break

    return ChatResponse(reply=final_reply, tool_calls_made=tool_calls_made)


@router.delete(
    "/chat/history",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Clear chat history",
)
def clear_history(
    user_id: str = Path(...),
    _verified: str = Depends(verify_user_matches),
    session: Session = Depends(get_session),
) -> None:
    rows = list(session.exec(select(ChatMessage).where(ChatMessage.user_id == user_id)).all())
    for row in rows:
        session.delete(row)
    session.commit()
