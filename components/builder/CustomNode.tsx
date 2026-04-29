"use client";
// components/builder/CustomNode.tsx
// Renders a node on the React Flow canvas.
// Looks up icon/color from COMPONENT_PALETTE flat list (derived from all categories).
// Falls back to node's own data.color if type not found (future-proof for new types).

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { COMPONENT_PALETTE } from "@/lib/mockData";

const PALETTE_MAP = Object.fromEntries(COMPONENT_PALETTE.map((c) => [c.type, c]));

export interface CaseNodeData {
  label: string;
  type: string;
  color?: string;
  icon?: string;
  hasError?: boolean;
}

function CustomNode({ data, selected }: NodeProps<CaseNodeData>) {
  // Prefer palette lookup, fall back to node's own data (set at drag time)
  const palette = PALETTE_MAP[data.type];
  const color  = palette?.color  ?? data.color  ?? "#8a9ab5";
  const icon   = palette?.icon   ?? data.icon   ?? "◇";

  const borderColor = data.hasError ? "#f87171" : selected ? color : "var(--bg-border)";
  const glowColor   = data.hasError ? "rgba(248,113,113,0.25)" : selected ? `${color}30` : "transparent";

  return (
    <div style={{
      position: "relative", display: "flex", flexDirection: "column", alignItems: "center",
      gap: 6, padding: "10px 14px", borderRadius: 12, minWidth: 100, cursor: "default",
      background: "var(--bg-elevated)",
      border: `1.5px solid ${borderColor}`,
      boxShadow: selected || data.hasError ? `0 0 16px ${glowColor}` : "0 2px 8px rgba(0,0,0,0.3)",
      transition: "all 0.2s",
    }}>
      {/* Error badge */}
      {data.hasError && (
        <div style={{
          position: "absolute", top: -7, right: -7, width: 16, height: 16,
          borderRadius: "50%", background: "#f87171", color: "#0a0e1a",
          fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
        }}>!</div>
      )}

      {/* Icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 18,
        background: `${color}18`, border: `1px solid ${color}35`, color,
      }}>
        {icon}
      </div>

      {/* Label */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)", maxWidth: 90, lineHeight: 1.3 }}>
          {data.label}
        </p>
        <p style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
          {data.type}
        </p>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} style={{ top: "50%" }} />
      <Handle type="source" position={Position.Right} style={{ top: "50%" }} />
    </div>
  );
}

export default memo(CustomNode);
