"use client";
// components/layout/Navbar.tsx
// Top navigation bar. Holds global actions: Run Simulation, Save, Reset.
// Accepts callbacks so parent (page.tsx) controls all state — this component is purely presentational.

import React from "react";

interface NavbarProps {
  isRunning: boolean;
  isSaving: boolean;
  onRunSimulation: () => void;
  onSave: () => void;
  onReset: () => void;
  nodeCount: number;
}

export default function Navbar({
  isRunning,
  isSaving,
  onRunSimulation,
  onSave,
  onReset,
  nodeCount,
}: NavbarProps) {
  return (
    <header
      className="flex items-center justify-between px-5 h-14 shrink-0"
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--bg-border)",
        zIndex: 50,
      }}
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-3">
        {/* Animated logo mark */}
        <div className="relative w-7 h-7">
          <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
            <polygon
              points="14,2 26,9 26,19 14,26 2,19 2,9"
              stroke="var(--brand-cyan)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <polygon
              points="14,7 21,11 21,17 14,21 7,17 7,11"
              fill="var(--brand-cyan)"
              opacity="0.15"
            />
            <circle cx="14" cy="14" r="3" fill="var(--brand-cyan)" />
          </svg>
        </div>

        <div className="flex flex-col leading-none">
          <span
            className="text-sm font-bold tracking-wide"
            style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
          >
            CASE
            <span className="ml-1.5 text-xs font-normal" style={{ color: "var(--brand-cyan)" }}>
              Simulator
            </span>
          </span>
          <span className="label-mono mt-0.5">Cloud Architecture Engine</span>
        </div>
      </div>

      {/* ── Center status pill ── */}
      <div
        className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--bg-border)",
          color: "var(--text-secondary)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: isRunning ? "var(--brand-cyan)" : "var(--text-muted)" }}
        />
        {isRunning ? (
          <span style={{ color: "var(--brand-cyan)" }}>Simulation running…</span>
        ) : (
          <span>{nodeCount} node{nodeCount !== 1 ? "s" : ""} on canvas</span>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-2">
        {/* Reset */}
        <button
          onClick={onReset}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
            color: "var(--text-secondary)",
            cursor: isRunning ? "not-allowed" : "pointer",
            opacity: isRunning ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isRunning) (e.currentTarget as HTMLElement).style.borderColor = "#f87171";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--bg-border)";
          }}
          title="Clear canvas"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6a4 4 0 1 1 1.5 3.1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path d="M2 9.5V6.5H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reset
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          disabled={isRunning || isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
            color: isSaving ? "var(--brand-blue)" : "var(--text-secondary)",
            cursor: isRunning || isSaving ? "not-allowed" : "pointer",
            opacity: isRunning ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isRunning && !isSaving)
              (e.currentTarget as HTMLElement).style.borderColor = "var(--brand-blue)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--bg-border)";
          }}
          title="Save architecture"
        >
          {isSaving ? (
            <>
              <Spinner color="var(--brand-blue)" />
              Saving…
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3.5 1v3h5V1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2.5 7.5h7v3h-7z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Save
            </>
          )}
        </button>

        {/* Run Simulation — primary CTA */}
        <button
          onClick={onRunSimulation}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isRunning ? "pulse-ring" : ""
          }`}
          style={{
            background: isRunning
              ? "rgba(0,229,255,0.1)"
              : "linear-gradient(135deg, var(--brand-cyan), var(--brand-blue))",
            border: "1px solid var(--brand-cyan)",
            color: isRunning ? "var(--brand-cyan)" : "#0a0e1a",
            cursor: isRunning ? "not-allowed" : "pointer",
            fontFamily: "'Syne', sans-serif",
            letterSpacing: "0.04em",
          }}
          title={nodeCount === 0 ? "Add nodes to the canvas first" : "Run simulation"}
        >
          {isRunning ? (
            <>
              <Spinner color="var(--brand-cyan)" />
              Running
            </>
          ) : (
            <>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                <path d="M0 0l10 6-10 6V0z" />
              </svg>
              Run Simulation
            </>
          )}
        </button>
      </div>
    </header>
  );
}

// Small inline spinner — avoids a separate file for a tiny utility
function Spinner({ color }: { color: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="6" cy="6" r="4.5" stroke={color} strokeWidth="1.5" strokeDasharray="16 8" strokeLinecap="round" />
    </svg>
  );
}
