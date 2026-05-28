from pydantic import BaseModel, Field
from typing import List, Optional


class Node(BaseModel):
    id: str
    type: str
    label: Optional[str] = None


class Edge(BaseModel):
    source: str
    target: str


class SimulationInput(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    traffic: int
    chaos: bool = False
    failed_nodes: List[str] = Field(default_factory=list)


class StartSimulationResponse(BaseModel):
    run_id: str
    status: str


class StopSimulationResponse(BaseModel):
    run_id: str
    status: str


class ToggleFailureInput(BaseModel):
    node_id: str