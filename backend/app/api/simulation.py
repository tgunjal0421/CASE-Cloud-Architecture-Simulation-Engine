from fastapi import APIRouter

from app.schemas.simulation import SimulationInput
from app.services.simulation_service import run_simulation

router = APIRouter(
    prefix="/simulate",
    tags=["Simulation"]
)


@router.post("/")
def simulate(data: SimulationInput):

    result = run_simulation(data)

    return result