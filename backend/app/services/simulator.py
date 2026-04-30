"""Simulation engine for cloud architecture performance calculations."""

import random
from typing import List, Dict, Any, Tuple


def validate_simulation_input(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Tuple[bool, str]:
    """
    Validates simulation input.
    
    Args:
        nodes: List of node objects
        edges: List of edge connections
        
    Returns:
        Tuple of (is_valid: bool, error_message: str)
    """
    if not isinstance(nodes, list):
        return False, "Nodes must be an array"
    
    if not isinstance(edges, list):
        return False, "Edges must be an array"
    
    if len(nodes) == 0:
        return False, "At least one node is required"
    
    # Validate node structure
    for node in nodes:
        if not isinstance(node, dict) or "id" not in node:
            return False, "Each node must have an id"
    
    # Validate edges reference existing nodes
    node_ids = set(node["id"] for node in nodes)
    for edge in edges:
        if "from" not in edge or "to" not in edge:
            return False, "Each edge must have 'from' and 'to' fields"
        if edge["from"] not in node_ids or edge["to"] not in node_ids:
            return False, "Edge references non-existent node"
    
    return True, ""


def step_simulation(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Simulates a single step of the architecture.
    
    Args:
        nodes: Array of node objects
        edges: Array of edge connections
        
    Returns:
        Updated nodes with new metrics
    """
    # Create node lookup map
    by_id = {node["id"]: node for node in nodes}
    incoming = {node["id"]: [] for node in nodes}
    
    # Map edges to identify downstream dependencies
    for edge in edges:
        if edge["to"] in incoming:
            incoming[edge["to"]].append(edge["from"])
    
    # Calculate new metrics for each node
    updated_nodes = []
    for node in nodes:
        upstream_ids = incoming.get(node["id"], [])
        
        # Calculate traffic from upstream nodes
        upstream_flow = 0
        for upstream_id in upstream_ids:
            upstream_node = by_id.get(upstream_id)
            if upstream_node and upstream_node["status"] != "failed":
                upstream_flow += upstream_node["rps"] * 0.68  # 68% throughput assumption
        
        # Calculate new RPS with variation
        new_rps = max(0, upstream_flow + (random.random() - 0.5) * 20)
        
        # Calculate new latency with variation
        new_latency = max(10, node["latency"] + (random.random() - 0.5) * 10)
        
        # Determine status (95% healthy, 5% failed)
        new_status = "healthy" if random.random() < 0.95 else "failed"
        
        updated_node = node.copy()
        updated_node["rps"] = round(new_rps)
        updated_node["latency"] = round(new_latency)
        updated_node["status"] = new_status
        
        updated_nodes.append(updated_node)
    
    return updated_nodes


def run_simulation(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], steps: int = 10) -> List[List[Dict[str, Any]]]:
    """
    Run a complete simulation.
    
    Args:
        nodes: Initial nodes
        edges: Edge connections
        steps: Number of simulation steps (default: 10)
        
    Returns:
        Array of node states at each step
    """
    # Deep copy initial nodes
    import copy
    current_nodes = copy.deepcopy(nodes)
    results = [copy.deepcopy(current_nodes)]
    
    for _ in range(steps):
        current_nodes = step_simulation(current_nodes, edges)
        results.append(copy.deepcopy(current_nodes))
    
    return results
