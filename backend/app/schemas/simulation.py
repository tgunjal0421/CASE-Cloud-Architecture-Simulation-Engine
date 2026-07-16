# app/schemas/simulation.py

from __future__ import annotations
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class SimulationConfig(BaseModel):
    """Request body for POST /api/simulation/run"""
    nodes:              list[dict[str, Any]]
    edges:              list[dict[str, Any]]
    traffic_multiplier: float   = Field(default=1.0, ge=0.5, le=10.0)
    failure_mode:       bool    = False


class NodeMetric(BaseModel):
    node_id:      str
    throughput:   float     # req/s
    latency:      float     # ms
    error_rate:   float     # 0.0 – 1.0
    is_failed:    bool
    is_overloaded:bool


class SystemMetrics(BaseModel):
    total_throughput:  float
    avg_latency:       float
    error_rate:        float    # percentage 0–100
    active_requests:   int
    dropped_requests:  int


class LogEntry(BaseModel):
    id:         str
    timestamp:  str
    level:      str     # "info" | "success" | "warn" | "error"
    request_id: int | None = None
    message:    str


class SimulationResult(BaseModel):
    """Response for POST /api/simulation/run"""
    run_id:        str
    status:        str          # "success" | "error"
    duration_ms:   int
    summary:       str
    system_metrics:SystemMetrics
    node_metrics:  list[NodeMetric]
    logs:          list[LogEntry]


class SimulationRunOut(BaseModel):
    """Response for GET /api/simulation/:run_id"""
    id:                 str
    architecture_id:    str
    traffic_multiplier: float
    failure_mode:       bool
    status:             str
    avg_latency_ms:     float | None
    total_throughput:   float | None
    error_rate:         float | None
    dropped_requests:   int   | None
    started_at:         datetime
    completed_at:       datetime | None

    model_config = {"from_attributes": True}
