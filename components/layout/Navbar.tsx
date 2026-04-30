"use client";
// components/layout/Navbar.tsx
// Single primary action button: Start / Stop — never disabled while running.
// Status badge reflects SimStatus exactly. Reset + Save always accessible.

import React from "react";
import { SimStatus } from "@/lib/useSimulation";

interface NavbarProps {
  simStatus:  SimStatus;
  isSaving:   boolean;
  nodeCount:  number;
  onStart:    () => void;
  onStop:     () => void;
  onSave:     () => void;
  onReset:    () => void;
}

export default function Navbar({
  simStatus, isSaving, nodeCount,
  onStart, onStop, onSave, onReset,
}: NavbarProps) {
  const isRunning = simStatus === "running";
  const isStopped = simStatus === "stopped";

  // Status badge config per state
  const statusConfig = {
    idle:    { dot: "#4a5568",  text: `${nodeCount} node${nodeCount !== 1 ? "s" : ""} on canvas`, color: "var(--text-secondary)" },
    running: { dot: "#00e5ff",  text: "Simulation running",  color: "#00e5ff"  },
    stopped: { dot: "#f87171",  text: "Simulation stopped",  color: "#f87171"  },
  }[simStatus];

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 18px", height: 52, flexShrink: 0,
      background: "var(--bg-surface)", borderBottom: "1px solid var(--bg-border)", zIndex: 50,
    }}>

      {/* ── Brand ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
          <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" stroke="#00e5ff" strokeWidth="1.5" fill="none" opacity="0.6" />
          <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="#00e5ff" opacity="0.15" />
          <circle cx="14" cy="14" r="3" fill="#00e5ff" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-primary)", letterSpacing: "0.03em" }}>
            CASE <span style={{ color: "#00e5ff", fontWeight: 500, fontSize: 11 }}>Simulator</span>
          </span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginTop: 2 }}>
            Cloud Architecture Engine
          </span>
        </div>
      </div>

      {/* ── Status badge (center) ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "5px 14px", borderRadius: 20,
        background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
        fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: statusConfig.dot, flexShrink: 0,
          animation: isRunning ? "navPulse 1.4s ease-in-out infinite" : "none",
        }} />
        <span style={{ color: statusConfig.color }}>{statusConfig.text}</span>
        {/* SimStatus pill */}
        <span style={{
          padding: "1px 6px", borderRadius: 10, fontSize: 8, fontWeight: 700,
          background: isRunning ? "rgba(0,229,255,0.15)" : isStopped ? "rgba(248,113,113,0.15)" : "var(--bg-border)",
          color: isRunning ? "#00e5ff" : isStopped ? "#f87171" : "var(--text-muted)",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          {simStatus}
        </span>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        {/* Reset — always enabled */}
        <NavBtn
          onClick={onReset}
          hoverBorder="#f87171"
          title="Reset canvas and simulation"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6a4 4 0 1 1 1.5 3.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 9.5V6.5H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reset
        </NavBtn>

        {/* Save — disabled only while actively saving */}
        <NavBtn
          onClick={onSave}
          disabled={isSaving}
          hoverBorder="#4f8ef7"
          title="Save architecture"
        >
          {isSaving ? <Spinner color="#4f8ef7" /> : (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M3.5 1v3h5V1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2.5 7.5h7v3h-7z" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
          {isSaving ? "Saving…" : "Save"}
        </NavBtn>

        {/* ── PRIMARY: Start / Stop — always clickable, changes meaning ── */}
        {isRunning ? (
          // STOP button — red, always clickable during run
          <button
            onClick={onStop}
            title="Stop simulation"
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(248,113,113,0.12)",
              border: "1px solid #f87171",
              color: "#f87171",
              cursor: "pointer", fontFamily: "'Syne',sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.22)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.12)"; }}
          >
            {/* Square stop icon */}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="1" y="1" width="8" height="8" rx="1.5" />
            </svg>
            Stop Simulation
          </button>
        ) : (
          // START button — cyan, disabled only when no nodes
          <button
            onClick={onStart}
            disabled={nodeCount === 0}
            title={nodeCount === 0 ? "Add nodes to the canvas first" : "Start simulation"}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 8,
              background: nodeCount === 0
                ? "var(--bg-elevated)"
                : "linear-gradient(135deg, #00e5ff, #4f8ef7)",
              border: `1px solid ${nodeCount === 0 ? "var(--bg-border)" : "#00e5ff"}`,
              color: nodeCount === 0 ? "var(--text-muted)" : "#080c18",
              cursor: nodeCount === 0 ? "not-allowed" : "pointer",
              fontFamily: "'Syne',sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
              opacity: nodeCount === 0 ? 0.5 : 1,
              transition: "all 0.15s",
            }}
          >
            <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor">
              <path d="M0 0l9 5.5L0 11V0z" />
            </svg>
            {isStopped ? "Restart" : "Start Simulation"}
          </button>
        )}
      </div>

      <style>{`
        @keyframes navPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
      `}</style>
    </header>
  );
}

// ── Ghost button ──────────────────────────────────────────────────────────
function NavBtn({ children, onClick, disabled, hoverBorder, title }: {
  children: React.ReactNode; onClick: () => void;
  disabled?: boolean; hoverBorder?: string; title?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 11px", borderRadius: 8,
        background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
        color: "var(--text-secondary)", fontSize: 11, fontFamily: "'DM Sans',sans-serif",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
        transition: "border-color 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => { if (!disabled && hoverBorder) (e.currentTarget as HTMLElement).style.borderColor = hoverBorder; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--bg-border)"; }}
    >
      {children}
    </button>
  );
}

function Spinner({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="6" cy="6" r="4.5" stroke={color} strokeWidth="1.5" strokeDasharray="16 8" strokeLinecap="round" />
    </svg>
  );
}
