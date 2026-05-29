# app/main.py
# FastAPI application entry point.
# Registers all routers, CORS middleware, startup/shutdown hooks.

from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.api.simulation import router as simulation_router

app = FastAPI(
    title="CASE Backend"
)

app.include_router(simulation_router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "CASE Backend Running 🚀"
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
