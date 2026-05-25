"use client";
// components/builder/ArchitectureCanvas.tsx
// Key fix: handleConfigSave now calls getNodeSummary() and stores summaryLines
// in the node data so CustomNode can render them on the card immediately.

import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import ReactFlow, {
  MiniMap, Controls, Background, BackgroundVariant,
  Node, Edge, Connection, addEdge,
  OnNodesChange, OnEdgesChange, useReactFlow,
  NodeMouseHandler, EdgeProps, getBezierPath, BaseEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode, { CaseNodeData, NodeCallbacks, NODE_WIDTH } from "./CustomNode";
import ComponentConfigModal from "./ComponentConfigModal";
import { COMPONENT_PALETTE, PaletteItem } from "@/lib/mockData";
import { NodeMetrics } from "@/lib/simulationEngine";
import { getNodeSummary } from "@/lib/componentConfigs";  // ← critical import

// ── Traffic edge ───────────────────────────────────────────────────────────
function TrafficEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });
  const speed  = data?.trafficSpeed ?? 1.5;
  const active = data?.active ?? false;
  const color  = active ? "var(--brand-cyan, #0369a1)" : "#cbd5e1";
  const animId = `te-${id}`;

  return (
    <>
      <style>{`@keyframes ${animId}{from{stroke-dashoffset:30}to{stroke-dashoffset:0}}`}</style>
      <BaseEdge
        path={edgePath}
        style={{ stroke: color, strokeWidth: active ? 2 : 1.5, opacity: active ? 0.5 : 0.4 }}
      />
      {active && (
        <>
          <path
            d={edgePath} fill="none" stroke={color} strokeWidth={2.5}
            strokeDasharray="10 8" strokeLinecap="round"
            style={{ animation: `${animId} ${speed}s linear infinite` }}
          />
          <circle r={3.5} fill={color} opacity={0.9}>
            <animateMotion dur={`${speed * 1.4}s`} repeatCount="indefinite">
              <mpath href={`#path-${id}`} />
            </animateMotion>
          </circle>
          <path id={`path-${id}`} d={edgePath} fill="none" stroke="none" />
        </>
      )}
    </>
  );
}

const NODE_TYPES = { caseNode: CustomNode };
const EDGE_TYPES = { trafficEdge: TrafficEdge };
const PALETTE_MAP = Object.fromEntries(COMPONENT_PALETTE.map(c => [c.type, c]));

interface RenameState { nodeId: string; x: number; y: number; }

interface ArchitectureCanvasProps {
  nodes:             Node<CaseNodeData>[];
  edges:             Edge[];
  onNodesChange:     OnNodesChange;
  onEdgesChange:     OnEdgesChange;
  onEdgesAdd:        (edges: Edge[]) => void;
  onNodeAdd:         (node: Node<CaseNodeData>) => void;
  onNodeRename:      (nodeId: string, newLabel: string) => void;
  onNodeDelete:      (nodeId: string) => void;
  onNodeFailToggle:  (nodeId: string, label: string) => void;
  onNodeUpdate:      (nodeId: string, data: Partial<CaseNodeData>) => void;
  onViewMetrics?:    () => void;
  trafficMultiplier: number;
  isSimulating:      boolean;
  nodeMetrics:       Record<string, NodeMetrics>;
  activeEdges:       Set<string>;
  failedNodes:       Set<string>;
}

let _idC = 3000;
const nextId = () => `node-${++_idC}`;

