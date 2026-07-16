"use client";
// components/builder/CustomNode.tsx — Extended with live metrics + failure states

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { COMPONENT_PALETTE } from "@/lib/mockData";
import { NodeMetrics } from "@/lib/api";

const PALETTE_MAP = Object.fromEntries(COMPONENT_PALETTE.map((c) => [c.type, c]));

export interface CaseNodeData {
  label:         string;
  type:          string;
  color?:        string;
  icon?:         string;
  hasError?:     boolean;
  metrics?:      NodeMetrics;
  isSimulating?: boolean;
}

function CustomNode({ data, selected }: NodeProps<CaseNodeData>) {
  const palette    = PALETTE_MAP[data.type];
  const color      = data.color ?? palette?.color ?? "var(--text-secondary)";
  const icon       = data.icon  ?? palette?.icon  ?? "◇";
  const metrics    = data.metrics;
  const isFailed   = metrics?.isFailed ?? data.hasError ?? false;
  const isOverloaded = metrics?.isOverloaded ?? false;
  const isSimulating = data.isSimulating ?? false;

  const borderColor = isFailed ? "#f87171" : isOverloaded ? "#fbbf24" : selected ? color : "var(--bg-border)";
  const glowColor   = isFailed ? "rgba(248,113,113,0.3)" : isOverloaded ? "rgba(251,191,36,0.25)" : selected ? `${color}30` : "transparent";
  const bgColor     = isFailed ? "rgba(239,68,68,0.06)" : isOverloaded ? "rgba(245,158,11,0.06)" : "var(--bg-elevated)";
  const latencyColor = !metrics ? "var(--text-muted)" : metrics.latency > 200 ? "#f87171" : metrics.latency > 100 ? "#fbbf24" : "var(--brand-green)";

  return (
    <div style={{
      position: "relative", display: "flex", flexDirection: "column", alignItems: "center",
      gap: 5, padding: "10px 12px 8px", borderRadius: 6, minWidth: 115, maxWidth: 145,
      background: bgColor, border: `1.5px solid ${borderColor}`,
      boxShadow: isSimulating && !isFailed ? `0 0 0 3px ${color}20, 0 0 18px ${glowColor}` : `0 0 16px ${glowColor}`,
      cursor: "grab", transition: "all 0.3s",
    }}>

      {isFailed && (
        <div style={{ position: "absolute", top: -8, right: -8, padding: "2px 6px", borderRadius: 3,
          background: "#f87171", color: "#ffffff", fontSize: 8, fontWeight: 700,
          fontFamily: "var(--font-head)", letterSpacing: "0.05em", zIndex: 10 }}>FAILED</div>
      )}
      {isOverloaded && !isFailed && (
        <div style={{ position: "absolute", top: -8, right: -8, padding: "2px 6px", borderRadius: 3,
          background: "#fbbf24", color: "#ffffff", fontSize: 8, fontWeight: 700,
          fontFamily: "var(--font-head)", letterSpacing: "0.05em", zIndex: 10 }}>OVERLOAD</div>
      )}

      {isSimulating && !isFailed && (
        <div style={{ position: "absolute", inset: -4, borderRadius: 18,
          border: `1px solid ${color}40`, animation: "nodeRing 2s ease-out infinite", pointerEvents: "none" }} />
      )}

      <div style={{
        width: 38, height: 38, borderRadius: 5, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 18, flexShrink: 0,
        background: isFailed ? "rgba(239,68,68,0.1)" : `${color}15`,
        border: `1px solid ${isFailed ? "#f87171" : color}35`,
        color: isFailed ? "#f87171" : color, opacity: isFailed ? 0.7 : 1,
        filter: isFailed ? "grayscale(0.5)" : "none", transition: "all 0.3s",
      }}>
        {isFailed ? "✕" : icon}
      </div>

      <p style={{ fontSize: 11, fontWeight: 600, textAlign: "center",
        color: isFailed ? "#f87171" : "var(--text-primary)", fontFamily: "var(--font-head)",
        lineHeight: 1.3, maxWidth: 110, wordBreak: "break-word", marginTop: 2,
        opacity: isFailed ? 0.7 : 1 }}>
        {data.label}
      </p>

      <div style={{ padding: "1px 6px", borderRadius: 3, background: `${color}12`, border: `1px solid ${color}22` }}>
        <p style={{ fontSize: 9, color, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
          {data.type}
        </p>
      </div>

      {metrics && isSimulating && !isFailed && (
        <div style={{ width: "100%", marginTop: 4, padding: "5px 6px", borderRadius: 4,
          background: "rgba(0,0,0,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 8, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>TPUT</span>
            <span style={{ fontSize: 9, color: "var(--brand-cyan)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
              {metrics.throughput} r/s
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 8, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>LAT</span>
            <span style={{ fontSize: 9, color: latencyColor, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
              {metrics.latency}ms
            </span>
          </div>
          <div style={{ height: 2, borderRadius: 1, background: "var(--bg-border)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 1,
              width: `${Math.min(100, (metrics.latency / 300) * 100)}%`,
              background: latencyColor, transition: "width 0.5s ease, background 0.3s" }} />
          </div>
        </div>
      )}

      {isFailed && (
        <p style={{ fontSize: 8, color: "#f87171", fontFamily: "var(--font-mono)", opacity: 0.8 }}>
          traffic stopped
        </p>
      )}

      {selected && !isFailed && !isSimulating && (
        <p style={{ fontSize: 8, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          dbl-click to rename
        </p>
      )}

      <Handle type="target" position={Position.Top}    style={{ top: -5 }} />
      <Handle type="source" position={Position.Bottom} style={{ bottom: -5 }} />
      <Handle type="target" position={Position.Left}   style={{ left: -5, top: "50%" }} />
      <Handle type="source" position={Position.Right}  style={{ right: -5, top: "50%" }} />

      <style>{`@keyframes nodeRing { 0%{opacity:0.8;transform:scale(1)} 100%{opacity:0;transform:scale(1.15)} }`}</style>
    </div>
  );
}

export default memo(CustomNode);
