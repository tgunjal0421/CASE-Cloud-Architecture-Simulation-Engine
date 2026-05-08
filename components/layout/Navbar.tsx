"use client";
// components/layout/Navbar.tsx
// Top bar: brand · actions only.
// Status and node count live exclusively in the bottom status bar — not duplicated here.

import React from "react";

interface NavbarProps {
  isSaving:        boolean;
  nodeCount:       number;   // kept only to disable Run when canvas is empty
  resultsOpen:     boolean;
  onStart:         () => void;
  onStop:          () => void;
  onSave:          () => void;
  onReset:         () => void;
  onToggleResults: () => void;
  isRunning:       boolean;
  isStopped:       boolean;
}

export default function Navbar({
  isSaving, nodeCount, resultsOpen,
  onStart, onStop, onSave, onReset, onToggleResults,
  isRunning, isStopped,
}: NavbarProps) {
  return (
    <header style={{
      display: "flex", alignItems: "center", height: 48,
      padding: "0 16px", flexShrink: 0,
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--bg-border)",
    }}>

      {/* ── Brand ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 20 }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="1" y="1" width="20" height="20" rx="4" stroke="var(--brand-cyan)" strokeWidth="1.5" fill="none" />
          <path d="M6 16 L11 6 L16 16" stroke="var(--brand-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M8 12.5h6" stroke="var(--brand-cyan)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>
            CASE
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: 1 }}>
            Simulator v1.0
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 24, background: "var(--bg-border)", marginRight: 16 }} />

      {/* ── Spacer — pushes actions to the right ── */}
      <div style={{ flex: 1 }} />

      {/* ── Actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

        <NavBtn onClick={onToggleResults} active={resultsOpen} title="Toggle results panel">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 1v10" stroke="currentColor" strokeWidth="1.2" />
            <path d="M5 4h2M5 6h2M5 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          Results
        </NavBtn>

        <div style={{ width: 1, height: 20, background: "var(--bg-border)" }} />

        <NavBtn onClick={onReset} title="Reset canvas">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6a4 4 0 1 1 1.5 3.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M2 9.5V6.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reset
        </NavBtn>

        <NavBtn onClick={onSave} disabled={isSaving} title="Save architecture">
          {isSaving ? <Spinner /> : (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 10h8M6 2v6M3.5 5.5L6 8l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {isSaving ? "Saving…" : "Save"}
        </NavBtn>

        <div style={{ width: 1, height: 20, background: "var(--bg-border)" }} />

        {/* Run / Stop */}
        {isRunning ? (
          <button onClick={onStop} title="Stop simulation" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 5,
            background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.35)",
            color: "var(--brand-red)", cursor: "pointer",
            fontSize: 11, fontWeight: 600, fontFamily: "var(--font-head)",
            letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.13)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.07)"; }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
              <rect x="0.5" y="0.5" width="8" height="8" rx="1.5" />
            </svg>
            Stop
          </button>
        ) : (
          <button onClick={onStart} disabled={nodeCount === 0}
            title={nodeCount === 0 ? "Add nodes to canvas first" : "Start simulation"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 14px", borderRadius: 5,
              background: nodeCount === 0 ? "var(--bg-elevated)" : "var(--brand-cyan)",
              border: `1px solid ${nodeCount === 0 ? "var(--bg-border)" : "var(--brand-cyan)"}`,
              color: nodeCount === 0 ? "var(--text-muted)" : "#ffffff",
              cursor: nodeCount === 0 ? "not-allowed" : "pointer",
              fontSize: 11, fontWeight: 600, fontFamily: "var(--font-head)",
              letterSpacing: "0.06em", textTransform: "uppercase",
              opacity: nodeCount === 0 ? 0.55 : 1, transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { if (nodeCount > 0) (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
          >
            <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
              <path d="M0 0l8 5-8 5V0z" />
            </svg>
            {isStopped ? "Restart" : "Run"}
          </button>
        )}
      </div>
    </header>
  );
}

function NavBtn({ children, onClick, disabled, active, title }: {
  children: React.ReactNode; onClick: () => void;
  disabled?: boolean; active?: boolean; title?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 5,
      background: active ? "rgba(3,105,161,0.08)" : "transparent",
      border: `1px solid ${active ? "rgba(3,105,161,0.3)" : "transparent"}`,
      color: active ? "var(--brand-cyan)" : "var(--text-secondary)",
      fontSize: 11, fontFamily: "var(--font-ui)",
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      transition: "all 0.12s",
    }}
    onMouseEnter={(e) => { if (!disabled && !active) { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--bg-border)"; } }}
    onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; } }}
    >
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ animation: "spin 0.7s linear infinite" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="16 8" strokeLinecap="round" />
    </svg>
  );
}
