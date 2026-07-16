# app/schemas/metrics.py

from pydantic import BaseModel


class LatencyPoint(BaseModel):
    time: str
    p50:  float
    p95:  float
    p99:  float


class ThroughputPoint(BaseModel):
    time: str
    rps:  float


class ResourceItem(BaseModel):
    resource: str
    usage:    float
    max:      float
    unit:     str


class MetricsResponse(BaseModel):
    latency:    list[LatencyPoint]
    throughput: list[ThroughputPoint]
    resources:  list[ResourceItem]


class CostItem(BaseModel):
    label:  str
    amount: float
    unit:   str


class CostEstimateResponse(BaseModel):
    compute: CostItem
    storage: CostItem
    network: CostItem
    total:   CostItem
