"use client";
// components/controls/ScenarioControls.tsx
// Minimal bottom status bar only — traffic slider and chaos have moved to Results panel.
// Shows: node count · run ID · sim status · quick traffic readout.

import React from "react";
import { SimStatus } from "@/lib/useSimulation";

interface ScenarioControlsProps {
  simStatus:         SimStatus;
  trafficMultiplier: number;
  failureMode:       boolean;
  nodeCount:         number;
  lastRunId:         string | null;
}

export default function ScenarioControls({
  simStatus, trafficMultiplier, failureMode, nodeCount, lastRunId,
}: ScenarioControlsProps) {
  const isRunning = simStatus === "running";
  const isStopped = simStatus === "stopped";

  const trafficColor =
    trafficMultiplier <= 2 ? "var(--brand-green)"
    : trafficMultiplier <= 5 ? "var(--brand-blue)"
    : trafficMultiplier <= 8 ? "var(--brand-violet)"
    : "var(--brand-red)";

  const statusColor = isRunning ? "var(--brand-cyan)"
    : isStopped ? "var(--brand-red)"
    : "var(--text-muted)";

  return (
    <div style={{
      display: "flex", alignItems: "center",
      height: 28, flexShrink: 0, padding: "0 14px", gap: 16,
      background: "var(--bg-elevated)",
      borderTop: "1px solid var(--bg-border)",
    }}>
      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{
          width: 5, height: 5, borderRadius: "50%", background: statusColor, flexShrink: 0,
          animation: isRunning ? "pulseDot 1.2s ease infinite" : "none",
        }} />
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em",
          textTransform: "uppercase", color: statusColor,
        }}>{simStatus}</span>
      </div>

      <Sep />

      {/* Node count */}
      <Item label="Nodes" value={`${nodeCount}`} />

      <Sep />

      {/* Traffic */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span className="eng-label">Traffic</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, color: trafficColor }}>
          ×{trafficMultiplier}
        </span>
      </div>

      {/* Chaos indicator */}
      {failureMode && (
        <>
          <Sep />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--brand-red)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--brand-red)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Chaos
            </span>
          </div>
        </>
      )}

      {/* Run ID — right aligned */}
      {lastRunId && (
        <div style={{ marginLeft: "auto" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: "0.02em" }}>
            {lastRunId.slice(-16)}
          </span>
        </div>
      )}
    </div>
  );
}

function Sep() {
  return <div style={{ width: 1, height: 12, background: "var(--bg-border)", flexShrink: 0 }} />;
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span className="eng-label">{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-secondary)" }}>{value}</span>
    </div>
  );
}
