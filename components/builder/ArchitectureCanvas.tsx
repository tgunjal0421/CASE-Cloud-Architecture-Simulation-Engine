"use client";
// components/builder/ArchitectureCanvas.tsx
// Extended with: per-node metric injection, failure toggle via context menu,
// active-edge highlighting from simulation state, traffic flow animation.

import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import ReactFlow, {
  MiniMap, Controls, Background, BackgroundVariant,
  Node, Edge, Connection, addEdge,
  OnNodesChange, OnEdgesChange, useReactFlow,
  NodeMouseHandler, EdgeProps, getBezierPath, BaseEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode, { CaseNodeData } from "./CustomNode";
import { COMPONENT_PALETTE } from "@/lib/mockData";
import { NodeMetrics } from "@/lib/simulationEngine";

// ── Animated traffic edge ──────────────────────────────────────────────────
function TrafficEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const speed   = data?.trafficSpeed ?? 1.5;
  const active  = data?.active ?? false;
  const color   = active ? "#00e5ff" : "#1e2a45";
  const animId  = `te-${id}`;

  return (
    <>
      <style>{`@keyframes ${animId}{from{stroke-dashoffset:30}to{stroke-dashoffset:0}}`}</style>
      <BaseEdge path={edgePath} style={{ stroke: color, strokeWidth: active ? 2 : 1.5, opacity: active ? 0.4 : 0.25 }} />
      {active && (
        <>
          <path d={edgePath} fill="none" stroke={color} strokeWidth={2.5}
            strokeDasharray="10 8" strokeLinecap="round"
            style={{ animation: `${animId} ${speed}s linear infinite` }} />
          <circle r={3.5} fill={color} opacity={0.95} filter="url(#glow)">
            <animateMotion dur={`${speed * 1.4}s`} repeatCount="indefinite">
              <mpath href={`#path-${id}`} />
            </animateMotion>
          </circle>
          <path id={`path-${id}`} d={edgePath} fill="none" stroke="none" />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        </>
      )}
    </>
  );
}

const NODE_TYPES = { caseNode: CustomNode };
const EDGE_TYPES = { trafficEdge: TrafficEdge };
const PALETTE_MAP = Object.fromEntries(COMPONENT_PALETTE.map((c) => [c.type, c]));

interface ContextMenu { nodeId: string; nodeLabel: string; x: number; y: number; isFailed: boolean; }
interface RenameState { nodeId: string; x: number; y: number; }

interface ArchitectureCanvasProps {
  nodes:           Node<CaseNodeData>[];
  edges:           Edge[];
  onNodesChange:   OnNodesChange;
  onEdgesChange:   OnEdgesChange;
  onEdgesAdd:      (edges: Edge[]) => void;
  onNodeAdd:       (node: Node<CaseNodeData>) => void;
  onNodeRename:    (nodeId: string, newLabel: string) => void;
  onNodeDelete:    (nodeId: string) => void;
  onNodeFailToggle:(nodeId: string, label: string) => void;
  trafficMultiplier: number;
  isSimulating:    boolean;
  nodeMetrics:     Record<string, NodeMetrics>;
  activeEdges:     Set<string>;
  failedNodes:     Set<string>;
}

