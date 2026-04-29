"use client";
// components/builder/ArchitectureCanvas.tsx
// Main React Flow canvas. Handles:
//   - Drag-drop from the sidebar palette
//   - Node creation, deletion, selection
//   - Edge connection between nodes
// NO simulation logic lives here — this is purely a visual graph editor.

import React, { useCallback, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  Connection,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode, { CaseNodeData } from "./CustomNode";
import { COMPONENT_PALETTE } from "@/lib/mockData";

// Register custom node types once (outside component to avoid re-creation)
const NODE_TYPES = { caseNode: CustomNode };

// Palette color map for minimap coloring
const PALETTE_MAP = Object.fromEntries(COMPONENT_PALETTE.map((c) => [c.type, c]));

interface ArchitectureCanvasProps {
  nodes: Node<CaseNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onEdgesAdd: (edges: Edge[]) => void;
  /** Called when new node is created via drop — parent updates state */
  onNodeAdd: (node: Node<CaseNodeData>) => void;
}

export default function ArchitectureCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onEdgesAdd,
  onNodeAdd,
}: ArchitectureCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Counter ref for generating unique node IDs without state re-renders
  const nodeIdCounter = useRef(nodes.length + 1);

  // ── Handle edge connection between two nodes ──
  const handleConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `edge-${Date.now()}`,
        animated: true,
        style: { stroke: "var(--brand-cyan)", strokeWidth: 1.5 },
      } as Edge;
      onEdgesAdd(addEdge(newEdge, edges));
    },
    [edges, onEdgesAdd]
  );

  // ── Handle drop of a component from the sidebar palette ──
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const componentType = e.dataTransfer.getData("application/case-node-type");
      if (!componentType) return;

      // Read all metadata passed from Sidebar drag event
      const label = e.dataTransfer.getData("application/case-node-label") || componentType;
      const color = e.dataTransfer.getData("application/case-node-color") || undefined;
      const icon  = e.dataTransfer.getData("application/case-node-icon")  || undefined;

      // Convert screen coordinates to React Flow canvas coordinates
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const id = `node-${++nodeIdCounter.current}`;
      const newNode: Node<CaseNodeData> = {
        id,
        type: "caseNode",
        position,
        data: { label, type: componentType, color, icon },
      };

      onNodeAdd(newNode);
    },
    [screenToFlowPosition, onNodeAdd]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // ── Empty state ──
  const isEmpty = nodes.length === 0;

  return (
    <div
      ref={reactFlowWrapper}
      className="relative w-full h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={NODE_TYPES}
        fitView
        deleteKeyCode="Backspace"
        multiSelectionKeyCode="Shift"
        style={{ background: "var(--bg-base)" }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "var(--brand-cyan)", strokeWidth: 1.5, opacity: 0.7 },
        }}
      >
        {/* Dot-grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(30,42,69,0.8)"
        />

        {/* Zoom/pan controls */}
        <Controls position="bottom-right" />

        {/* Minimap */}
        <MiniMap
          position="bottom-left"
          nodeColor={(node) => {
            const type = (node.data as CaseNodeData)?.type;
            return PALETTE_MAP[type]?.color ?? "var(--text-muted)";
          }}
          maskColor="rgba(10,14,26,0.7)"
          style={{ width: 130, height: 80 }}
        />
      </ReactFlow>

      {/* Empty canvas hint overlay */}
      {isEmpty && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <div
            className="flex flex-col items-center gap-3 p-8 rounded-2xl"
            style={{
              background: "rgba(15,21,37,0.6)",
              border: "1px dashed var(--bg-border)",
              backdropFilter: "blur(4px)",
            }}
          >
            {/* Decorative icon */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.3}>
              <polygon
                points="24,4 44,16 44,32 24,44 4,32 4,16"
                stroke="var(--brand-cyan)"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="24" cy="24" r="4" fill="var(--brand-cyan)" />
              <line x1="24" y1="4" x2="24" y2="14" stroke="var(--brand-cyan)" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="44" y1="16" x2="35" y2="21" stroke="var(--brand-cyan)" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="44" y1="32" x2="35" y2="27" stroke="var(--brand-cyan)" strokeWidth="1" strokeDasharray="2 2" />
            </svg>

            <div className="text-center">
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--text-secondary)", fontFamily: "'Syne', sans-serif" }}
              >
                Canvas is empty
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Drag components from the left panel
                <br />
                or load a template to get started
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <div
        className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs pointer-events-none"
        style={{
          background: "rgba(15,21,37,0.7)",
          border: "1px solid var(--bg-border)",
          color: "var(--text-muted)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          backdropFilter: "blur(4px)",
        }}
      >
        ⌫ delete selected · Shift+click multi-select
      </div>
    </div>
  );
}
