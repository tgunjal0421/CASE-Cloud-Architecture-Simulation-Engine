# app/api/metrics.py
# Endpoints for metrics history and cost estimation.

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.postgres import get_db
from app.db.models import SimulationRun
from app.db.redis import read_sim_state
from app.schemas.metrics import (
    MetricsResponse, LatencyPoint, ThroughputPoint,
    ResourceItem, CostEstimateResponse, CostItem,
)

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])


# Cost per unit per month (approximate)
COMPUTE_RATE = 0.05   # $/node/month base
STORAGE_RATE = 0.023  # $/GB/month
NETWORK_RATE = 0.09   # $/GB transferred


@router.get("/latest", response_model=MetricsResponse)
async def get_latest_metrics(
    run_id: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    Return the latest metrics for the dashboard charts.
    If run_id is provided, tries Redis first (live), then PostgreSQL (history).
    If no run_id, returns the most recent simulation run from PostgreSQL.
    """
    # Try Redis first (live simulation)
    if run_id:
        state = await read_sim_state(run_id)
        if state:
            return _build_metrics_response(state.get("system_metrics", {}))

    # Fall back to latest PostgreSQL run
    result = await db.execute(
        select(SimulationRun)
        .where(SimulationRun.status == "completed")
        .order_by(SimulationRun.started_at.desc())
        .limit(10)
    )
    runs = result.scalars().all()

    if not runs:
        return _mock_metrics()

    return _build_metrics_from_runs(runs)


@router.get("/cost/estimate", response_model=CostEstimateResponse)
async def estimate_cost(
    node_count: int = Query(default=1, ge=0, le=500),
    node_types: str = Query(default=""),
):
    """
    Estimate monthly cloud cost based on number and types of nodes.
    node_types is a comma-separated list e.g. "vm,vm,loadbalancer,postgresql"
    """
    types = [t.strip() for t in node_types.split(",") if t.strip()] if node_types else []

    compute_nodes  = sum(1 for t in types if t in ("vm", "container", "serverless", "autoscaling", "vmsnapshot"))
    db_nodes       = sum(1 for t in types if t in ("postgresql", "mysql", "oracle", "mssql", "mariadb"))
    storage_nodes  = sum(1 for t in types if t in ("blockstorage", "objectstorage", "nfs", "snapshot", "backup"))
    network_nodes  = sum(1 for t in types if t in ("loadbalancer", "apigateway", "cdn", "firewall", "vpc", "dns"))

    # If no types provided, distribute evenly
    if not types:
        total = max(1, node_count)
        compute_nodes = storage_nodes = network_nodes = total // 3 or 1

    compute_cost = round((compute_nodes * 35.0) + (db_nodes * 55.0), 2)
    storage_cost = round(storage_nodes * 12.8, 2)
    network_cost = round(network_nodes * 8.5, 2)
    total_cost   = round(compute_cost + storage_cost + network_cost, 2)

    return CostEstimateResponse(
        compute=CostItem(label="Compute",       amount=compute_cost, unit="$/mo"),
        storage=CostItem(label="Storage",       amount=storage_cost, unit="$/mo"),
        network=CostItem(label="Network Egress",amount=network_cost, unit="$/mo"),
        total  =CostItem(label="Est. Total",    amount=total_cost,   unit="$/mo"),
    )


# ── Helpers ────────────────────────────────────────────────────────────────

def _build_metrics_response(sm: dict) -> MetricsResponse:
    """Build a MetricsResponse from a system_metrics dict."""
    avg_lat  = sm.get("avg_latency",       50.0)
    tput     = sm.get("total_throughput", 100.0)
    err_rate = sm.get("error_rate",         0.0)

    # Build a 10-point time-series from the single snapshot
    import datetime
    points = []
    for i in range(10):
        t = (datetime.datetime.now(datetime.timezone.utc)
             .replace(second=0, microsecond=0)
             .__class__.now(datetime.timezone.utc))
        label = f"{i * 5:02d}:00"
        jitter = (i - 5) * 0.1
        points.append((label, avg_lat * (1 + jitter * 0.2), tput * (1 + jitter * 0.1)))

    return MetricsResponse(
        latency=[
            LatencyPoint(time=p[0], p50=round(p[1] * 0.6, 1),
                         p95=round(p[1] * 1.0, 1), p99=round(p[1] * 1.5, 1))
            for p in points
        ],
        throughput=[ThroughputPoint(time=p[0], rps=round(p[2], 1)) for p in points],
        resources=[
            ResourceItem(resource="CPU",      usage=min(95, round(tput / 10, 1)), max=100, unit="%"),
            ResourceItem(resource="Memory",   usage=min(90, round(tput / 8,  1)), max=100, unit="%"),
            ResourceItem(resource="Network",  usage=min(80, round(tput / 15, 1)), max=100, unit="%"),
            ResourceItem(resource="Disk I/O", usage=min(70, round(tput / 20, 1)), max=100, unit="%"),
        ],
    )


def _build_metrics_from_runs(runs: list[SimulationRun]) -> MetricsResponse:
    """Build time-series from multiple simulation runs."""
    latency    = []
    throughput = []
    for i, run in enumerate(reversed(runs)):
        label = f"{i * 5:02d}:00"
        lat   = run.avg_latency_ms  or 50.0
        tput  = run.total_throughput or 100.0
        latency.append(
            LatencyPoint(time=label, p50=round(lat * 0.6, 1),
                         p95=round(lat, 1), p99=round(lat * 1.5, 1))
        )
        throughput.append(ThroughputPoint(time=label, rps=round(tput, 1)))

    last = runs[0]
    tput = last.total_throughput or 100.0

    return MetricsResponse(
        latency    = latency,
        throughput = throughput,
        resources  = [
            ResourceItem(resource="CPU",      usage=min(95, round(tput / 10, 1)), max=100, unit="%"),
            ResourceItem(resource="Memory",   usage=min(90, round(tput / 8,  1)), max=100, unit="%"),
            ResourceItem(resource="Network",  usage=min(80, round(tput / 15, 1)), max=100, unit="%"),
            ResourceItem(resource="Disk I/O", usage=min(70, round(tput / 20, 1)), max=100, unit="%"),
        ],
    )


def _mock_metrics() -> MetricsResponse:
    """Return sensible mock data when no runs exist yet."""
    points = [
        ("00:00", 42, 420), ("00:05", 38, 380), ("00:10", 55, 510),
        ("00:15", 61, 620), ("00:20", 48, 480), ("00:25", 44, 440),
        ("00:30", 70, 710), ("00:35", 52, 530), ("00:40", 39, 390),
        ("00:45", 45, 450),
    ]
    return MetricsResponse(
        latency=[
            LatencyPoint(time=p[0], p50=round(p[1]*0.6,1),
                         p95=round(p[1],1), p99=round(p[1]*1.5,1))
            for p in points
        ],
        throughput=[ThroughputPoint(time=p[0], rps=float(p[2])) for p in points],
        resources=[
            ResourceItem(resource="CPU",      usage=62, max=100, unit="%"),
            ResourceItem(resource="Memory",   usage=74, max=100, unit="%"),
            ResourceItem(resource="Network",  usage=38, max=100, unit="%"),
            ResourceItem(resource="Disk I/O", usage=28, max=100, unit="%"),
        ],
    )
