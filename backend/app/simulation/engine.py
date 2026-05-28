import random
from datetime import datetime
from typing import Any


def _timestamp() -> str:
    return datetime.now().strftime("%H:%M:%S")


def _mk_log(level: str, message: str, request_id=None) -> dict[str, Any]:
    return {
        "id": f"log-{int(datetime.now().timestamp() * 1000)}-{random.randint(1000, 9999)}",
        "timestamp": _timestamp(),
        "level": level,
        "request_id": request_id,
        "message": message,
    }


BASE_LATENCY = {
    "loadbalancer": 5,
    "apigateway": 8,
    "vm": 20,
    "container": 15,
    "serverless": 30,
    "database": 45,
    "mysql": 50,
    "postgresql": 48,
    "oracle": 55,
    "redis": 3,
    "cache": 3,
    "queue": 10,
    "kafka": 8,
    "storage": 25,
    "cdn": 12,
    "default": 20,
}


def _base_latency(node_type: str) -> int:
    key = (node_type or "").lower()
    return BASE_LATENCY.get(key, BASE_LATENCY["default"])


def _build_graph(edges: list[dict[str, Any]]) -> dict[str, list[str]]:
    graph: dict[str, list[str]] = {}
    for edge in edges:
        src = edge["source"]
        tgt = edge["target"]
        if src not in graph:
            graph[src] = []
        graph[src].append(tgt)
    return graph


def _find_roots(nodes: list[dict[str, Any]], edges: list[dict[str, Any]]) -> list[str]:
    incoming = {e["target"] for e in edges}
    roots = [n["id"] for n in nodes if n["id"] not in incoming]
    if roots:
        return roots
    return [nodes[0]["id"]] if nodes else []


def _edge_id(edges: list[dict[str, Any]], src: str, tgt: str) -> str:
    for edge in edges:
        if edge["source"] == src and edge["target"] == tgt:
            return edge.get("id") or f"{src}-{tgt}"
    return f"{src}-{tgt}"


def empty_state() -> dict[str, Any]:
    return {
        "node_metrics": {},
        "system_metrics": {
            "totalThroughput": 0,
            "avgLatency": 0,
            "errorRate": 0,
            "activeRequests": 0,
            "droppedRequests": 0,
        },
        "logs": [],
        "active_edges": [],
        "request_counter": 100,
    }


def run_tick(config: dict[str, Any], prev_state: dict[str, Any]) -> dict[str, Any]:
    nodes = config.get("nodes", [])
    edges = config.get("edges", [])
    traffic = int(config.get("traffic", 1))
    chaos = bool(config.get("chaos", False))
    failed_nodes = set(config.get("failed_nodes", []))

    if not nodes:
        return prev_state

    graph = _build_graph(edges)
    roots = _find_roots(nodes, edges)
    node_map = {n["id"]: n for n in nodes}

    node_metrics: dict[str, dict[str, Any]] = {}
    for node in nodes:
        prev = prev_state["node_metrics"].get(node["id"], {})
        node_metrics[node["id"]] = {
            "nodeId": node["id"],
            "throughput": prev.get("throughput", 0),
            "latency": prev.get("latency", 0),
            "errorRate": prev.get("errorRate", 0),
            "isFailed": node["id"] in failed_nodes,
            "isOverloaded": False,
        }

    new_logs: list[dict[str, Any]] = []
    active_edges: set[str] = set()
    req_count = max(1, round(traffic * 1.5))
    total_latency = 0
    completed = 0
    dropped = int(prev_state["system_metrics"].get("droppedRequests", 0))
    counter = int(prev_state.get("request_counter", 100))

    for i in range(req_count):
        counter += 1
        req_id = counter
        root = roots[i % len(roots)]
        current = root
        req_latency = 0
        path_labels: list[str] = []
        seen = set()
        dropped_req = False

        while current and current not in seen:
            seen.add(current)
            node = node_map.get(current)
            if not node:
                break

            label = node.get("label") or node["id"]
            if current in failed_nodes:
                new_logs.insert(0, _mk_log("error", f"Request {req_id} DROPPED - {label} is FAILED", req_id))
                dropped += 1
                dropped_req = True
                node_metrics[current]["errorRate"] = min(1, node_metrics[current]["errorRate"] + 0.15)
                break

            path_labels.append(label)
            base = _base_latency(node.get("type", ""))
            jitter = (random.random() - 0.5) * base * 0.4
            load = traffic / 10
            latency = round(base * (1 + load * 1.5) + jitter)
            req_latency += latency

            alpha = 0.3
            m = node_metrics[current]
            m["latency"] = round(m["latency"] * (1 - alpha) + latency * alpha)
            m["throughput"] = round(m["throughput"] * (1 - alpha) + (traffic * 2 + random.random() * 5) * alpha)
            m["errorRate"] = max(0, m["errorRate"] * 0.9)
            m["isOverloaded"] = m["throughput"] > 80 or m["latency"] > 200

            if chaos and random.random() < 0.012 and current not in failed_nodes:
                new_logs.insert(0, _mk_log("error", f"{label} FAILED - chaos injection", None))

            neighbors = graph.get(current, [])
            if not neighbors:
                break

            nxt = random.choice(neighbors)
            active_edges.add(_edge_id(edges, current, nxt))
            current = nxt

        if not dropped_req:
            total_latency += req_latency
            completed += 1
            if len(path_labels) > 1:
                level = "warn" if req_latency > 300 else "success"
                new_logs.insert(0, _mk_log(level, f"Request {req_id} -> {' -> '.join(path_labels)} ({req_latency}ms)", req_id))

    avg_latency = round(total_latency / completed) if completed > 0 else 0
    total_tput = sum(m["throughput"] for m in node_metrics.values())
    error_rate = dropped / max(1, dropped + completed + prev_state["system_metrics"].get("activeRequests", 0))
    logs = (new_logs + prev_state.get("logs", []))[:200]

    return {
        "node_metrics": node_metrics,
        "system_metrics": {
            "totalThroughput": total_tput,
            "avgLatency": avg_latency,
            "errorRate": round(error_rate * 100),
            "activeRequests": completed,
            "droppedRequests": dropped,
        },
        "logs": logs,
        "active_edges": list(active_edges),
        "request_counter": counter,
    }


def _normalize_payload(data: Any) -> dict[str, Any]:
    payload = data if isinstance(data, dict) else data.model_dump()
    nodes = payload.get("nodes", [])
    edges = payload.get("edges", [])
    normalized_nodes = [n if isinstance(n, dict) else n.model_dump() for n in nodes]
    normalized_edges = [e if isinstance(e, dict) else e.model_dump() for e in edges]
    return {
        "nodes": normalized_nodes,
        "edges": normalized_edges,
        "traffic": int(payload.get("traffic", 1)),
        "chaos": bool(payload.get("chaos", False)),
        "failed_nodes": list(payload.get("failed_nodes", [])),
    }


def run_engine(data: Any) -> dict[str, Any]:
    payload = _normalize_payload(data)
    state = empty_state()
    state = run_tick(payload, state)
    return {
        "latency": state["system_metrics"]["avgLatency"],
        "throughput": state["system_metrics"]["totalThroughput"],
        "error_rate": state["system_metrics"]["errorRate"],
        "cost": round(int(payload.get("traffic", 1)) * 0.01, 2),
        "state": state,
    }