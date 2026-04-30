"""Integration tests for API endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealthEndpoint:
    """Tests for health check endpoint."""
    
    def test_returns_health_status(self):
        """Should return health status."""
        response = client.get("/")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "ok"
        assert "service" in data
        assert "version" in data
    
    def test_returns_correct_service_name(self):
        """Should return correct service name."""
        response = client.get("/")
        data = response.json()
        assert data["service"] == "CASE Backend"


class TestDomainsEndpoint:
    """Tests for domains endpoint."""
    
    def test_returns_domain_components(self):
        """Should return domain components."""
        response = client.get("/api/domains/")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_has_correct_domain_structure(self):
        """Should have correct domain structure."""
        response = client.get("/api/domains/")
        data = response.json()
        
        for domain in data:
            assert "domain" in domain
            assert "items" in domain
            assert isinstance(domain["items"], list)
            
            for item in domain["items"]:
                assert "kind" in item
                assert "icon" in item
                assert "description" in item
    
    def test_includes_all_expected_domains(self):
        """Should include all expected domains."""
        response = client.get("/api/domains/")
        data = response.json()
        
        domains = [d["domain"] for d in data]
        assert "Compute" in domains
        assert "Storage" in domains
        assert "Database" in domains
        assert "Network" in domains
        assert "Security" in domains


class TestTemplatesEndpoint:
    """Tests for templates endpoint."""
    
    def test_returns_templates_object(self):
        """Should return templates object."""
        response = client.get("/api/templates/")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, dict)
        assert len(data) > 0
    
    def test_has_correct_template_structure(self):
        """Should have correct template structure."""
        response = client.get("/api/templates/")
        data = response.json()
        
        for template in data.values():
            assert "nodes" in template
            assert "edges" in template
            assert isinstance(template["nodes"], list)
            assert isinstance(template["edges"], list)
    
    def test_includes_predefined_templates(self):
        """Should include predefined templates."""
        response = client.get("/api/templates/")
        data = response.json()
        
        assert "3-tier web app" in data
        assert "secure event pipeline" in data
    
    def test_returns_specific_template(self):
        """Should return specific template."""
        response = client.get("/api/templates/3-tier%20web%20app")
        assert response.status_code == 200
        
        data = response.json()
        assert "nodes" in data
        assert "edges" in data
    
    def test_returns_404_for_non_existent_template(self):
        """Should return 404 for non-existent template."""
        response = client.get("/api/templates/non-existent")
        assert response.status_code == 404
        
        data = response.json()
        assert "error" in data


class TestSimulationEndpoint:
    """Tests for simulation endpoint."""
    
    @pytest.fixture
    def valid_simulation_input(self):
        """Fixture for valid simulation input."""
        return {
            "nodes": [
                {
                    "id": "n1",
                    "domain": "Network",
                    "kind": "Load Balancer",
                    "status": "healthy",
                    "rps": 100,
                    "latency": 50,
                    "x": 100,
                    "y": 100
                },
                {
                    "id": "n2",
                    "domain": "Compute",
                    "kind": "Container Service",
                    "status": "healthy",
                    "rps": 80,
                    "latency": 60,
                    "x": 300,
                    "y": 100
                }
            ],
            "edges": [
                {"id": "e1", "from": "n1", "to": "n2"}
            ],
            "steps": 5
        }
    
    def test_runs_simulation_successfully(self, valid_simulation_input):
        """Should run simulation successfully."""
        response = client.post("/api/simulate/", json=valid_simulation_input)
        assert response.status_code == 200
        
        data = response.json()
        assert "success" in data
        assert data["success"] is True
        assert "simulation" in data
        assert isinstance(data["simulation"], list)
    
    def test_returns_correct_number_of_steps(self, valid_simulation_input):
        """Should return correct number of simulation steps."""
        response = client.post("/api/simulate/", json=valid_simulation_input)
        data = response.json()
        
        assert len(data["simulation"]) == 6  # Initial + 5 steps
    
    def test_uses_default_steps(self, valid_simulation_input):
        """Should use default steps if not provided."""
        input_data = valid_simulation_input.copy()
        del input_data["steps"]
        
        response = client.post("/api/simulate/", json=input_data)
        data = response.json()
        
        assert len(data["simulation"]) == 11  # Initial + 10 default steps
        assert data["steps"] == 10
    
    def test_returns_400_if_nodes_missing(self):
        """Should return 422 if nodes missing."""
        response = client.post(
            "/api/simulate/",
            json={"edges": []}
        )
        assert response.status_code == 422
    
    def test_returns_400_if_edges_missing(self):
        """Should return 422 if edges missing."""
        response = client.post(
            "/api/simulate/",
            json={"nodes": [{"id": "n1", "rps": 100, "latency": 50, "status": "healthy"}]}
        )
        assert response.status_code == 422
    
    def test_returns_400_if_steps_out_of_range(self, valid_simulation_input):
        """Should return 400 if steps out of range."""
        input_data = valid_simulation_input.copy()
        input_data["steps"] = 2000
        
        response = client.post("/api/simulate/", json=input_data)
        assert response.status_code == 400
        
        data = response.json()
        assert "detail" in data or "error" in data
    
    def test_returns_400_if_steps_not_integer(self, valid_simulation_input):
        """Should return 422 if steps is not integer."""
        input_data = valid_simulation_input.copy()
        input_data["steps"] = 5.5
        
        response = client.post("/api/simulate/", json=input_data)
        assert response.status_code == 422
    
    def test_returns_400_for_invalid_node_references(self, valid_simulation_input):
        """Should return 400 for invalid node references in edges."""
        input_data = valid_simulation_input.copy()
        input_data["edges"] = [{"id": "e1", "from": "n1", "to": "n99"}]
        
        response = client.post("/api/simulate/", json=input_data)
        assert response.status_code == 400
        
        data = response.json()
        assert "detail" in data or "error" in data
    
    def test_simulates_metric_changes(self, valid_simulation_input):
        """Should simulate metric changes."""
        response = client.post("/api/simulate/", json=valid_simulation_input)
        data = response.json()
        
        initial_node = data["simulation"][0][0]
        last_node = data["simulation"][-1][0]
        
        # At least one metric should have changed
        rps_changed = initial_node["rps"] != last_node["rps"]
        latency_changed = initial_node["latency"] != last_node["latency"]
        
        assert rps_changed or latency_changed


class TestErrorHandling:
    """Tests for error handling."""
    
    def test_returns_404_for_non_existent_endpoint(self):
        """Should return 404 for non-existent endpoint."""
        response = client.get("/api/non-existent")
        assert response.status_code == 404
        
        data = response.json()
        assert "error" in data
