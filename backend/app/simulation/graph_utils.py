from collections import defaultdict
from datetime import datetime, timezone

def _build_graph(edges: list[dict]) -> dict[str, list[str]]:
    graph: dict[str, list[str]] = defaultdict(list)
    for edge in edges:
        graph[edge["source"]].append(edge["target"])
    return dict(graph)


def _find_roots(nodes: list[dict], edges: list[dict]) -> list[str]:
    """Nodes with no incoming edges are traffic entry points."""
    has_incoming = {e["target"] for e in edges}
    roots = [n["id"] for n in nodes if n["id"] not in has_incoming]
    return roots if roots else ([nodes[0]["id"]] if nodes else [])


def _timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%H:%M:%S")


def _replica_count(node_type: str, config_values: dict) -> int:
    """Extract replica / instance count from config."""
    if node_type == "vm":
        return int(config_values.get("numberOfInstances", 1))
    if node_type == "autoscaling":
        # Use current desired (middle of min/max)
        mn  = int(config_values.get("minimumSize", 1))
        mx  = int(config_values.get("maximumSize", 10))
        return max(mn, (mn + mx) // 2)
    return 1


# ═══════════════════════════════════════════════════════════════════════════
#  MAIN SIMULATION RUNNER
# ═══════════════════════════════════════════════════════════════════════════

