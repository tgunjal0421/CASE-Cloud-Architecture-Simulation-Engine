# app/services/simulation_service.py
# Orchestrates a simulation run:
#   1. Call simulation engine
#   2. Store results in PostgreSQL (SimulationRun table)
#   3. Cache live state in Redis so frontend can poll

from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import SimulationRun
from app.db.redis import write_sim_state, delete_sim_state
from app.simulation.runner import run_simulation
from app.schemas.simulation import SimulationConfig

async def execute_simulation(
    db: AsyncSession,
    config: SimulationConfig,
    architecture_id: str | None = None,
) -> dict:
    """
    Run simulation, persist results, cache in Redis, return full result dict.
    """
    run_id    = str(uuid.uuid4())
    started   = datetime.utcnow()

    # Run the simulation engine (pure Python, no I/O)
    result = run_simulation(
        nodes              = config.nodes,
        edges              = config.edges,
        traffic_multiplier = config.traffic_multiplier,
        failure_mode       = config.failure_mode,
    )

    completed  = datetime.utcnow()
    duration_ms= int((completed - started).total_seconds() * 1000)
    sm         = result["system_metrics"]

    # Persist to PostgreSQL
    run = SimulationRun(
        id                 = run_id,
        architecture_id    = architecture_id or "00000000-0000-0000-0000-000000000000",
        traffic_multiplier = config.traffic_multiplier,
        failure_mode       = config.failure_mode,
        status             = "completed",
        avg_latency_ms     = sm["avg_latency"],
        total_throughput   = sm["total_throughput"],
        error_rate         = sm["error_rate"],
        dropped_requests   = sm["dropped_requests"],
        node_metrics       = result["node_metrics"],
        started_at         = started,
        completed_at       = completed,
    )
    db.add(run)
    await db.flush()

    # Cache in Redis for fast polling
    await write_sim_state(run_id, {
        "run_id":        run_id,
        "system_metrics":sm,
        "node_metrics":  result["node_metrics"],
        "active_edges":  result["active_edges"],
        "logs":          result["logs"],
    })

    return {
        "run_id":        run_id,
        "status":        "success",
        "duration_ms":   duration_ms,
        "summary":       (
            f"Simulation complete — {len(config.nodes)} nodes, "
            f"×{config.traffic_multiplier} traffic, "
            f"{sm['avg_latency']:.0f}ms avg latency"
        ),
        "system_metrics":sm,
        "node_metrics":  list(result["node_metrics"].values()),
        "logs":          result["logs"],
        "active_edges":  result["active_edges"],
    }


async def get_simulation_run(db: AsyncSession, run_id: str) -> SimulationRun | None:
    result = await db.execute(
        select(SimulationRun).where(SimulationRun.id == run_id)
    )
    return result.scalar_one_or_none()


async def list_simulation_runs(
    db: AsyncSession, architecture_id: str
) -> list[SimulationRun]:
    result = await db.execute(
        select(SimulationRun)
        .where(SimulationRun.architecture_id == architecture_id)
        .order_by(SimulationRun.started_at.desc())
        .limit(20)
    )
    return result.scalars().all()
