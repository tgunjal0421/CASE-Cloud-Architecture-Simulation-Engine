"use client";
// components/controls/ScenarioControls.tsx
// Bottom bar — scenario presets, traffic slider (LIVE during sim), chaos toggle.
// KEY FIX: traffic slider is NEVER disabled — always adjustable even during simulation.
// Presets and chaos toggle are only locked during active run (they restart sim logic).

import React from "react";
import { SCENARIO_PRESETS } from "@/lib/mockData";
import { SimStatus } from "@/lib/useSimulation";

interface ScenarioControlsProps {
  simStatus:         SimStatus;
  trafficMultiplier: number;
  failureMode:       boolean;
  activePresetId:    string | null;
  onTrafficChange:   (value: number) => void;
  onFailureToggle:   (value: boolean) => void;
  onPresetSelect:    (presetId: string) => void;
}

export default function ScenarioControls({
  simStatus, trafficMultiplier, failureMode,
  activePresetId, onTrafficChange, onFailureToggle, onPresetSelect,
}: ScenarioControlsProps) {
  const isRunning = simStatus === "running";

  const trafficColor =
    trafficMultiplier <= 2 ? "#00c896"
    : trafficMultiplier <= 5 ? "#4f8ef7"
    : trafficMultiplier <= 8 ? "#9b7bea"
    : "#f87171";

  const trafficLabel =
    trafficMultiplier <= 2 ? "Low"
    : trafficMultiplier <= 5 ? "Moderate"
    : trafficMultiplier <= 8 ? "High"
    : "Extreme";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 20,
      padding: "0 18px", height: 52, flexShrink: 0,
      background: "var(--bg-surface)", borderTop: "1px solid var(--bg-border)",
      overflowX: "auto",
    }}>

      {/* ── Label ── */}
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", flexShrink: 0 }}>
        Scenario
      </span>

      {/* ── Presets — locked during run (changing preset effectively restarts params) ── */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {SCENARIO_PRESETS.map((preset) => {
          const active = activePresetId === preset.id;
          return (
            <button key={preset.id}
              onClick={() => onPresetSelect(preset.id)}
              title={preset.label}
              style={{
                padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 500,
                background: active ? "rgba(0,229,255,0.12)" : "var(--bg-elevated)",
                border: `1px solid ${active ? "#00e5ff" : "var(--bg-border)"}`,
                color: active ? "#00e5ff" : "var(--text-secondary)",
                cursor: "pointer",
                opacity: 1,
                fontFamily: "'DM Sans',sans-serif",
                transition: "all 0.15s",
              }}
            >{preset.label}</button>
          );
        })}
      </div>

      <Divider />

      {/* ── Traffic multiplier — ALWAYS adjustable, even during simulation ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
          Traffic
        </span>

        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>1×</span>

        <input type="range" min={1} max={10} step={1}
          value={trafficMultiplier}
          onChange={(e) => onTrafficChange(Number(e.target.value))}
          // ✅ NEVER disabled — live control during simulation
          style={{
            width: 110, height: 4, appearance: "none" as const,
            borderRadius: 4, outline: "none", cursor: "pointer",
            background: `linear-gradient(to right, ${trafficColor} ${((trafficMultiplier - 1) / 9) * 100}%, var(--bg-border) ${((trafficMultiplier - 1) / 9) * 100}%)`,
          }}
        />
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none; width: 14px; height: 14px;
            border-radius: 50%; background: #00e5ff;
            border: 2px solid var(--bg-base); cursor: pointer;
            box-shadow: 0 0 6px rgba(0,229,255,0.4);
          }
        `}</style>

        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>10×</span>

        {/* Live badge — glows when running */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 8px", borderRadius: 6,
          background: `${trafficColor}15`,
          border: `1px solid ${trafficColor}${isRunning ? "80" : "40"}`,
          boxShadow: isRunning ? `0 0 8px ${trafficColor}30` : "none",
          transition: "all 0.3s",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: trafficColor, fontFamily: "'JetBrains Mono',monospace" }}>
            ×{trafficMultiplier}
          </span>
          <span style={{ fontSize: 9, color: trafficColor }}>{trafficLabel}</span>
          {isRunning && (
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: trafficColor, animation: "liveDot 1s ease infinite", flexShrink: 0 }} />
          )}
        </div>
      </div>

      <Divider />

      {/* ── Chaos mode — locked during run ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
          Chaos
        </span>
        <button
          onClick={() => !isRunning && onFailureToggle(!failureMode)}
          title={isRunning ? "Stop simulation to toggle chaos mode" : "Toggle random failure injection"}
          style={{
            width: 36, height: 20, borderRadius: 10, border: "none", position: "relative",
            background: failureMode ? "#f87171" : "var(--bg-border)",
            cursor: isRunning ? "not-allowed" : "pointer",
            opacity: isRunning ? 0.5 : 1, transition: "background 0.2s",
          }}
        >
          <div style={{
            position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%",
            background: failureMode ? "#080c18" : "var(--text-muted)",
            left: failureMode ? 18 : 2, transition: "left 0.2s, background 0.2s",
          }} />
        </button>
        {failureMode && (
          <span style={{ fontSize: 10, color: "#f87171" }}>enabled</span>
        )}
      </div>

      {/* ── Right: simulation state indicator ── */}
      <div style={{ marginLeft: "auto", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
          Status
        </span>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 8px", borderRadius: 6,
          background: isRunning ? "rgba(0,229,255,0.08)" : "var(--bg-elevated)",
          border: `1px solid ${isRunning ? "#00e5ff40" : "var(--bg-border)"}`,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: isRunning ? "#00e5ff" : simStatus === "stopped" ? "#f87171" : "var(--text-muted)",
            animation: isRunning ? "liveDot 1s ease infinite" : "none",
          }} />
          <span style={{
            fontSize: 9, fontFamily: "'JetBrains Mono',monospace",
            color: isRunning ? "#00e5ff" : simStatus === "stopped" ? "#f87171" : "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            {simStatus}
          </span>
        </div>
      </div>

      <style>{`@keyframes liveDot{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: "var(--bg-border)", flexShrink: 0 }} />;
}
