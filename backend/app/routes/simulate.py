"""Routes for simulation execution."""

from fastapi import APIRouter, HTTPException
from app.models import SimulationRequest, SimulationResponse
from app.services.simulator import validate_simulation_input, run_simulation

router = APIRouter(prefix="/api/simulate", tags=["simulation"])


@router.post("/")
async def execute_simulation(request: SimulationRequest) -> SimulationResponse:
    """
    Run a simulation on an architecture.
    
    Args:
        request: Simulation request containing nodes, edges, and steps
        
    Returns:
        SimulationResponse with the evolution of node metrics over time
    """
    try:
        # Validate input
        is_valid, error_msg = validate_simulation_input(request.nodes, request.edges)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Validate steps parameter
        if not isinstance(request.steps, int) or request.steps < 1 or request.steps > 1000:
            raise HTTPException(status_code=400, detail="Steps must be an integer between 1 and 1000")
        
        # Run simulation
        results = run_simulation(request.nodes, request.edges, request.steps)
        
        return SimulationResponse(
            success=True,
            steps=request.steps,
            simulation=results
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")
