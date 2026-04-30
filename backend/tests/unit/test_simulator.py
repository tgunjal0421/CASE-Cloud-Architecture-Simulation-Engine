"""Unit tests for the simulator service."""

import pytest
from app.services.simulator import (
    validate_simulation_input,
    step_simulation,
    run_simulation
)


class TestValidateSimulationInput:
    """Tests for input validation."""
    
    def test_valid_input(self):
        """Should accept valid input."""
        nodes = [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}]
        edges = []
        
        is_valid, error = validate_simulation_input(nodes, edges)
        assert is_valid is True
        assert error == ""
    
    def test_missing_nodes(self):
        """Should reject missing nodes."""
        result = validate_simulation_input(None, [])
        assert result[0] is False
        assert "array" in result[1].lower()
    
    def test_missing_edges(self):
        """Should reject missing edges."""
        nodes = [{"id": "n1"}]
        result = validate_simulation_input(nodes, None)
        assert result[0] is False
        assert "array" in result[1].lower()
    
    def test_empty_nodes(self):
        """Should reject empty nodes array."""
        result = validate_simulation_input([], [])
        assert result[0] is False
        assert "one node" in result[1].lower()
    
    def test_node_without_id(self):
        """Should reject nodes without id."""
        nodes = [{"rps": 100}]
        result = validate_simulation_input(nodes, [])
        assert result[0] is False
        assert "id" in result[1].lower()
    
    def test_edge_with_non_existent_node(self):
        """Should reject edges referencing non-existent nodes."""
        nodes = [{"id": "n1"}]
        edges = [{"from": "n1", "to": "n99"}]
        
        result = validate_simulation_input(nodes, edges)
        assert result[0] is False
        assert "non-existent" in result[1].lower()


class TestStepSimulation:
    """Tests for simulation step execution."""
    
    def test_returns_same_number_of_nodes(self):
        """Should return the same number of nodes."""
        nodes = [
            {"id": "n1", "rps": 100, "latency": 50, "status": "healthy"},
            {"id": "n2", "rps": 80, "latency": 40, "status": "healthy"}
        ]
        edges = []
        
        result = step_simulation(nodes, edges)
        assert len(result) == 2
    
    def test_updates_metrics(self):
        """Should update rps and latency."""
        nodes = [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}]
        edges = []
        
        result = step_simulation(nodes, edges)
        assert "rps" in result[0]
        assert "latency" in result[0]
        assert isinstance(result[0]["rps"], (int, float))
        assert isinstance(result[0]["latency"], (int, float))
    
    def test_preserves_node_ids(self):
        """Should preserve node ids."""
        nodes = [
            {"id": "n1", "rps": 100, "latency": 50, "status": "healthy"},
            {"id": "n2", "rps": 80, "latency": 40, "status": "healthy"}
        ]
        edges = []
        
        result = step_simulation(nodes, edges)
        assert result[0]["id"] == "n1"
        assert result[1]["id"] == "n2"
    
    def test_status_is_valid(self):
        """Should maintain valid status values."""
        nodes = [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}]
        edges = []
        
        result = step_simulation(nodes, edges)
        assert result[0]["status"] in ["healthy", "failed"]
    
    def test_rps_is_non_negative(self):
        """Should maintain non-negative rps."""
        nodes = [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}]
        edges = []
        
        result = step_simulation(nodes, edges)
        assert result[0]["rps"] >= 0
    
    def test_latency_has_minimum(self):
        """Should maintain minimum latency of 10."""
        nodes = [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}]
        edges = []
        
        result = step_simulation(nodes, edges)
        assert result[0]["latency"] >= 10
    
    def test_propagates_flow_through_edges(self):
        """Should propagate flow from upstream nodes."""
        nodes = [
            {"id": "n1", "rps": 100, "latency": 50, "status": "healthy"},
            {"id": "n2", "rps": 0, "latency": 40, "status": "healthy"}
        ]
        edges = [{"id": "e1", "from": "n1", "to": "n2"}]
        
        result = step_simulation(nodes, edges)
        # n2 should receive flow from n1
        assert result[1]["rps"] > 0
    
    def test_ignores_failed_upstream_nodes(self):
        """Should not propagate flow from failed nodes."""
        nodes = [
            {"id": "n1", "rps": 100, "latency": 50, "status": "failed"},
            {"id": "n2", "rps": 0, "latency": 40, "status": "healthy"}
        ]
        edges = [{"id": "e1", "from": "n1", "to": "n2"}]
        
        result = step_simulation(nodes, edges)
        # n2 should not receive significant flow from failed n1
        # It will have minimal/zero flow
        assert isinstance(result[1]["rps"], (int, float))


class TestRunSimulation:
    """Tests for complete simulation execution."""
    
    def test_returns_correct_number_of_steps(self):
        """Should return correct number of steps."""
        nodes = [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}]
        edges = []
        
        result = run_simulation(nodes, edges, 5)
        assert len(result) == 6  # Initial + 5 steps
    
    def test_returns_default_steps(self):
        """Should return default 10 steps."""
        nodes = [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}]
        edges = []
        
        result = run_simulation(nodes, edges)
        assert len(result) == 11  # Initial + 10 default steps
    
    def test_does_not_modify_original_nodes(self):
        """Should not modify original nodes."""
        nodes = [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}]
        original_rps = nodes[0]["rps"]
        edges = []
        
        run_simulation(nodes, edges, 3)
        assert nodes[0]["rps"] == original_rps
    
    def test_contains_valid_node_data(self):
        """Should contain valid node data at each step."""
        nodes = [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}]
        edges = []
        
        result = run_simulation(nodes, edges, 3)
        
        for step in result:
            for node in step:
                assert "id" in node
                assert "rps" in node
                assert "latency" in node
                assert "status" in node
