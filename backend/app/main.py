# app/main.py
# FastAPI application entry point.
# Registers all routers, CORS middleware, startup/shutdown hooks.

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.postgres import create_tables
from app.db.redis import get_redis, close_redis
from app.api import architecture, simulation, metrics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown hooks."""
    # Startup
    await create_tables()       # create DB tables if they don't exist
    await get_redis()           # warm up Redis connection
    print("✓ PostgreSQL tables ready")
    print("✓ Redis connected")
    yield
    # Shutdown
    await close_redis()
    print("✓ Redis closed")


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
    allow_methods     = ["*"],
    allow_headers     = ["*"],
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
