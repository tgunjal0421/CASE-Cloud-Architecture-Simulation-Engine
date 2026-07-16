# app/main.py
# FastAPI application entry point.
# Registers all routers, CORS middleware, startup/shutdown hooks.

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.postgres import create_tables
from app.db.redis import get_redis, close_redis
from app.api import architecture, simulation, metrics

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown hooks."""
    # Startup
    try:
        await create_tables()
        logger.info("✓ PostgreSQL tables ready")
    except Exception as exc:
        logger.warning("PostgreSQL unavailable during startup: %s", exc)

    try:
        await get_redis()
        logger.info("✓ Redis connected")
    except Exception as exc:
        logger.warning("Redis unavailable during startup: %s", exc)

    yield

    # Shutdown
    try:
        await close_redis()
        logger.info("✓ Redis closed")
    except Exception as exc:
        logger.warning("Redis shutdown error: %s", exc)


app = FastAPI(
    title       = "CASE Simulator API",
    description = "Cloud Architecture Simulation Engine — Backend API",
    version     = "1.0.0",
    lifespan    = lifespan,
)

# ── CORS — allow Next.js frontend ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = settings.cors_origins_list,
    allow_credentials = True,
    allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers     = ["Content-Type", "Authorization", "Accept"],
)

# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(architecture.router)
app.include_router(simulation.router)
app.include_router(metrics.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "CASE Simulator API",
        "version": "1.0.0",
        "status":  "running",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
