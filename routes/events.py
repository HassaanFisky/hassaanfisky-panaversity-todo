"""
Panaversity Hackathon II — Phase V
Dapr pubsub publish helper.
"""
from __future__ import annotations

import json
import os
from typing import Any

import httpx

_DAPR_HTTP_PORT = int(os.getenv("DAPR_HTTP_PORT", "3500"))
_PUBSUB_NAME    = os.getenv("DAPR_PUBSUB_NAME", "kafka-pubsub")
_BASE_URL       = f"http://localhost:{_DAPR_HTTP_PORT}/v1.0/publish/{_PUBSUB_NAME}"


async def publish_event(topic: str, data: dict[str, Any]) -> bool:
    url = f"{_BASE_URL}/{topic}"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.post(
                url,
                content=json.dumps(data),
                headers={"Content-Type": "application/json"},
            )
            return resp.status_code == 204
    except Exception:
        return False


async def emit_task_created(task_id: str, user_id: str, title: str) -> None:
    await publish_event("task-created", {"task_id": task_id, "user_id": user_id, "title": title, "event": "task.created"})


async def emit_task_completed(task_id: str, user_id: str, title: str) -> None:
    await publish_event("task-completed", {"task_id": task_id, "user_id": user_id, "title": title, "event": "task.completed"})


async def emit_task_deleted(task_id: str, user_id: str) -> None:
    await publish_event("task-deleted", {"task_id": task_id, "user_id": user_id, "event": "task.deleted"})
