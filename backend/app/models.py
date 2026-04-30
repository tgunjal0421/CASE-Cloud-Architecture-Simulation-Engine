"""Pydantic models for request and response validation."""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


class Node(BaseModel):
    """Represents a cloud architecture component node."""
    id: str
    domain: Optional[str] = None
    kind: Optional[str] = None
    icon: Optional[str] = None
    status: str = "healthy"
    rps: float = 0
    latency: float = 10
    x: Optional[float] = None
    y: Optional[float] = None


class Edge(BaseModel):
    """Represents a connection between nodes."""
    id: Optional[str] = None
    from_node: str = Field(alias="from")
    to_node: str = Field(alias="to")
    
    model_config = ConfigDict(populate_by_name=True)


class SimulationRequest(BaseModel):
    """Request model for simulation execution."""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    steps: int = 10
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "nodes": [
                    {
                        "id": "n1",
                        "domain": "Network",
                        "kind": "Load Balancer",
                        "status": "healthy",
                        "rps": 100,
                        "latency": 50
                    }
                ],
                "edges": [],
                "steps": 5
            }
        }
    )


class SimulationResponse(BaseModel):
    """Response model for simulation execution."""
    success: bool
    steps: int
    simulation: List[List[Dict[str, Any]]]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str


class ErrorResponse(BaseModel):
    """Error response."""
    error: str
