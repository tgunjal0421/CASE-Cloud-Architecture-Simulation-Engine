# app/api/architecture.py
# REST endpoints for saving and loading architectures.
# All routes are mounted under /api/architecture in main.py.

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.schemas.architecture import (
    ArchitectureSave, ArchitectureOut, ArchitectureListItem,
    SaveResponse, NodeOut, EdgeOut, NodePosition, NodeData,
)
from app.services import architecture_service as svc

router = APIRouter(prefix="/api/architecture", tags=["Architecture"])


@router.post("", response_model=SaveResponse)
async def save_architecture(
    payload: ArchitectureSave,
    db: AsyncSession = Depends(get_db),
):
    """
    Save an architecture (nodes + edges) to PostgreSQL.
    Called when user clicks "Save" in the Navbar.
    Returns the new architecture ID so the frontend can reference it later.
    """
    arch = await svc.save_architecture(db, payload)
    return SaveResponse(id=arch.id, saved_at=arch.created_at)


@router.get("", response_model=list[ArchitectureListItem])
async def list_architectures(db: AsyncSession = Depends(get_db)):
    """
    Return all saved architectures (summary — no node/edge detail).
    Used to populate a "Load Architecture" list.
    """
    archs = await svc.list_architectures(db)
    return [
        ArchitectureListItem(
            id         = a.id,
            name       = a.name,
            node_count = len(a.nodes) if hasattr(a, "nodes") else 0,
            updated_at = a.updated_at,
        )
        for a in archs
    ]


@router.get("/{arch_id}", response_model=ArchitectureOut)
async def get_architecture(
    arch_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Load a full architecture by ID.
    Returns all nodes and edges so the frontend can rebuild the canvas.
    """
    arch = await svc.get_architecture(db, arch_id)
    if not arch:
        raise HTTPException(status_code=404, detail="Architecture not found")

    nodes_out = [
        NodeOut(
            id       = n.id,
            type     = "caseNode",
            position = NodePosition(x=n.pos_x, y=n.pos_y),
            data     = NodeData(
                label         = n.label,
                type          = n.node_type,
                color         = n.color,
                icon          = n.icon,
                config_values = n.config_values,
                summary_lines = n.summary_lines,
            ),
        )
        for n in arch.nodes
    ]

    edges_out = [
        EdgeOut(id=e.id, source=e.source_node_id, target=e.target_node_id)
        for e in arch.edges
    ]

    return ArchitectureOut(
        id         = arch.id,
        name       = arch.name,
        nodes      = nodes_out,
        edges      = edges_out,
        created_at = arch.created_at,
        updated_at = arch.updated_at,
    )


@router.patch("/{arch_id}/nodes/{node_id}/position")
async def update_node_position(
    arch_id: str,
    node_id: str,
    body: NodePosition,
    db: AsyncSession = Depends(get_db),
):
    """
    Update node position after drag.
    Called after onNodeDragStop in ArchitectureCanvas.tsx.
    """
    node = await svc.update_node_position(db, node_id, body.x, body.y)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return {"ok": True}


@router.patch("/{arch_id}/nodes/{node_id}/config")
async def update_node_config(
    arch_id: str,
    node_id: str,
    body: NodeData,
    db: AsyncSession = Depends(get_db),
):
    """
    Update node configuration after user edits in the config modal.
    Called when user clicks "Save Changes" on an existing node.
    """
    node = await svc.update_node_config(
        db, node_id,
        label         = body.label,
        config_values = body.config_values or {},
        summary_lines = body.summary_lines or [],
    )
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return {"ok": True}


@router.delete("/{arch_id}")
async def delete_architecture(
    arch_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Delete an architecture and all its nodes/edges.
    Called when user clicks Reset (optionally).
    """
    deleted = await svc.delete_architecture(db, arch_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Architecture not found")
    return {"ok": True}
>>>>>>> 54a450e (Backend Updated)
