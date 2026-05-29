# app/db/redis.py
# Redis client used for storing live simulation state.
# While a simulation is running, metrics are written to Redis every tick
# so the frontend can poll them without hitting PostgreSQL on every request.

import json
import redis.asyncio as aioredis
from app.config import settings

# Single connection pool shared across all requests
redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    """Return the shared Redis client (initialised on startup)."""
    global redis_client
    if redis_client is None:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return redis_client


async def close_redis():
    """Close Redis connection on app shutdown."""
    global redis_client
    if redis_client:
        await redis_client.aclose()
        redis_client = None


# ── Simulation state helpers ───────────────────────────────────────────────

SIM_KEY     = "sim:state:{run_id}"       # current metrics snapshot
SIM_LOG_KEY = "sim:logs:{run_id}"        # list of log entries
SIM_TTL     = 3600                        # expire after 1 hour


async def write_sim_state(run_id: str, state: dict):
    """Write full simulation state snapshot to Redis."""
    client = await get_redis()
    key = SIM_KEY.format(run_id=run_id)
    await client.set(key, json.dumps(state), ex=SIM_TTL)


async def read_sim_state(run_id: str) -> dict | None:
    """Read the latest simulation state from Redis."""
    client = await get_redis()
    key = SIM_KEY.format(run_id=run_id)
    raw = await client.get(key)
    return json.loads(raw) if raw else None


async def append_sim_log(run_id: str, entry: dict):
    """Append a log entry to the simulation log list."""
    client = await get_redis()
    key = SIM_LOG_KEY.format(run_id=run_id)
    await client.lpush(key, json.dumps(entry))
    await client.ltrim(key, 0, 199)     # keep last 200 entries
    await client.expire(key, SIM_TTL)


async def read_sim_logs(run_id: str, limit: int = 50) -> list[dict]:
    """Read the most recent log entries (newest first)."""
    client = await get_redis()
    key = SIM_LOG_KEY.format(run_id=run_id)
    raw_list = await client.lrange(key, 0, limit - 1)
    return [json.loads(r) for r in raw_list]


async def delete_sim_state(run_id: str):
    """Clean up Redis keys for a finished simulation."""
    client = await get_redis()
    await client.delete(
        SIM_KEY.format(run_id=run_id),
        SIM_LOG_KEY.format(run_id=run_id),
    )
