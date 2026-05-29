# app/api/simulation.py
# Endpoints for running and querying simulations.

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.db.redis import read_sim_state, read_sim_logs
from app.schemas.simulation import SimulationConfig, SimulationResult, SimulationRunOut
from app.services import simulation_service as svc

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])


@router.post("/run", response_model=SimulationResult)
async def run_simulation(
    config: SimulationConfig,
    architecture_id: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    Execute a simulation pass on the provided architecture.

    Frontend sends: { nodes, edges, traffic_multiplier, failure_mode }
    Returns:        { run_id, system_metrics, node_metrics, logs, active_edges }

    This replaces the frontend's simulationEngine.ts tick loop.
    """
    result = await svc.execute_simulation(db, config, architecture_id)
    return SimulationResult(
        run_id         = result["run_id"],
        status         = result["status"],
        duration_ms    = result["duration_ms"],
        summary        = result["summary"],
        system_metrics = result["system_metrics"],
        node_metrics   = result["node_metrics"],
        logs           = result["logs"],
    )


@router.get("/{run_id}/state")
async def get_simulation_state(run_id: str):
    """
    Poll latest simulation state from Redis.
    Frontend calls this every 800ms while simulation is running.
    """
    state = await read_sim_state(run_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation state not found or expired")
    return state


@router.get("/{run_id}/logs")
async def get_simulation_logs(
    run_id: str,
    limit: int = Query(default=50, le=200),
):
    """
    Get recent simulation log entries from Redis.
    """
    logs = await read_sim_logs(run_id, limit)
    return {"run_id": run_id, "logs": logs}


@router.get("/{run_id}", response_model=SimulationRunOut)
async def get_simulation_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a saved simulation run from PostgreSQL.
    Used for history / results review.
    """
    run = await svc.get_simulation_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Simulation run not found")
    return run


@router.get("/history/{architecture_id}", response_model=list[SimulationRunOut])
async def list_simulation_runs(
    architecture_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Return past simulation runs for an architecture."""
    runs = await svc.list_simulation_runs(db, architecture_id)
    return runs
