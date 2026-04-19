"""
Panaversity Hackathon II — Backend
FastAPI application entry point.

Start locally:
    uvicorn main:app --reload --port 8000

Deploy (Koyeb):
    See Procfile.
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_tables
from routes.tasks import router as tasks_router


# ─── Lifespan ─────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Create DB tables on startup (idempotent — safe to run every time)."""
    create_tables()
    yield


# ─── App ──────────────────────────────────────────────────────────────────────


app = FastAPI(
    title="Hackathon II — Todo API",
    description="Full-featured task management API with JWT auth, built for Panaversity Hackathon II.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
_origins = [o.strip() for o in _origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(tasks_router)

from routes.chat import router as chat_router  # noqa: E402
app.include_router(chat_router)


# ─── Health ───────────────────────────────────────────────────────────────────


@app.get("/health", tags=["meta"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "version": "2.0.0"}