export default function ArchitectureCanvas({
  nodes, edges, onNodesChange, onEdgesChange, onEdgesAdd,
  onNodeAdd, onNodeRename, onNodeDelete, onNodeFailToggle,
  onNodeUpdate, onViewMetrics,
  trafficMultiplier, isSimulating, nodeMetrics, activeEdges, failedNodes,
}: ArchitectureCanvasProps) {
  const reactFlowWrapper  = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const nodeIdC = useRef(nodes.length + 1);

  const [renameState, setRenameState] = useState<RenameState | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ── Config modal state ──────────────────────────────────────────────────
  // pendingDrop = node not yet on canvas (first-time configure after drag)
  // configNodeId = editing an existing node via three-dot menu
  interface PendingDrop {
    id:       string;
    position: { x: number; y: number };
    item:     PaletteItem;
  }
  const [pendingDrop,   setPendingDrop]   = useState<PendingDrop | null>(null);
  const [configNodeId,  setConfigNodeId]  = useState<string | null>(null);

  const configNode    = configNodeId ? nodes.find(n => n.id === configNodeId) : null;
  const configPalette: PaletteItem | null =
    pendingDrop ? pendingDrop.item
    : configNode
      ? (PALETTE_MAP[configNode.data.type] ?? {
          type:        configNode.data.type,
          label:       configNode.data.label,
          icon:        configNode.data.icon  ?? "◇",
          color:       configNode.data.color ?? "#6366f1",
          description: configNode.data.type,
        })
      : null;

  const configInitialValues = configNode?.data.configValues ?? undefined;

  useEffect(() => {
    if (renameState) setTimeout(() => renameInputRef.current?.select(), 30);
  }, [renameState]);

  const trafficSpeed = Math.max(0.3, 3 - (trafficMultiplier - 1) * 0.3);

  // ── Enrich nodes with callbacks and simulation state ───────────────────
  const enrichedNodes = useMemo(() =>
    nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        metrics:           nodeMetrics[n.id],
        isSimulating,
        isFailed:          failedNodes.has(n.id),
        onConfigClick:     (nodeId: string) => setConfigNodeId(nodeId),
        onRenameClick:     (nodeId: string) => {
          const node = nodes.find(x => x.id === nodeId);
          if (node) {
            setRenameValue(node.data.label);
            setRenameState({ nodeId, x: 400, y: 300 });
          }
        },
        onDuplicateClick:  (nodeId: string) => duplicate(nodeId),
        onDisconnectClick: (nodeId: string) => disconnectNode(nodeId),
        onViewMetrics:     (_nodeId: string) => onViewMetrics?.(),
        onFailToggle:      (nodeId: string, label: string) => onNodeFailToggle(nodeId, label),
        onDeleteClick:     (nodeId: string) => onNodeDelete(nodeId),
      },
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, nodeMetrics, isSimulating, failedNodes]
  );

  const enrichedEdges = useMemo(() =>
    edges.map(e => ({
      ...e,
      type:  "trafficEdge",
      data:  { active: isSimulating && activeEdges.has(e.id), trafficSpeed },
      style: { stroke: "transparent" },
    })),
    [edges, isSimulating, activeEdges, trafficSpeed]
  );

  // ── handleConfigSave — THE KEY FIX ────────────────────────────────────
  // Calls getNodeSummary() and stores summaryLines in node data so
  // CustomNode renders the config details on the card immediately.
  const handleConfigSave = useCallback(
    (item: PaletteItem, values: Record<string, string | number | boolean>) => {
      // Derive the node label from whichever name field the component uses
      const newLabel =
        (values["name"]         as string)?.trim() ||
        (values["clusterName"]  as string)?.trim() ||
        (values["snapshotName"] as string)?.trim() ||
        (values["bucketName"]   as string)?.trim() ||
        item.label;

      // ← This is the critical call that was missing / not being stored
      const summaryLines = getNodeSummary(item.type, values);

      if (pendingDrop) {
        // First deploy: node doesn't exist yet — create with ALL data in one shot
        onNodeAdd({
          id:       pendingDrop.id,
          type:     "caseNode",
          position: pendingDrop.position,
          width:    NODE_WIDTH,
          data: {
            label:        newLabel,
            type:         item.type,
            color:        item.color,
            icon:         item.icon,
            configValues: values,
            summaryLines,  // ← config details rendered on card
          },
        });
        setPendingDrop(null);
        setConfigNodeId(null);
        return;
      }

      // Editing an existing node via three-dot → Configure
      if (configNodeId && configNode) {
        onNodeUpdate(configNodeId, {
          label:        newLabel,
          configValues: values,
          summaryLines,  // ← updates card details immediately
        });
      }
      setConfigNodeId(null);
    },
    [pendingDrop, configNodeId, configNode, onNodeAdd, onNodeUpdate]
  );

  // ── Edge connect ────────────────────────────────────────────────────────
  const handleConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id:    `edge-${Date.now()}`,
        type:  "trafficEdge",
        data:  { active: false, trafficSpeed },
        style: { stroke: "transparent" },
      } as Edge;
      onEdgesAdd(addEdge(newEdge, edges));
    },
    [edges, onEdgesAdd, trafficSpeed]
  );

  // ── Drop from sidebar ────────────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/case-node-type");
      if (!type) return;

      const label = e.dataTransfer.getData("application/case-node-label") || type;
      const color = e.dataTransfer.getData("application/case-node-color") || undefined;
      const icon  = e.dataTransfer.getData("application/case-node-icon")  || undefined;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const newId    = `node-${++nodeIdC.current}`;

      const paletteItem: PaletteItem =
        PALETTE_MAP[type] ?? { type, label, icon: icon ?? "◇", color: color ?? "#6366f1", description: type };

      // Store as pending — node is NOT added until user clicks "Deploy to Canvas"
      setPendingDrop({ id: newId, position, item: paletteItem });
      setConfigNodeId(null);
    },
    [screenToFlowPosition]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // ── Double-click → rename ───────────────────────────────────────────────
  const handleNodeDoubleClick: NodeMouseHandler = useCallback((e, node) => {
    e.preventDefault();
    setRenameValue(node.data.label);
    setRenameState({ nodeId: node.id, x: e.clientX, y: e.clientY });
  }, []);

  const commitRename = () => {
    if (renameState && renameValue.trim()) onNodeRename(renameState.nodeId, renameValue.trim());
    setRenameState(null);
  };

  // ── Right-click → suppress (three-dot is the action entry) ─────────────
  const handleNodeContextMenu: NodeMouseHandler = useCallback((e, _node) => {
    e.preventDefault();
  }, []);

  // ── Duplicate ───────────────────────────────────────────────────────────
  const duplicate = useCallback(
    (nodeId: string) => {
      const src = nodes.find(n => n.id === nodeId);
      if (!src) return;
      onNodeAdd({
        id:       nextId(),
        type:     "caseNode",
        position: { x: src.position.x + 50, y: src.position.y + 50 },
        width:    NODE_WIDTH,
        data: {
          label:        src.data.label + " (copy)",
          type:         src.data.type,
          color:        src.data.color,
          icon:         src.data.icon,
          configValues: src.data.configValues,
          summaryLines: src.data.summaryLines,  // ← carry config to duplicate
        },
      });
    },
    [nodes, onNodeAdd]
  );

  // ── Disconnect ──────────────────────────────────────────────────────────
  const disconnectNode = useCallback(
    (nodeId: string) => {
      onEdgesChange(
        edges
          .filter(e => e.source === nodeId || e.target === nodeId)
          .map(e => ({ id: e.id, type: "remove" as const }))
      );
    },
    [edges, onEdgesChange]
  );

  const isEmpty = nodes.length === 0;

  return (
    <div
      ref={reactFlowWrapper}
      style={{ position: "relative", width: "100%", height: "100%", background: "#f1f5f9" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ReactFlow
        nodes={enrichedNodes}
        edges={enrichedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={() => {}}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode="Shift"
        defaultViewport={{ x: 80, y: 80, zoom: 0.7 }}
        minZoom={0.2}
        maxZoom={2}
        style={{ background: "transparent" }}
        defaultEdgeOptions={{ type: "trafficEdge", style: { stroke: "transparent" } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(0,0,0,0.12)" />
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeColor={n =>
            (n.data as CaseNodeData)?.color ??
            PALETTE_MAP[(n.data as CaseNodeData)?.type]?.color ??
            "#94a3b8"
          }
          maskColor="rgba(241,245,249,0.75)"
          style={{ width: 130, height: 80 }}
        />
      </ReactFlow>

      {/* ── Empty state ── */}
      {isEmpty && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          pointerEvents: "none", zIndex: 5,
        }}>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            padding: 32, borderRadius: 8,
            background: "rgba(255,255,255,0.92)",
            border: "1px dashed #cbd5e1",
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity={0.25}>
              <rect x="2" y="2" width="36" height="36" rx="6"
                stroke="#0369a1" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
              <path d="M20 12v16M12 20h16" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13,
                color: "#475569", marginBottom: 4,
              }}>Canvas is empty</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#94a3b8" }}>
                Click or drag a component from the left panel
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename modal ── */}
      {renameState && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 999 }}
            onClick={commitRename}
          />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "fixed",
              top:  Math.min(renameState.y - 10, window.innerHeight - 150),
              left: Math.min(renameState.x - 10, window.innerWidth  - 260),
              zIndex: 1000,
              background: "#ffffff",
              border: "1px solid var(--brand-cyan, #0369a1)",
              borderRadius: 8, padding: 16, width: 240,
              boxShadow: "0 8px 32px rgba(3,105,161,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 9, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
            }}>Rename node</p>
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter")  commitRename();
                if (e.key === "Escape") setRenameState(null);
              }}
              style={{
                width: "100%", padding: "7px 10px", borderRadius: 6, fontSize: 12,
                background: "#f9fafb", border: "1px solid #e2e8f0",
                color: "#111827", outline: "none",
                fontFamily: "var(--font-ui)", marginBottom: 10, boxSizing: "border-box",
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = "#0369a1"; }}
              onBlur={e   => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={commitRename}
                style={{
                  flex: 1, padding: "6px 0", borderRadius: 5, fontSize: 11, fontWeight: 600,
                  background: "#0369a1", border: "none", color: "#ffffff",
                  cursor: "pointer", fontFamily: "var(--font-head)", letterSpacing: "0.04em",
                }}
              >Rename</button>
              <button
                onClick={() => setRenameState(null)}
                style={{
                  padding: "6px 12px", borderRadius: 5, fontSize: 11,
                  background: "#f1f5f9", border: "1px solid #e2e8f0",
                  color: "#475569", cursor: "pointer",
                }}
              >Cancel</button>
            </div>
          </div>
        </>
      )}

      {/* ── Config modal — conditionally rendered so it unmounts cleanly ── */}
      {configPalette && (
        <ComponentConfigModal
          item={configPalette}
          mode={pendingDrop ? "add" : "edit"}
          initialValues={pendingDrop ? undefined : configInitialValues}
          onClose={() => { setConfigNodeId(null); setPendingDrop(null); }}
          onAdd={handleConfigSave}
        />
      )}
    </div>
  );
}
