from __future__ import annotations
import uuid
import random
from collections import defaultdict
from .graph_utils import _build_graph, _find_roots, _timestamp, _replica_count
from .latency import calculate_latency
from .throughput import calculate_throughput, is_overloaded

def run_simulation(
    nodes:              list[dict],
    edges:              list[dict],
    traffic_multiplier: float,
    failure_mode:       bool,
    failed_node_ids:    set[str] | None = None,
) -> dict:
    """
    Run one full simulation pass over the architecture graph.

    Each node in `nodes` must carry:
        node["data"]["type"]          — component type string
        node["data"]["label"]         — display name
        node["data"]["config_values"] — dict of user-filled form fields
                                        (saved by ComponentConfigModal)

    Returns:
        node_metrics:   { node_id: { latency, throughput, error_rate, ... } }
        system_metrics: { avg_latency, total_throughput, error_rate, ... }
        logs:           [ { id, timestamp, level, message } ]
        active_edges:   [ edge_id, ... ]
    """
    if not nodes:
        return _empty_result()

    failed_node_ids = failed_node_ids or set()
    graph    = _build_graph(edges)
    roots    = _find_roots(nodes, edges)
    node_map = {n["id"]: n for n in nodes}
    edge_map = {(e["source"], e["target"]): e["id"] for e in edges}

    # Per-node accumulators
    node_latency_samples: dict[str, list[float]] = defaultdict(list)
    node_tput_acc:        dict[str, float]        = defaultdict(float)
    node_errors:          dict[str, int]          = defaultdict(int)
    active_edges:         set[str]                = set()
    logs:                 list[dict]              = []
    dropped   = 0
    completed = 0
    total_lat = 0.0

    # Number of simulated requests = proportional to traffic
    req_count = max(1, round(traffic_multiplier * 3))
    _req_id   = [1000]

    def next_req_id() -> int:
        _req_id[0] += 1
        return _req_id[0]

    # ── Simulate each request ─────────────────────────────────────────────
    for i in range(req_count):
        req_id        = next_req_id()
        root          = roots[i % len(roots)]
        current       = root
        path_labels:  list[str]  = []
        path_lat:     list[float]= []
        total_req_lat = 0.0
        dropped_this  = False
        visited:      set[str]   = set()

        while current and current not in visited:
            visited.add(current)
            node = node_map.get(current)
            if not node:
                break

            node_data    = node.get("data", {})
            node_type    = node_data.get("type",   "default")
            node_label   = node_data.get("label",  current)
            # ← THIS IS THE KEY LINE: read the user's configured specs
            config_vals  = node_data.get("config_values") or {}
            replicas     = _replica_count(node_type, config_vals)
            is_failed    = current in failed_node_ids

            # ── Failed node → drop request ────────────────────────────────
            if is_failed:
                logs.append({
                    "id":         str(uuid.uuid4()),
                    "timestamp":  _timestamp(),
                    "level":      "error",
                    "request_id": req_id,
                    "message":    f"Req {req_id} DROPPED — {node_label} is FAILED",
                })
                node_errors[current] += 1
                dropped     += 1
                dropped_this = True
                break

            path_labels.append(node_label)

            # ── Calculate spec-driven latency ─────────────────────────────
            latency = calculate_latency(
                node_type          = node_type,
                config_values      = config_vals,
                traffic_multiplier = traffic_multiplier,
                replica_count      = replicas,
            )
            path_lat.append(latency)
            total_req_lat              += latency
            node_latency_samples[current].append(latency)

            # ── Accumulate throughput ─────────────────────────────────────
            tput = calculate_throughput(
                node_type          = node_type,
                config_values      = config_vals,
                traffic_multiplier = traffic_multiplier,
                replica_count      = replicas,
            )
            node_tput_acc[current] += tput

            # ── Chaos mode — random failure injection ─────────────────────
            if failure_mode and random.random() < 0.012:
                logs.append({
                    "id":         str(uuid.uuid4()),
                    "timestamp":  _timestamp(),
                    "level":      "warn",
                    "request_id": None,
                    "message":    f"⚡ Chaos: {node_label} transient spike ({latency:.0f}ms)",
                })

            # ── Latency warning ───────────────────────────────────────────
            if latency > 250:
                logs.append({
                    "id":         str(uuid.uuid4()),
                    "timestamp":  _timestamp(),
                    "level":      "warn",
                    "request_id": req_id,
                    "message":    f"Slow: {node_label} — {latency:.0f}ms (check specs)",
                })

            # ── Walk to next node ─────────────────────────────────────────
            neighbours = graph.get(current, [])
            if neighbours:
                next_node = neighbours[random.randint(0, len(neighbours) - 1)]
                eid = edge_map.get((current, next_node))
                if eid:
                    active_edges.add(eid)
                current = next_node
            else:
                break   # leaf node — request complete

        # ── Request completed ─────────────────────────────────────────────
        if not dropped_this:
            completed     += 1
            total_lat     += total_req_lat
            level = "warn" if total_req_lat > 400 else "success"
            if len(path_labels) >= 1:
                logs.append({
                    "id":         str(uuid.uuid4()),
                    "timestamp":  _timestamp(),
                    "level":      level,
                    "request_id": req_id,
                    "message":    (
                        f"Req {req_id}: {' → '.join(path_labels)} "
                        f"| total {total_req_lat:.0f}ms"
                    ),
                })

    # ── Build per-node metrics ────────────────────────────────────────────
    node_metrics: dict[str, dict] = {}
    for node in nodes:
        nid         = node["id"]
        node_data   = node.get("data", {})
        node_type   = node_data.get("type", "default")
        config_vals = node_data.get("config_values") or {}
        replicas    = _replica_count(node_type, config_vals)

        lats    = node_latency_samples[nid]
        tput    = node_tput_acc[nid]
        errs    = node_errors[nid]
        avg_lat = round(sum(lats) / len(lats), 1) if lats else 0.0
        err_rt  = round(errs / max(1, req_count), 4)
        overld  = is_overloaded(node_type, config_vals, tput, replicas)

        node_metrics[nid] = {
            "node_id":       nid,
            "throughput":    round(tput, 1),
            "latency":       avg_lat,
            "error_rate":    err_rt,
            "is_failed":     nid in failed_node_ids,
            "is_overloaded": overld,
        }

        # Log overload event
        if overld:
            logs.append({
                "id":         str(uuid.uuid4()),
                "timestamp":  _timestamp(),
                "level":      "error",
                "request_id": None,
                "message":    (
                    f"OVERLOAD: {node_data.get('label', nid)} "
                    f"({tput:.0f} r/s > capacity) — upgrade instance or add replicas"
                ),
            })

    # ── System-wide metrics ───────────────────────────────────────────────
    avg_lat    = round(total_lat / completed, 1) if completed > 0 else 0.0
    total_tput = round(sum(m["throughput"] for m in node_metrics.values()), 1)
    err_pct    = round((dropped / max(1, dropped + completed)) * 100, 1)

    system_metrics = {
        "total_throughput": total_tput,
        "avg_latency":      avg_lat,
        "error_rate":       err_pct,
        "active_requests":  completed,
        "dropped_requests": dropped,
    }

    return {
        "node_metrics":   node_metrics,
        "system_metrics": system_metrics,
        "logs":           logs[-100:],
        "active_edges":   list(active_edges),
    }


def _empty_result() -> dict:
    return {
        "node_metrics":   {},
        "system_metrics": {
            "total_throughput": 0.0,
            "avg_latency":      0.0,
            "error_rate":       0.0,
            "active_requests":  0,
            "dropped_requests": 0,
        },
        "logs":        [],
        "active_edges":[],
    }
