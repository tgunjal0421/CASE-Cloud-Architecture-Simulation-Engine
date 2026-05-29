# app/db/models.py
# SQLAlchemy ORM models — one class = one PostgreSQL table.
# Relationships: Architecture → has many Nodes + Edges + SimulationRuns

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Boolean,
    DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


def gen_uuid():
    return str(uuid.uuid4())


class Architecture(Base):
    """
    Top-level saved architecture — one per user design.
    Stores the overall canvas layout metadata.
    """
    __tablename__ = "architectures"

    id         = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name       = Column(String(255), nullable=False, default="Untitled Architecture")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    nodes            = relationship("Node",          back_populates="architecture", cascade="all, delete-orphan")
    edges            = relationship("Edge",          back_populates="architecture", cascade="all, delete-orphan")
    simulation_runs  = relationship("SimulationRun", back_populates="architecture", cascade="all, delete-orphan")


class Node(Base):
    """
    A single component placed on the canvas.
    config_values stores the full form data (OS, CPU, memory etc.)
    summary_lines stores the pre-computed display strings for the card.
    """
    __tablename__ = "nodes"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    architecture_id = Column(UUID(as_uuid=False), ForeignKey("architectures.id"), nullable=False)

    # React Flow identity
    node_type   = Column(String(64),  nullable=False)   # "vm", "loadbalancer" etc.
    label       = Column(String(255), nullable=False)
    color       = Column(String(32),  nullable=True)
    icon        = Column(String(16),  nullable=True)

    # Canvas position
    pos_x = Column(Float, default=100.0)
    pos_y = Column(Float, default=100.0)

    # Configuration — full form values + display summary
    config_values = Column(JSON, nullable=True)     # { os: "Ubuntu", vcpu: 2, ... }
    summary_lines = Column(JSON, nullable=True)     # ["OS: Ubuntu", "Zone: us-east-1a"]

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    architecture = relationship("Architecture", back_populates="nodes")


class Edge(Base):
    """
    A directed connection between two nodes on the canvas.
    """
    __tablename__ = "edges"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    architecture_id = Column(UUID(as_uuid=False), ForeignKey("architectures.id"), nullable=False)
    source_node_id  = Column(UUID(as_uuid=False), ForeignKey("nodes.id",          ondelete="CASCADE"), nullable=False)
    target_node_id  = Column(UUID(as_uuid=False), ForeignKey("nodes.id",          ondelete="CASCADE"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    architecture = relationship("Architecture", back_populates="edges")
    source_node  = relationship("Node", foreign_keys=[source_node_id])
    target_node  = relationship("Node", foreign_keys=[target_node_id])


class SimulationRun(Base):
    """
    One simulation execution record.
    Stores config used + aggregated results after the run completes.
    """
    __tablename__ = "simulation_runs"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    architecture_id = Column(UUID(as_uuid=False), ForeignKey("architectures.id"), nullable=False)

    # Config used for this run
    traffic_multiplier = Column(Float,   default=1.0)
    failure_mode       = Column(Boolean, default=False)

    # Results summary
    status          = Column(String(32), default="running")   # running | completed | failed
    avg_latency_ms  = Column(Float,   nullable=True)
    total_throughput= Column(Float,   nullable=True)
    error_rate      = Column(Float,   nullable=True)
    dropped_requests= Column(Integer, nullable=True)

    # Full per-node metrics stored as JSON
    node_metrics    = Column(JSON, nullable=True)   # { nodeId: { latency, throughput } }

    started_at   = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    architecture = relationship("Architecture", back_populates="simulation_runs")
