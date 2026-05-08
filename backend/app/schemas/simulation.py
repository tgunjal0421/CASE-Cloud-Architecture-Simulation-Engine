from pydantic import BaseModel
from typing import List


class Node(BaseModel):
    id: str
    type: str


class Edge(BaseModel):
    source: str
    target: str


class SimulationInput(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    traffic: int
    chaos: bool = False