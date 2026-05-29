<<<<<<< HEAD
from datetime import datetime, timezone
import uuid

ARCHITECTURES: dict[str, dict] = {}


def save_architecture(name: str, nodes: list, edges: list) -> dict:
    arch_id = f"arch_{uuid.uuid4().hex[:12]}"
    saved_at = datetime.now(timezone.utc).isoformat()
    ARCHITECTURES[arch_id] = {
        "id": arch_id,
        "name": name,
        "nodes": nodes,
        "edges": edges,
        "savedAt": saved_at,
    }
    return {"id": arch_id, "savedAt": saved_at}

=======
# app/services/architecture_service.py
# All database operations for architectures, nodes, and edges.
# Route handlers call these functions — they never touch SQLAlchemy directly.

from __future__ import annotations
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db.models import Architecture, Node, Edge
from app.schemas.architecture import ArchitectureSave


async def save_architecture(db: AsyncSession, payload: ArchitectureSave) -> Architecture:
    """
    Create or fully replace an architecture.
    Strategy: create a new Architecture row every time Save is clicked.
    (Future: add architecture_id to support update-in-place.)
    """
    arch = Architecture(name=payload.name)
    db.add(arch)
    await db.flush()   # get arch.id before inserting children

    # Insert nodes
    node_id_map: dict[str, str] = {}    # frontend_id → db_id
    for n in payload.nodes:
        pos  = n.position
        data = n.data
        node = Node(
            id              = n.id,            # reuse frontend-generated UUID
            architecture_id = arch.id,
            node_type       = data.type,
            label           = data.label,
            color           = data.color,
            icon            = data.icon,
            pos_x           = pos.x,
            pos_y           = pos.y,
            config_values   = data.config_values,
            summary_lines   = data.summary_lines,
        )
        db.add(node)
        node_id_map[n.id] = n.id

    # Insert edges
    for e in payload.edges:
        edge = Edge(
            id              = e.id,
            architecture_id = arch.id,
            source_node_id  = e.source,
            target_node_id  = e.target,
        )
        db.add(edge)

    await db.flush()
    return arch


async def get_architecture(db: AsyncSession, arch_id: str) -> Architecture | None:
    """Load a full architecture with all its nodes and edges."""
    result = await db.execute(
        select(Architecture).where(Architecture.id == arch_id)
    )
    arch = result.scalar_one_or_none()
    if not arch:
        return None

    # Load nodes
    nodes_result = await db.execute(
        select(Node).where(Node.architecture_id == arch_id)
    )
    arch.nodes = nodes_result.scalars().all()

    # Load edges
    edges_result = await db.execute(
        select(Edge).where(Edge.architecture_id == arch_id)
    )
    arch.edges = edges_result.scalars().all()

    return arch


async def list_architectures(db: AsyncSession) -> list[Architecture]:
    """Return all saved architectures (summary only — no nodes/edges)."""
    result = await db.execute(
        select(Architecture).order_by(Architecture.updated_at.desc())
    )
    return result.scalars().all()


async def update_node_position(
    db: AsyncSession, node_id: str, x: float, y: float
) -> Node | None:
    """Update a node's canvas position after drag."""
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()
    if node:
        node.pos_x = x
        node.pos_y = y
        node.updated_at = datetime.utcnow()
    return node


async def update_node_config(
    db: AsyncSession,
    node_id: str,
    label: str,
    config_values: dict,
    summary_lines: list[str],
) -> Node | None:
    """Update a node's configuration after user edits in the modal."""
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()
    if node:
        node.label         = label
        node.config_values = config_values
        node.summary_lines = summary_lines
        node.updated_at    = datetime.utcnow()
    return node


async def delete_architecture(db: AsyncSession, arch_id: str) -> bool:
    """Delete an architecture and all its nodes/edges (cascade)."""
    result = await db.execute(
        select(Architecture).where(Architecture.id == arch_id)
    )
    arch = result.scalar_one_or_none()
    if not arch:
        return False
    await db.delete(arch)
    return True
>>>>>>> 54a450e (Backend Updated)
