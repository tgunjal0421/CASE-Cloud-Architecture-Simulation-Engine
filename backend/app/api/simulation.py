from fastapi import APIRouter, HTTPException

from app.schemas.simulation import (
    SimulationInput,
    StartSimulationResponse,
    StopSimulationResponse,
    ToggleFailureInput,
)
from app.services.simulation_service import (
    run_simulation,
    start_simulation,
    stop_simulation,
    get_simulation_run,
    toggle_failure,
)

router = APIRouter(
    prefix="/simulate",
    tags=["Simulation"]
)


@router.post("/")
def simulate(data: SimulationInput):
    result = run_simulation(data)
    return result


@router.post("/start", response_model=StartSimulationResponse)
def start(data: SimulationInput):
    return start_simulation(data)


@router.get("/{run_id}")
def get_run(run_id: str):
    run = get_simulation_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.post("/{run_id}/stop", response_model=StopSimulationResponse)
def stop(run_id: str):
    result = stop_simulation(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="Run not found")
    return result


@router.post("/{run_id}/toggle-failure")
def toggle_run_failure(run_id: str, data: ToggleFailureInput):
    result = toggle_failure(run_id, data.node_id)
    if not result:
        raise HTTPException(status_code=404, detail="Run not found")
    return result