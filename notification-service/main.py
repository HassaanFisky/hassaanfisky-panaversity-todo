"""
Panaversity Hackathon II — Phase V
Notification Service — subscribes to Dapr topics and logs/sends notifications.
"""
from __future__ import annotations
import json, logging, os
from typing import Any
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notification-service")
app = FastAPI(title="Notification Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
_PUBSUB = os.getenv("DAPR_PUBSUB_NAME", "kafka-pubsub")

@app.get("/dapr/subscribe")
def dapr_subscribe() -> list[dict[str, str]]:
    return [
        {"pubsubname": _PUBSUB, "topic": "task-created",   "route": "/events/task-created"},
        {"pubsubname": _PUBSUB, "topic": "task-completed", "route": "/events/task-completed"},
        {"pubsubname": _PUBSUB, "topic": "task-deleted",   "route": "/events/task-deleted"},
    ]

def _extract(body: dict[str, Any]) -> dict[str, Any]:
    data = body.get("data") or body
    if isinstance(data, str):
        try: return json.loads(data)
        except json.JSONDecodeError: return {}
    return data if isinstance(data, dict) else {}

@app.post("/events/task-created", status_code=status.HTTP_200_OK)
async def on_task_created(request: Request) -> dict[str, str]:
    data = _extract(await request.json())
    logger.info("NOTIFICATION [task.created] user=%s task=%s title=%r", data.get("user_id"), data.get("task_id"), data.get("title"))
    return {"status": "ok"}

@app.post("/events/task-completed", status_code=status.HTTP_200_OK)
async def on_task_completed(request: Request) -> dict[str, str]:
    data = _extract(await request.json())
    logger.info("NOTIFICATION [task.completed] user=%s task=%s", data.get("user_id"), data.get("task_id"))
    return {"status": "ok"}

@app.post("/events/task-deleted", status_code=status.HTTP_200_OK)
async def on_task_deleted(request: Request) -> dict[str, str]:
    data = _extract(await request.json())
    logger.info("NOTIFICATION [task.deleted] user=%s task=%s", data.get("user_id"), data.get("task_id"))
    return {"status": "ok"}

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "notification"}
