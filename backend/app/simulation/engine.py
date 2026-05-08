from app.simulation.component_registry import COMPONENT_REGISTRY


def run_engine(data):
    total_latency = 0

    # process all nodes
    for node in data.nodes:

        component = COMPONENT_REGISTRY.get(node.type)

        if component:
            total_latency += component.process()

    # traffic impact
    if data.traffic > 5000:
        total_latency += 40

    # chaos mode
    error_rate = 0

    if data.chaos:
        error_rate = 15
        total_latency += 20

    throughput = min(data.traffic, 5000)

    cost = round(data.traffic * 0.01, 2)

    return {
        "latency": total_latency,
        "throughput": throughput,
        "error_rate": error_rate,
        "cost": cost,
    }