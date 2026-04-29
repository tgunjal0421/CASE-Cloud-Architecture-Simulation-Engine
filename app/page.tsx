"use client";
// app/page.tsx — Root orchestrator for all state and API calls

import React, { useState, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
} from "reactflow";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import ArchitectureCanvas from "@/components/builder/ArchitectureCanvas";
import ScenarioControls from "@/components/controls/ScenarioControls";
import { ToastContainer, useToast } from "@/components/layout/Toast";

import {
  runSimulation,
  saveArchitecture,
  fetchMetrics,
  fetchCostEstimate,
  resetArchitecture,
  MetricsResponse,
  CostEstimateResponse,
} from "@/lib/api";
import { SCENARIO_PRESETS, ARCHITECTURE_TEMPLATES } from "@/lib/mockData";
import { CaseNodeData } from "@/components/builder/CustomNode";

function buildTemplateNodes(templateId: string): { nodes: Node<CaseNodeData>[]; edges: Edge[] } {
  if (templateId === "three-tier") {
    return {
      nodes: [
        { id: "lb-1", type: "caseNode", position: { x: 250, y: 60 }, data: { label: "Load Balancer", type: "loadbalancer" } },
        { id: "vm-1", type: "caseNode", position: { x: 100, y: 200 }, data: { label: "App Server 1", type: "vm" } },
        { id: "vm-2", type: "caseNode", position: { x: 280, y: 200 }, data: { label: "App Server 2", type: "vm" } },
        { id: "db-1", type: "caseNode", position: { x: 190, y: 340 }, data: { label: "Primary DB", type: "database" } },
      ],
      edges: [
        { id: "e1", source: "lb-1", target: "vm-1", animated: true },
        { id: "e2", source: "lb-1", target: "vm-2", animated: true },
        { id: "e3", source: "vm-1", target: "db-1", animated: true },
        { id: "e4", source: "vm-2", target: "db-1", animated: true },
      ],
    };
  }
  if (templateId === "microservices") {
    return {
      nodes: [
        { id: "gw-1", type: "caseNode", position: { x: 300, y: 30 }, data: { label: "API Gateway", type: "apigateway" } },
        { id: "svc-1", type: "caseNode", position: { x: 80, y: 160 }, data: { label: "Auth Service", type: "vm" } },
        { id: "svc-2", type: "caseNode", position: { x: 240, y: 160 }, data: { label: "Order Service", type: "vm" } },
        { id: "svc-3", type: "caseNode", position: { x: 400, y: 160 }, data: { label: "Notify Service", type: "vm" } },
        { id: "q-1", type: "caseNode", position: { x: 400, y: 290 }, data: { label: "Message Queue", type: "queue" } },
        { id: "db-1", type: "caseNode", position: { x: 80, y: 290 }, data: { label: "User DB", type: "database" } },
        { id: "db-2", type: "caseNode", position: { x: 240, y: 290 }, data: { label: "Orders DB", type: "database" } },
        { id: "cache-1", type: "caseNode", position: { x: 560, y: 160 }, data: { label: "Redis Cache", type: "cache" } },
      ],
      edges: [
        { id: "e1", source: "gw-1", target: "svc-1", animated: true },
        { id: "e2", source: "gw-1", target: "svc-2", animated: true },
        { id: "e3", source: "gw-1", target: "svc-3", animated: true },
        { id: "e4", source: "svc-1", target: "db-1", animated: true },
        { id: "e5", source: "svc-2", target: "db-2", animated: true },
        { id: "e6", source: "svc-3", target: "q-1", animated: true },
        { id: "e7", source: "svc-2", target: "cache-1", animated: true },
      ],
    };
  }
  if (templateId === "cdn-static") {
    return {
      nodes: [
        { id: "st-1", type: "caseNode", position: { x: 200, y: 60 }, data: { label: "Object Storage", type: "storage" } },
        { id: "lb-1", type: "caseNode", position: { x: 80, y: 200 }, data: { label: "CDN Edge A", type: "loadbalancer" } },
        { id: "lb-2", type: "caseNode", position: { x: 320, y: 200 }, data: { label: "CDN Edge B", type: "loadbalancer" } },
      ],
      edges: [
        { id: "e1", source: "st-1", target: "lb-1", animated: true },
        { id: "e2", source: "st-1", target: "lb-2", animated: true },
      ],
    };
  }
  return { nodes: [], edges: [] };
}

