# app/schemas/architecture.py
# Pydantic models that validate incoming requests and shape outgoing responses.
# These mirror the TypeScript interfaces in the frontend's lib/api.ts.

from __future__ import annotations
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


# ── Node schemas ──────────────────────────────────────────────────────────

class NodePosition(BaseModel):
    x: float
    y: float


class NodeData(BaseModel):
    label:        str
    type:         str                           # "vm", "loadbalancer" etc.
    color:        str | None = None
    icon:         str | None = None
    config_values: dict[str, Any] | None = None
    summary_lines: list[str]       | None = None


class NodeIn(BaseModel):
    """Node as sent by the frontend when saving an architecture."""
    id:       str
    type:     str = "caseNode"                  # React Flow node type
    position: NodePosition
    width:    float | None = None
    data:     NodeData


class NodeOut(BaseModel):
    """Node as returned to the frontend."""
    id:       str
    type:     str
    position: NodePosition
    width:    float | None = None
    data:     NodeData

    model_config = {"from_attributes": True}


# ── Edge schemas ──────────────────────────────────────────────────────────

class EdgeIn(BaseModel):
    id:     str
    source: str                                 # Node id
    target: str                                 # Node id


class EdgeOut(BaseModel):
    id:     str
    source: str
    target: str

    model_config = {"from_attributes": True}


# ── Architecture schemas ──────────────────────────────────────────────────

class ArchitectureSave(BaseModel):
    """Request body for POST /api/architecture — sent when user clicks Save."""
    name:  str = Field(default="Untitled Architecture", max_length=255)
    nodes: list[NodeIn]
    edges: list[EdgeIn]


class ArchitectureOut(BaseModel):
    """Response for GET /api/architecture/:id"""
    id:         str
    name:       str
    nodes:      list[NodeOut]
    edges:      list[EdgeOut]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ArchitectureListItem(BaseModel):
    """Summary item for GET /api/architecture list."""
    id:         str
    name:       str
    node_count: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class SaveResponse(BaseModel):
    id:       str
    saved_at: datetime
