import threading
import time
import uuid
from copy import deepcopy
from typing import Any

from app.simulation.engine import empty_state, run_engine, run_tick

RUNS: dict[str, dict] = {}
RUNS_LOCK = threading.Lock()
TICK_SECONDS = 0.8


def _normalize_config(data: Any) -> dict:
    payload = data if isinstance(data, dict) else data.model_dump()
    nodes = payload.get("nodes", [])
    edges = payload.get("edges", [])
    return {
        "nodes": [n if isinstance(n, dict) else n.model_dump() for n in nodes],
        "edges": [e if isinstance(e, dict) else e.model_dump() for e in edges],
        "traffic": int(payload.get("traffic", 1)),
        "chaos": bool(payload.get("chaos", False)),
        "failed_nodes": list(payload.get("failed_nodes", [])),
    }


def _run_loop(run_id: str, stop_event: threading.Event) -> None:
    while not stop_event.is_set():
        with RUNS_LOCK:
            run = RUNS.get(run_id)
            if not run:
                return
            run["state"] = run_tick(run["config"], run["state"])
            run["updated_at"] = time.time()
        stop_event.wait(TICK_SECONDS)


def start_simulation(data) -> dict:
    config = _normalize_config(data)
    run_id = f"run_{uuid.uuid4().hex[:12]}"
    stop_event = threading.Event()
    state = run_tick(config, empty_state())

    with RUNS_LOCK:
        RUNS[run_id] = {
            "run_id": run_id,
            "status": "running",
            "config": config,
            "state": state,
            "updated_at": time.time(),
            "stop_event": stop_event,
            "thread": None,
        }

    thread = threading.Thread(target=_run_loop, args=(run_id, stop_event), daemon=True)
    with RUNS_LOCK:
        if run_id in RUNS:
            RUNS[run_id]["thread"] = thread
    thread.start()
    return {"run_id": run_id, "status": "running"}


def stop_simulation(run_id: str) -> dict | None:
    with RUNS_LOCK:
        run = RUNS.get(run_id)
        if not run:
            return None
        run["status"] = "stopped"
        run["stop_event"].set()
        run["updated_at"] = time.time()
        return {"run_id": run_id, "status": "stopped"}


def get_simulation_run(run_id: str) -> dict | None:
    with RUNS_LOCK:
        run = RUNS.get(run_id)
        if not run:
            return None
        return {
            "run_id": run["run_id"],
            "status": run["status"],
            "updated_at": run["updated_at"],
            "config": {
                "traffic": run["config"].get("traffic", 1),
                "chaos": run["config"].get("chaos", False),
                "failed_nodes": run["config"].get("failed_nodes", []),
            },
            "state": deepcopy(run["state"]),
        }


def toggle_failure(run_id: str, node_id: str) -> dict | None:
    with RUNS_LOCK:
        run = RUNS.get(run_id)
        if not run:
            return None
        failed_nodes = set(run["config"].get("failed_nodes", []))
        if node_id in failed_nodes:
            failed_nodes.remove(node_id)
        else:
            failed_nodes.add(node_id)
        run["config"]["failed_nodes"] = list(failed_nodes)
        run["updated_at"] = time.time()
        return {"run_id": run_id, "failed_nodes": run["config"]["failed_nodes"]}


def run_simulation(data):
    return run_engine(data)