export default function CasePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CaseNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [trafficMultiplier, setTrafficMultiplier] = useState(1);
  const [failureMode, setFailureMode] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [costData, setCostData] = useState<CostEstimateResponse | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [isCostLoading, setIsCostLoading] = useState(false);
  const [lastRunId, setLastRunId] = useState<string | null>(null);

  const { toasts, addToast, dismissToast } = useToast();

  const handleNodeAdd = useCallback(
    (newNode: Node<CaseNodeData>) => {
      setNodes((prev) => {
        const updated = [...prev, newNode];
        fetchCostEstimate(updated.length).then(setCostData).catch(console.error);
        return updated;
      });
    },
    [setNodes]
  );

  const handleEdgesAdd = useCallback((newEdges: Edge[]) => setEdges(newEdges), [setEdges]);

  const handleRunSimulation = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsMetricsLoading(true);
    try {
      const result = await runSimulation({ nodes, edges, trafficMultiplier, failureMode });
      setLastRunId(result.runId);
      const metricsResult = await fetchMetrics();
      setMetrics(metricsResult);
      addToast("success", "Simulation complete", result.summary);
    } catch (err) {
      console.error(err);
      addToast("error", "Simulation failed", "Check console for details");
    } finally {
      setIsRunning(false);
      setIsMetricsLoading(false);
    }
  }, [isRunning, nodes, edges, trafficMultiplier, failureMode, addToast]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const result = await saveArchitecture({ name: `Architecture ${new Date().toLocaleDateString()}`, nodes, edges });
      addToast("success", "Saved", `ID: ${result.id}`);
    } catch {
      addToast("error", "Save failed", "Could not reach backend");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, nodes, edges, addToast]);

  const handleReset = useCallback(async () => {
    setNodes([]); setEdges([]); setMetrics(null); setCostData(null);
    setLastRunId(null); setActivePresetId(null); setTrafficMultiplier(1); setFailureMode(false);
    await resetArchitecture();
    addToast("info", "Canvas cleared");
  }, [setNodes, setEdges, addToast]);

  const handleLoadTemplate = useCallback(
    (templateId: string) => {
      const { nodes: templateNodes, edges: templateEdges } = buildTemplateNodes(templateId);
      setNodes(templateNodes);
      setEdges(templateEdges);
      const tpl = ARCHITECTURE_TEMPLATES.find((t) => t.id === templateId);
      addToast("info", "Template loaded", tpl?.label ?? templateId);
      setIsCostLoading(true);
      fetchCostEstimate(templateNodes.length)
        .then(setCostData)
        .catch(console.error)
        .finally(() => setIsCostLoading(false));
    },
    [setNodes, setEdges, addToast]
  );

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setTrafficMultiplier(preset.trafficMultiplier);
    setFailureMode(preset.failureMode);
    setActivePresetId(presetId);
  }, []);

  const handleTrafficChange = useCallback((value: number) => {
    setTrafficMultiplier(value);
    setActivePresetId(null);
  }, []);

  return (
    <ReactFlowProvider>
      <div className="flex flex-col" style={{ height: "100vh", background: "var(--bg-base)", overflow: "hidden" }}>
        <Navbar
          isRunning={isRunning}
          isSaving={isSaving}
          onRunSimulation={handleRunSimulation}
          onSave={handleSave}
          onReset={handleReset}
          nodeCount={nodes.length}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar onLoadTemplate={handleLoadTemplate} />
          <main className="flex-1 overflow-hidden">
            <ArchitectureCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onEdgesAdd={handleEdgesAdd}
              onNodeAdd={handleNodeAdd}
            />
          </main>
          <RightPanel
            metrics={metrics}
            costData={costData}
            isMetricsLoading={isMetricsLoading}
            isCostLoading={isCostLoading}
            nodeCount={nodes.length}
            lastRunId={lastRunId}
          />
        </div>
        <ScenarioControls
          trafficMultiplier={trafficMultiplier}
          failureMode={failureMode}
          onTrafficChange={handleTrafficChange}
          onFailureToggle={setFailureMode}
          onPresetSelect={handlePresetSelect}
          activePresetId={activePresetId}
          isRunning={isRunning}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ReactFlowProvider>
  );
}