export default function ArchitectureCanvas({
  nodes, edges, onNodesChange, onEdgesChange, onEdgesAdd,
  onNodeAdd, onNodeRename, onNodeDelete, onNodeFailToggle,
  trafficMultiplier, isSimulating, nodeMetrics, activeEdges, failedNodes,
}: ArchitectureCanvasProps) {
  const reactFlowWrapper  = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const nodeIdCounter     = useRef(nodes.length + 1);

  const [contextMenu, setContextMenu]   = useState<ContextMenu | null>(null);
  const [renameState, setRenameState]   = useState<RenameState | null>(null);
  const [renameValue, setRenameValue]   = useState("");
  // Traffic flow is derived from isSimulating — no separate toggle needed
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (renameState) setTimeout(() => renameInputRef.current?.select(), 30); }, [renameState]);
  useEffect(() => { const close = () => setContextMenu(null); window.addEventListener("click", close); return () => window.removeEventListener("click", close); }, []);
  const trafficSpeed = Math.max(0.3, 3 - (trafficMultiplier - 1) * 0.3);

  // Inject metrics + simulation state into node data
  const enrichedNodes = useMemo(() =>
    nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        metrics:      nodeMetrics[n.id],
        isSimulating: isSimulating,
        isFailed:     failedNodes.has(n.id),
      },
    })),
    [nodes, nodeMetrics, isSimulating, failedNodes]
  );

  // Enrich edges with traffic animation state
  const enrichedEdges = useMemo(() =>
    edges.map((e) => ({
      ...e,
      type: "trafficEdge",
      data: { active: isSimulating && activeEdges.has(e.id), trafficSpeed, color: "#00e5ff" },
      style: { stroke: "transparent" },
    })),
    [edges, isSimulating, activeEdges, trafficSpeed]
  );

  const handleConnect = useCallback((connection: Connection) => {
    const newEdge: Edge = {
      ...connection, id: `edge-${Date.now()}`,
      type: "trafficEdge", animated: false,
      data: { active: false, trafficSpeed, color: "#00e5ff" },
      style: { stroke: "transparent" },
    } as Edge;
    onEdgesAdd(addEdge(newEdge, edges));
  }, [edges, onEdgesAdd, trafficSpeed]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData("application/case-node-type");
    if (!componentType) return;
    const label = e.dataTransfer.getData("application/case-node-label") || componentType;
    const color = e.dataTransfer.getData("application/case-node-color") || undefined;
    const icon  = e.dataTransfer.getData("application/case-node-icon")  || undefined;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const id = `node-${++nodeIdCounter.current}`;
    onNodeAdd({ id, type: "caseNode", position, data: { label, type: componentType, color, icon } });
  }, [screenToFlowPosition, onNodeAdd]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; };

  const handleNodeContextMenu: NodeMouseHandler = useCallback((e, node) => {
    e.preventDefault(); e.stopPropagation();
    setContextMenu({ nodeId: node.id, nodeLabel: node.data.label, x: e.clientX, y: e.clientY, isFailed: failedNodes.has(node.id) });
  }, [failedNodes]);

  const handleNodeDoubleClick: NodeMouseHandler = useCallback((e, node) => {
    e.preventDefault(); setContextMenu(null);
    setRenameValue(node.data.label);
    setRenameState({ nodeId: node.id, x: e.clientX, y: e.clientY });
  }, []);

  const commitRename = () => {
    if (renameState && renameValue.trim()) onNodeRename(renameState.nodeId, renameValue.trim());
    setRenameState(null);
  };

  const isEmpty = nodes.length === 0;
  const intensityColor = trafficMultiplier <= 2 ? "#00c896" : trafficMultiplier <= 5 ? "#4f8ef7" : trafficMultiplier <= 8 ? "#f7a44f" : "#f87171";
  const intensity = trafficMultiplier <= 2 ? "Low" : trafficMultiplier <= 5 ? "Moderate" : trafficMultiplier <= 8 ? "High" : "Extreme";

  return (
    <div ref={reactFlowWrapper} style={{ position: "relative", width: "100%", height: "100%" }}
      onDrop={handleDrop} onDragOver={handleDragOver}>

      <ReactFlow
        nodes={enrichedNodes} edges={enrichedEdges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={() => setContextMenu(null)}
        nodeTypes={NODE_TYPES} edgeTypes={EDGE_TYPES}
        fitView deleteKeyCode={["Backspace", "Delete"]} multiSelectionKeyCode="Shift"
        style={{ background: "var(--bg-base)" }}
        defaultEdgeOptions={{ type: "trafficEdge", style: { stroke: "transparent" } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(30,42,69,0.8)" />
        <Controls position="bottom-right" />
        <MiniMap position="bottom-left"
          nodeColor={(n) => (n.data as CaseNodeData)?.color ?? PALETTE_MAP[(n.data as CaseNodeData)?.type]?.color ?? "#4a5568"}
          maskColor="rgba(10,14,26,0.7)" style={{ width: 130, height: 80 }} />
      </ReactFlow>

      {/* ── Empty state ── *//* ── Empty state ── */}
      {isEmpty && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 5 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 32, borderRadius: 20, background: "rgba(15,21,37,0.6)", border: "1px dashed var(--bg-border)", backdropFilter: "blur(4px)" }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.3}>
              <polygon points="24,4 44,16 44,32 24,44 4,32 4,16" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
              <circle cx="24" cy="24" r="4" fill="#00e5ff" />
            </svg>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, fontFamily: "'Syne',sans-serif", marginBottom: 4 }}>Canvas is empty</p>
              <p style={{ color: "var(--text-muted)", fontSize: 11 }}>Drag components from the left panel<br />or load a template to get started</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Context menu ── */}
      {contextMenu && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x, zIndex: 1000, background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: 10, padding: 4, minWidth: 170, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          <CMenuItem icon="✎" label="Rename" color="#00e5ff" onClick={() => {
            const node = nodes.find((n) => n.id === contextMenu.nodeId);
            if (node) { setRenameValue(node.data.label); setRenameState({ nodeId: node.id, x: contextMenu.x, y: contextMenu.y }); }
            setContextMenu(null);
          }} />
          <CMenuItem
            icon={contextMenu.isFailed ? "↺" : "⚠"}
            label={contextMenu.isFailed ? "Restore node" : "Simulate failure"}
            color={contextMenu.isFailed ? "#00c896" : "#f7a44f"}
            onClick={() => { onNodeFailToggle(contextMenu.nodeId, contextMenu.nodeLabel); setContextMenu(null); }}
          />
          <div style={{ height: 1, background: "var(--bg-border)", margin: "3px 6px" }} />
          <CMenuItem icon="✕" label="Delete node" color="#f87171" onClick={() => { onNodeDelete(contextMenu.nodeId); setContextMenu(null); }} />
        </div>
      )}

      {/* ── Rename modal ── */}
      {renameState && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={commitRename} />
          <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", top: Math.min(renameState.y - 10, window.innerHeight - 150), left: Math.min(renameState.x - 10, window.innerWidth - 260), zIndex: 1000, background: "var(--bg-elevated)", border: "1px solid #00e5ff", borderRadius: 12, padding: 16, width: 240, boxShadow: "0 8px 32px rgba(0,229,255,0.15)" }}>
            <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Rename node</p>
            <input ref={renameInputRef} type="text" value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenameState(null); }}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 12, background: "var(--bg-surface)", border: "1px solid var(--bg-border)", color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans',sans-serif", marginBottom: 10 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#00e5ff"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--bg-border)"; }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={commitRename} style={{ flex: 1, padding: "6px 0", borderRadius: 7, fontSize: 11, fontWeight: 600, background: "linear-gradient(135deg,#00e5ff,#4f8ef7)", border: "none", color: "#080c18", cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>Rename</button>
              <button onClick={() => setRenameState(null)} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 11, background: "var(--bg-border)", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes dot{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  );
}

function CMenuItem({ icon, label, color, onClick }: { icon: string; label: string; color: string; onClick: () => void; }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: h ? color + "18" : "transparent", color: h ? color : "var(--text-secondary)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", textAlign: "left", transition: "all 0.15s" }}>
      <span style={{ color, fontSize: 11, width: 14 }}>{icon}</span>{label}
    </button>
  );
}
