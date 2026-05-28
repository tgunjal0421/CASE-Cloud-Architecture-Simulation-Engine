from pydantic import BaseModel
from typing import Any, List


class ArchitectureSaveInput(BaseModel):
    name: str
    nodes: List[Any]
    edges: List[Any]


class ArchitectureSaveResponse(BaseModel):
    id: str
    savedAt: str

