import random
from .constants import INSTANCE_OVERLOAD_THRESHOLD

def calculate_throughput(
    node_type:          str,
    config_values:      dict,
    traffic_multiplier: float,
    replica_count:      int = 1,
) -> float:
    """
    Estimate request throughput (req/s) a node can handle.
    Derived from instance size × replica count × traffic pressure.
    """
    instance_key = (
        config_values.get("type")          or   # VM
        config_values.get("computeConfig") or   # DB
        "default"
    )
    max_tput = INSTANCE_OVERLOAD_THRESHOLD.get(instance_key, 80.0)

    # Scale by replicas
    max_tput *= max(1, replica_count) ** 0.7    # sub-linear scaling

    # Actual traffic load
    actual = traffic_multiplier * 8 + random.random() * 4
    return round(min(actual, max_tput * 1.1), 1)   # can briefly exceed limit


def is_overloaded(
    node_type:          str,
    config_values:      dict,
    throughput:         float,
    replica_count:      int = 1,
) -> bool:
    """Return True if actual throughput exceeds the node's capacity."""
    instance_key = (
        config_values.get("type")          or
        config_values.get("computeConfig") or
        "default"
    )
    max_tput = INSTANCE_OVERLOAD_THRESHOLD.get(instance_key, 80.0)
    max_tput *= max(1, replica_count) ** 0.7
    return throughput > max_tput


# ═══════════════════════════════════════════════════════════════════════════
#  GRAPH UTILITIES
# ═══════════════════════════════════════════════════════════════════════════

