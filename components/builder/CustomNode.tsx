"use client";
// components/builder/CustomNode.tsx
// Fixed-width compact node — 200px enforced via style AND React Flow node.width.
// Compact layout: icon + label row, then summary key/value rows, then live metrics.
// Three-dot dropdown for all actions.

import React, { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { COMPONENT_PALETTE } from "@/lib/mockData";
import { NodeMetrics } from "@/lib/simulationEngine";

// ── Fixed dimensions — enforced here AND set on the node object at creation ──
export const NODE_WIDTH  = 200;   // px — matches node.width in ArchitectureCanvas
export const NODE_HEIGHT = undefined; // height is content-driven but width is fixed

const PALETTE_MAP = Object.fromEntries(COMPONENT_PALETTE.map((c) => [c.type, c]));

export interface NodeCallbacks {
  onConfigClick?:     (nodeId: string) => void;
  onRenameClick?:     (nodeId: string) => void;
  onDuplicateClick?:  (nodeId: string) => void;
  onDisconnectClick?: (nodeId: string) => void;
  onViewMetrics?:     (nodeId: string) => void;
  onFailToggle?:      (nodeId: string, label: string) => void;
  onDeleteClick?:     (nodeId: string) => void;
}

export interface CaseNodeData extends NodeCallbacks {
  label:         string;
  type:          string;
  color?:        string;
  icon?:         string;
  hasError?:     boolean;
  metrics?:      NodeMetrics;
  isSimulating?: boolean;
  isFailed?:     boolean;
  configValues?: Record<string, string | number | boolean>;
  summaryLines?: string[];
}

function CustomNode({ id, data, selected }: NodeProps<CaseNodeData>) {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [dotHovered, setDotHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const palette      = PALETTE_MAP[data.type];
  const color        = data.color  ?? palette?.color ?? "#6366f1";
  const icon         = data.icon   ?? palette?.icon  ?? "◇";
  const metrics      = data.metrics;
  const isFailed     = data.isFailed ?? metrics?.isFailed ?? data.hasError ?? false;
  const isOverloaded = metrics?.isOverloaded ?? false;
  const isSimulating = data.isSimulating ?? false;
  const summary      = data.summaryLines ?? [];

  // Close menu — capture phase so it fires before React Flow swallows the event
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("pointerdown", onPointer, { capture: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer, { capture: true });
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const borderColor = isFailed ? "#ef4444"
    : isOverloaded  ? "#f59e0b"
    : selected      ? color
    : "#e2e8f0";

  const bgColor = isFailed    ? "#fef2f2"
    : isOverloaded ? "#fffbeb"
    : "#ffffff";

  const latencyColor = !metrics       ? "#94a3b8"
    : metrics.latency > 200 ? "#ef4444"
    : metrics.latency > 100 ? "#f59e0b"
    : "#10b981";

  const dispatch = (fn?: (id: string, ...a: any[]) => void, ...a: any[]) => {
    setMenuOpen(false);
    fn?.(id, ...a);
  };

  return (
    <div style={{
      // ── FIXED WIDTH — prevents React Flow from auto-sizing based on content ──
      width:    NODE_WIDTH,
      minWidth: NODE_WIDTH,
      maxWidth: NODE_WIDTH,
      boxSizing: "border-box",
      // ─────────────────────────────────────────────────────────────────────────
      background: bgColor,
      border: `1.5px solid ${borderColor}`,
      borderRadius: 8,
      boxShadow: selected
        ? `0 0 0 2px ${color}30, 0 2px 8px rgba(0,0,0,0.10)`
        : "0 1px 4px rgba(0,0,0,0.07)",
      cursor: "grab",
      transition: "box-shadow 0.2s, border-color 0.2s",
      overflow: "visible",
      position: "relative",
    }}>

      {/* Status badge */}
      {isFailed     && <StatusBadge text="FAILED"   bg="#ef4444" />}
      {isOverloaded && !isFailed && <StatusBadge text="OVERLOAD" bg="#f59e0b" />}

      {/* Pulse ring during simulation */}
      {isSimulating && !isFailed && (
        <div style={{
          position: "absolute", inset: -4, borderRadius: 12,
          border: `1.5px solid ${color}30`,
          animation: "nodeRing 2s ease-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* ── Header row: icon · label · three-dot ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "7px 7px 6px 9px",
        borderBottom: summary.length > 0 || (metrics && isSimulating) ? "1px solid #f1f5f9" : "none",
      }}>
        {/* Icon — compact 28×28 */}
        <div style={{
          width: 28, height: 28, borderRadius: 6, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13,
          background: isFailed ? "#fee2e2" : `${color}12`,
          border: `1px solid ${isFailed ? "#fca5a5" : color}22`,
          color: isFailed ? "#ef4444" : color,
        }}>
          {isFailed ? "✕" : icon}
        </div>

        {/* Label + type chip — truncated to stay inside fixed width */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 11,
            color: isFailed ? "#ef4444" : "#111827",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            margin: 0, lineHeight: 1.3,
          }}>{data.label}</p>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 8, color,
            margin: 0, marginTop: 1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            opacity: 0.85,
          }}>{data.type}</p>
        </div>

        {/* Three-dot button + dropdown */}
        <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            onMouseEnter={() => setDotHovered(true)}
            onMouseLeave={() => setDotHovered(false)}
            title="Actions"
            style={{
              width: 22, height: 22, borderRadius: 4, padding: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: menuOpen ? `${color}15` : dotHovered ? "#f1f5f9" : "transparent",
              border: `1px solid ${menuOpen || dotHovered ? "#e2e8f0" : "transparent"}`,
              cursor: "pointer", transition: "all 0.12s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="2"  r="1.1" fill={menuOpen || dotHovered ? color : "#94a3b8"} />
              <circle cx="6" cy="6"  r="1.1" fill={menuOpen || dotHovered ? color : "#94a3b8"} />
              <circle cx="6" cy="10" r="1.1" fill={menuOpen || dotHovered ? color : "#94a3b8"} />
            </svg>
          </button>

          {menuOpen && (
            <div onClick={e => e.stopPropagation()} style={{
              position: "absolute", top: 26, right: 0, zIndex: 9999,
              background: "#ffffff", border: "1px solid #e2e8f0",
              borderRadius: 8, padding: "3px 0", minWidth: 188,
              boxShadow: "0 6px 20px rgba(0,0,0,0.11), 0 1px 4px rgba(0,0,0,0.06)",
              animation: "dropIn 0.13s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>

              <MI icon={<SettingsIcon />}    label="Configure"        sub="Edit specifications"    c={color}     onClick={() => dispatch(data.onConfigClick)} />
              <MI icon={<PenIcon />}         label="Rename"           sub="Change display name"    c="#475569"   onClick={() => dispatch(data.onRenameClick)} />
              <MI icon={<CopyIcon />}        label="Duplicate"        sub="Clone this node"        c="#475569"   onClick={() => dispatch(data.onDuplicateClick)} />
              <MI icon={<DisconnectIcon />}  label="Disconnect"       sub="Remove all edges"       c="#475569"   onClick={() => dispatch(data.onDisconnectClick)} />
              <MI icon={<MetricsIcon />}     label="View Metrics"     sub="Open results panel"     c="#475569"   onClick={() => dispatch(data.onViewMetrics)} />
              <Divider />
              <MI
                icon={isFailed ? <RestoreIcon /> : <WarningIcon />}
                label={isFailed ? "Restore Node" : "Simulate Failure"}
                sub={isFailed ? "Bring back online" : "Inject failure state"}
                c={isFailed ? "#059669" : "#d97706"}
                onClick={() => { setMenuOpen(false); data.onFailToggle?.(id, data.label); }}
              />
              <Divider />
              <MI icon={<DeleteIcon />}      label="Delete"           sub="Remove from canvas"     c="#dc2626"   onClick={() => dispatch(data.onDeleteClick)} />
            </div>
          )}
        </div>
      </div>

      {/* ── Config summary — compact key: value rows ── */}
      {summary.length > 0 && (
        <div style={{ padding: "5px 9px 6px" }}>
          {summary.map((line, i) => {
            const ci  = line.indexOf(":");
            const key = ci > -1 ? line.slice(0, ci).trim() : null;
            const val = ci > -1 ? line.slice(ci + 1).trim() : line;
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                marginBottom: i < summary.length - 1 ? 2 : 0,
              }}>
                {key ? (
                  <>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "#6b7280", flexShrink: 0, marginRight: 4 }}>{key}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color, fontWeight: 500, textAlign: "right", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {val}
                    </span>
                  </>
                ) : (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#374151" }}>{line}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Live simulation metrics ── */}
      {metrics && isSimulating && !isFailed && (
        <div style={{
          margin: "0 8px 6px", padding: "4px 7px",
          background: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#94a3b8" }}>TPUT</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#0ea5e9", fontWeight: 600 }}>{metrics.throughput} r/s</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#94a3b8" }}>LAT</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: latencyColor, fontWeight: 600 }}>{metrics.latency}ms</span>
          </div>
          <div style={{ height: 2, borderRadius: 1, background: "#e2e8f0", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 1, background: latencyColor,
              width: `${Math.min(100, (metrics.latency / 300) * 100)}%`,
              transition: "width 0.5s, background 0.3s",
            }} />
          </div>
        </div>
      )}

      {isFailed && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#ef4444", textAlign: "center", padding: "0 9px 6px", margin: 0 }}>
          traffic stopped
        </p>
      )}

      {/* Connection handles */}
      <Handle type="target" position={Position.Top}    style={{ top: -4,    background: color, border: "2px solid #fff", boxShadow: "0 0 0 1px #e2e8f0", width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ bottom: -4, background: color, border: "2px solid #fff", boxShadow: "0 0 0 1px #e2e8f0", width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left}   style={{ left: -4,   top: "40%", background: color, border: "2px solid #fff", boxShadow: "0 0 0 1px #e2e8f0", width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right}  style={{ right: -4,  top: "40%", background: color, border: "2px solid #fff", boxShadow: "0 0 0 1px #e2e8f0", width: 8, height: 8 }} />

      <style>{`@keyframes nodeRing{0%{opacity:0.7;transform:scale(1)}100%{opacity:0;transform:scale(1.1)}}`}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MI({ icon, label, sub, c, onClick }: { icon: React.ReactNode; label: string; sub: string; c: string; onClick: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        padding: "5px 10px", border: "none", cursor: "pointer", textAlign: "left",
        background: h ? `${c}08` : "transparent", transition: "background 0.1s",
      }}>
      <span style={{
        width: 24, height: 24, borderRadius: 5, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: h ? `${c}14` : "#f8fafc",
        border: `1px solid ${h ? c + "25" : "#f1f5f9"}`,
        color: h ? c : "#64748b", transition: "all 0.1s",
      }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 500, margin: 0, color: h ? c : "#1e293b", transition: "color 0.1s" }}>{label}</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, margin: 0, color: "#94a3b8" }}>{sub}</p>
      </div>
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#f1f5f9", margin: "2px 8px" }} />;
}

function StatusBadge({ text, bg }: { text: string; bg: string }) {
  return (
    <div style={{
      position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
      padding: "1px 7px", borderRadius: 3, background: bg, color: "#fff",
      fontSize: 7, fontWeight: 700, fontFamily: "var(--font-head)",
      letterSpacing: "0.06em", zIndex: 10, whiteSpace: "nowrap",
      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    }}>{text}</div>
  );
}

const SettingsIcon   = () => <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 1v1.5M6.5 10.5V12M1 6.5h1.5M10.5 6.5H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const PenIcon        = () => <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 10l1.5-1.5L9 3 10 4l-5.5 5.5L3 11l-1-.5V10z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M8.5 2.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
const CopyIcon       = () => <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><rect x="4" y="4" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1H10a1.5 1.5 0 0 1 1.5 1.5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
const DisconnectIcon = () => <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M8 2l3 3-3 3M5 8l-3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const MetricsIcon    = () => <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1 11l3-4 3 2 3-6 2 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const WarningIcon    = () => <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5l5.5 10H1L6.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6.5 5.5v2.5M6.5 9.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const RestoreIcon    = () => <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 6.5a4.5 4.5 0 1 0 1.5-3.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M2 2.5v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const DeleteIcon     = () => <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 4h9M5 4V2.5h3V4M11 4l-.8 7H2.8L2 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 6.5v2.5M7.5 6.5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;

export default memo(CustomNode);
