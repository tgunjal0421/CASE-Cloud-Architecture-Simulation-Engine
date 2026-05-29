<<<<<<< HEAD
import threading
import time
import uuid
from copy import deepcopy
from typing import Any

from app.simulation.engine import empty_state, run_engine, run_tick

RUNS: dict[str, dict] = {}
RUNS_LOCK = threading.Lock()
TICK_SECONDS = 0.8


def _normalize_config(data: Any) -> dict:
    payload = data if isinstance(data, dict) else data.model_dump()
    nodes = payload.get("nodes", [])
    edges = payload.get("edges", [])
    return {
        "nodes": [n if isinstance(n, dict) else n.model_dump() for n in nodes],
        "edges": [e if isinstance(e, dict) else e.model_dump() for e in edges],
        "traffic": int(payload.get("traffic", 1)),
        "chaos": bool(payload.get("chaos", False)),
        "failed_nodes": list(payload.get("failed_nodes", [])),
    }


def _run_loop(run_id: str, stop_event: threading.Event) -> None:
    while not stop_event.is_set():
        with RUNS_LOCK:
            run = RUNS.get(run_id)
            if not run:
                return
            run["state"] = run_tick(run["config"], run["state"])
            run["updated_at"] = time.time()
        stop_event.wait(TICK_SECONDS)


def start_simulation(data) -> dict:
    config = _normalize_config(data)
    run_id = f"run_{uuid.uuid4().hex[:12]}"
    stop_event = threading.Event()
    state = run_tick(config, empty_state())

    with RUNS_LOCK:
        RUNS[run_id] = {
            "run_id": run_id,
            "status": "running",
            "config": config,
            "state": state,
            "updated_at": time.time(),
            "stop_event": stop_event,
            "thread": None,
        }

    thread = threading.Thread(target=_run_loop, args=(run_id, stop_event), daemon=True)
    with RUNS_LOCK:
        if run_id in RUNS:
            RUNS[run_id]["thread"] = thread
    thread.start()
    return {"run_id": run_id, "status": "running"}


def stop_simulation(run_id: str) -> dict | None:
    with RUNS_LOCK:
        run = RUNS.get(run_id)
        if not run:
            return None
        run["status"] = "stopped"
        run["stop_event"].set()
        run["updated_at"] = time.time()
        return {"run_id": run_id, "status": "stopped"}


def get_simulation_run(run_id: str) -> dict | None:
    with RUNS_LOCK:
        run = RUNS.get(run_id)
        if not run:
            return None
        return {
            "run_id": run["run_id"],
            "status": run["status"],
            "updated_at": run["updated_at"],
            "config": {
                "traffic": run["config"].get("traffic", 1),
                "chaos": run["config"].get("chaos", False),
                "failed_nodes": run["config"].get("failed_nodes", []),
            },
            "state": deepcopy(run["state"]),
        }


def toggle_failure(run_id: str, node_id: str) -> dict | None:
    with RUNS_LOCK:
        run = RUNS.get(run_id)
        if not run:
            return None
        failed_nodes = set(run["config"].get("failed_nodes", []))
        if node_id in failed_nodes:
            failed_nodes.remove(node_id)
        else:
            failed_nodes.add(node_id)
        run["config"]["failed_nodes"] = list(failed_nodes)
        run["updated_at"] = time.time()
        return {"run_id": run_id, "failed_nodes": run["config"]["failed_nodes"]}
=======
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
>>>>>>> 54a450e (Backend Updated)


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
