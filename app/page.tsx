"use client";
// app/page.tsx — Wires SimStatus from useSimulation to all components.
// Single source of truth: simStatus drives all behaviors.

import React, { useState, useCallback } from "react";
import { useNodesState, useEdgesState, Node, Edge, ReactFlowProvider } from "reactflow";

import Navbar             from "@/components/layout/Navbar";
import Sidebar            from "@/components/layout/Sidebar";
import RightPanel         from "@/components/layout/RightPanel";
import ArchitectureCanvas from "@/components/builder/ArchitectureCanvas";
import ScenarioControls   from "@/components/controls/ScenarioControls";
import { ToastContainer, useToast } from "@/components/layout/Toast";

import { saveArchitecture, fetchCostEstimate, CostEstimateResponse } from "@/lib/api";
import { SCENARIO_PRESETS, ARCHITECTURE_TEMPLATES } from "@/lib/mockData";
import { CaseNodeData } from "@/components/builder/CustomNode";
import { useSimulation } from "@/lib/useSimulation";

// ── Templates ─────────────────────────────────────────────────────────────
function buildTemplateNodes(id: string): { nodes: Node<CaseNodeData>[]; edges: Edge[] } {
  if (id === "three-tier") return {
    nodes: [
      { id: "lb-1", type: "caseNode", position: { x: 250, y: 60  }, data: { label: "Load Balancer", type: "loadbalancer" } },
      { id: "vm-1", type: "caseNode", position: { x: 100, y: 200 }, data: { label: "App Server 1",  type: "vm"           } },
      { id: "vm-2", type: "caseNode", position: { x: 300, y: 200 }, data: { label: "App Server 2",  type: "vm"           } },
      { id: "db-1", type: "caseNode", position: { x: 200, y: 360 }, data: { label: "Primary DB",    type: "database"     } },
    ],
    edges: [
      { id: "e1", source: "lb-1", target: "vm-1" },
      { id: "e2", source: "lb-1", target: "vm-2" },
      { id: "e3", source: "vm-1", target: "db-1" },
      { id: "e4", source: "vm-2", target: "db-1" },
    ],
  };
  if (id === "microservices") return {
    nodes: [
      { id: "gw-1",    type: "caseNode", position: { x: 300, y: 30  }, data: { label: "API Gateway",    type: "apigateway" } },
      { id: "svc-1",   type: "caseNode", position: { x: 80,  y: 160 }, data: { label: "Auth Service",   type: "vm"         } },
      { id: "svc-2",   type: "caseNode", position: { x: 240, y: 160 }, data: { label: "Order Service",  type: "vm"         } },
      { id: "svc-3",   type: "caseNode", position: { x: 400, y: 160 }, data: { label: "Notify Service", type: "vm"         } },
      { id: "q-1",     type: "caseNode", position: { x: 400, y: 300 }, data: { label: "Message Queue",  type: "queue"      } },
      { id: "db-1",    type: "caseNode", position: { x: 80,  y: 300 }, data: { label: "User DB",        type: "database"   } },
      { id: "db-2",    type: "caseNode", position: { x: 240, y: 300 }, data: { label: "Orders DB",      type: "database"   } },
      { id: "cache-1", type: "caseNode", position: { x: 560, y: 160 }, data: { label: "Redis Cache",    type: "cache"      } },
    ],
    edges: [
      { id: "e1", source: "gw-1",  target: "svc-1"   },
      { id: "e2", source: "gw-1",  target: "svc-2"   },
      { id: "e3", source: "gw-1",  target: "svc-3"   },
      { id: "e4", source: "svc-1", target: "db-1"    },
      { id: "e5", source: "svc-2", target: "db-2"    },
      { id: "e6", source: "svc-3", target: "q-1"     },
      { id: "e7", source: "svc-2", target: "cache-1" },
    ],
  };
  if (id === "cdn-static") return {
    nodes: [
      { id: "st-1", type: "caseNode", position: { x: 200, y: 60  }, data: { label: "Object Storage", type: "storage"      } },
      { id: "lb-1", type: "caseNode", position: { x: 80,  y: 200 }, data: { label: "CDN Edge A",     type: "loadbalancer" } },
      { id: "lb-2", type: "caseNode", position: { x: 320, y: 200 }, data: { label: "CDN Edge B",     type: "loadbalancer" } },
    ],
    edges: [
      { id: "e1", source: "st-1", target: "lb-1" },
      { id: "e2", source: "st-1", target: "lb-2" },
    ],
  };
  return { nodes: [], edges: [] };
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function CasePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CaseNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [trafficMultiplier, setTrafficMultiplier] = useState(1);
  const [failureMode,       setFailureMode]       = useState(false);
  const [activePresetId,    setActivePresetId]    = useState<string | null>(null);
  const [costData,          setCostData]          = useState<CostEstimateResponse | null>(null);
  const [isSaving,          setIsSaving]          = useState(false);
  const [isCostLoading,     setIsCostLoading]     = useState(false);
  const [lastRunId,         setLastRunId]         = useState<string | null>(null);

  const { toasts, addToast, dismissToast } = useToast();

  // ── Simulation engine — single source of truth ──
  const { simStatus, simState, failedNodes, startSim, stopSim, toggleFail, resetSim, clearLogs } =
    useSimulation(nodes, edges, trafficMultiplier, failureMode);

  // ── Node operations ──
  const handleNodeAdd = useCallback((newNode: Node<CaseNodeData>) => {
    setNodes((prev) => {
      const updated = [...prev, newNode];
      fetchCostEstimate(updated.length).then(setCostData).catch(console.error);
      return updated;
    });
  }, [setNodes]);

  const handleEdgesAdd  = useCallback((e: Edge[]) => setEdges(e), [setEdges]);

  const handleNodeRename = useCallback((nodeId: string, label: string) => {
    setNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, label } } : n));
  }, [setNodes]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((prev) => {
      const next = prev.filter((n) => n.id !== nodeId);
      fetchCostEstimate(next.length).then(setCostData).catch(console.error);
      return next;
    });
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  // ── Start — guards empty canvas ──
  const handleStart = useCallback(() => {
    if (nodes.length === 0) { addToast("info", "Add nodes first"); return; }
    const runId = `run_${Date.now()}`;
    setLastRunId(runId);
    startSim();
    addToast("success", "Simulation started", `${nodes.length} nodes · ×${trafficMultiplier}`);
  }, [nodes, trafficMultiplier, startSim, addToast]);

  // ── Stop — immediate, no confirmation needed ──
  const handleStop = useCallback(() => {
    stopSim();
    addToast("info", "Simulation stopped", "Metrics frozen · logs preserved");
  }, [stopSim, addToast]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const r = await saveArchitecture({ name: `Architecture ${new Date().toLocaleDateString()}`, nodes, edges });
      addToast("success", "Saved", `ID: ${r.id}`);
    } catch { addToast("error", "Save failed"); }
    finally   { setIsSaving(false); }
  }, [isSaving, nodes, edges, addToast]);

  // ── Full reset — clears canvas + simulation ──
  const handleReset = useCallback(() => {
    resetSim();
    setNodes([]); setEdges([]);
    setCostData(null); setLastRunId(null);
    setActivePresetId(null); setTrafficMultiplier(1); setFailureMode(false);
    addToast("info", "Canvas cleared");
  }, [resetSim, setNodes, setEdges, addToast]);

  // ── Template load ──
  const handleLoadTemplate = useCallback((templateId: string) => {
    const { nodes: n, edges: e } = buildTemplateNodes(templateId);
    setNodes(n); setEdges(e);
    const tpl = ARCHITECTURE_TEMPLATES.find((t) => t.id === templateId);
    addToast("info", "Template loaded", tpl?.label ?? templateId);
    setIsCostLoading(true);
    fetchCostEstimate(n.length).then(setCostData).catch(console.error).finally(() => setIsCostLoading(false));
  }, [setNodes, setEdges, addToast]);

  // ── Presets — only apply when not running ──
  const handlePresetSelect = useCallback((presetId: string) => {
    const p = SCENARIO_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setTrafficMultiplier(p.trafficMultiplier);
    setFailureMode(p.failureMode);
    setActivePresetId(presetId);
  }, []);

  // ── Traffic change — ALWAYS live, even during simulation ──
  const handleTrafficChange = useCallback((v: number) => {
    setTrafficMultiplier(v);
    setActivePresetId(null);
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-base)", overflow: "hidden" }}>

        <Navbar
          simStatus={simStatus}
          isSaving={isSaving}
          nodeCount={nodes.length}
          onStart={handleStart}
          onStop={handleStop}
          onSave={handleSave}
          onReset={handleReset}
        />

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar onLoadTemplate={handleLoadTemplate} />

          <main style={{ flex: 1, overflow: "hidden" }}>
            <ArchitectureCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onEdgesAdd={handleEdgesAdd}
              onNodeAdd={handleNodeAdd}
              onNodeRename={handleNodeRename}
              onNodeDelete={handleNodeDelete}
              onNodeFailToggle={toggleFail}
              trafficMultiplier={trafficMultiplier}
              isSimulating={simStatus === "running"}
              nodeMetrics={simState.nodeMetrics}
              activeEdges={simState.activeEdges}
              failedNodes={failedNodes}
            />
          </main>

          <RightPanel
            simStatus={simStatus}
            costData={costData}
            isCostLoading={isCostLoading}
            nodeCount={nodes.length}
            lastRunId={lastRunId}
            systemMetrics={simState.systemMetrics}
            logs={simState.logs}
            onClearLogs={clearLogs}
          />
        </div>

        <ScenarioControls
          simStatus={simStatus}
          trafficMultiplier={trafficMultiplier}
          failureMode={failureMode}
          activePresetId={activePresetId}
          onTrafficChange={handleTrafficChange}
          onFailureToggle={setFailureMode}
          onPresetSelect={handlePresetSelect}
        />

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ReactFlowProvider>
  );
}
