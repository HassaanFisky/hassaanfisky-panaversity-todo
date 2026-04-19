"""
Panaversity Hackathon II — Phase V
Recurring Task Service.

Subscribes to 'task-completed' via Dapr pubsub.
When a completed task has {"recurring": true, "interval_days": N} in its description,
auto-creates the next occurrence due N days from now.

Run: uvicorn main:app --host 0.0.0.0 --port $PORT
"""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timedelta
from typing import Any

import httpx
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("recurring-service")

app = FastAPI(title="Recurring Task Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_BACKEND_URL   = os.getenv("BACKEND_URL", "http://localhost:8000")
_SERVICE_TOKEN = os.getenv("SERVICE_TOKEN", "")
_PUBSUB        = os.getenv("DAPR_PUBSUB_NAME", "kafka-pubsub")


def _extract(body: dict[str, Any]) -> dict[str, Any]:
    data = body.get("data") or body
    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return {}
    return data if isinstance(data, dict) else {}


async def _get_task(task_id: str, user_id: str) -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(
                f"{_BACKEND_URL}/api/{user_id}/tasks/{task_id}",
                headers={"Authorization": f"Bearer {_SERVICE_TOKEN}"},
            )
            return r.json() if r.status_code == 200 else None
    except Exception as exc:
        logger.error("fetch task failed: %s", exc)
        return None


async def _create_next(user_id: str, task: dict[str, Any], interval_days: int) -> None:
    due = datetime.utcnow() + timedelta(days=interval_days)
    payload = {
        "title":       task["title"],
        "description": task.get("description"),
        "priority":    task.get("priority", "medium"),
        "tags":        task.get("tags") or [],
        "due_date":    due.isoformat(),
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.post(
                f"{_BACKEND_URL}/api/{user_id}/tasks",
                json=payload,
                headers={
                    "Authorization": f"Bearer {_SERVICE_TOKEN}",
                    "Content-Type":  "application/json",
                },
            )
            if r.status_code == 201:
                logger.info("Created next occurrence of '%s' due %s", task["title"], due.date())
            else:
                logger.warning("Backend %s: %s", r.status_code, r.text)
    except Exception as exc:
        logger.error("create next task failed: %s", exc)


@app.get("/dapr/subscribe")
def dapr_subscribe() -> list[dict[str, str]]:
    return [{"pubsubname": _PUBSUB, "topic": "task-completed", "route": "/events/task-completed"}]


@app.post("/events/task-completed", status_code=status.HTTP_200_OK)
async def on_task_completed(request: Request) -> dict[str, str]:
    data = _extract(await request.json())
    task_id = data.get("task_id")
    user_id = data.get("user_id")
    if not task_id or not user_id:
        return {"status": "ignored"}

    task = await _get_task(task_id, user_id)
    if not task:
        return {"status": "task_not_found"}

    desc = task.get("description") or ""
    try:
        meta = json.loads(desc) if desc.strip().startswith("{") else {}
    except json.JSONDecodeError:
        meta = {}

    if meta.get("recurring") is True and isinstance(meta.get("interval_days"), int):
        interval = max(1, int(meta["interval_days"]))
        await _create_next(user_id, task, interval)
        return {"status": "next_task_created"}

    return {"status": "not_recurring"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "recurring-task"}
