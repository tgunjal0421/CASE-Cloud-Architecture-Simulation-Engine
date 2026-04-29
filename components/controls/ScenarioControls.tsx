"use client";
// components/controls/ScenarioControls.tsx
// Bottom control bar for configuring simulation parameters.
// Exposes: trafficMultiplier slider, failure mode toggle, preset buttons.
// All state is lifted to page.tsx — this component is fully controlled.

import React from "react";
import { SCENARIO_PRESETS } from "@/lib/mockData";

interface ScenarioControlsProps {
  trafficMultiplier: number;
  failureMode: boolean;
  onTrafficChange: (value: number) => void;
  onFailureToggle: (value: boolean) => void;
  onPresetSelect: (presetId: string) => void;
  activePresetId: string | null;
  isRunning: boolean;
}

export default function ScenarioControls({
  trafficMultiplier,
  failureMode,
  onTrafficChange,
  onFailureToggle,
  onPresetSelect,
  activePresetId,
  isRunning,
}: ScenarioControlsProps) {
  // Traffic level label
  const trafficLabel =
    trafficMultiplier <= 2
      ? "Low"
      : trafficMultiplier <= 5
      ? "Moderate"
      : trafficMultiplier <= 8
      ? "High"
      : "Extreme";

  const trafficColor =
    trafficMultiplier <= 2
      ? "var(--brand-green)"
      : trafficMultiplier <= 5
      ? "var(--brand-blue)"
      : trafficMultiplier <= 8
      ? "var(--brand-violet)"
      : "#f87171";

  return (
    <div
      className="flex items-center gap-6 px-5 h-14 shrink-0"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--bg-border)",
        overflowX: "auto",
      }}
    >
      {/* ── Section label ── */}
      <span className="label-mono shrink-0">Scenario</span>

      {/* ── Preset buttons ── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {SCENARIO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset.id)}
            disabled={isRunning}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background:
                activePresetId === preset.id
                  ? "rgba(0,229,255,0.12)"
                  : "var(--bg-elevated)",
              border: `1px solid ${
                activePresetId === preset.id ? "var(--brand-cyan)" : "var(--bg-border)"
              }`,
              color:
                activePresetId === preset.id
                  ? "var(--brand-cyan)"
                  : "var(--text-secondary)",
              cursor: isRunning ? "not-allowed" : "pointer",
              opacity: isRunning ? 0.5 : 1,
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <Divider />

      {/* ── Traffic multiplier slider ── */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="label-mono">Traffic</span>

        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium w-4 text-right"
            style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            1×
          </span>

          <div className="relative flex items-center">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={trafficMultiplier}
              onChange={(e) => onTrafficChange(Number(e.target.value))}
              disabled={isRunning}
              className="w-28 appearance-none cursor-pointer"
              style={{
                height: 4,
                background: `linear-gradient(to right, ${trafficColor} 0%, ${trafficColor} ${
                  ((trafficMultiplier - 1) / 9) * 100
                }%, var(--bg-border) ${((trafficMultiplier - 1) / 9) * 100}%, var(--bg-border) 100%)`,
                borderRadius: 4,
                outline: "none",
                opacity: isRunning ? 0.5 : 1,
              }}
            />
            <style>{`
              input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: var(--brand-cyan);
                border: 2px solid var(--bg-base);
                cursor: pointer;
                box-shadow: 0 0 6px rgba(0,229,255,0.4);
              }
              input[type=range]:disabled::-webkit-slider-thumb {
                cursor: not-allowed;
                opacity: 0.5;
              }
            `}</style>
          </div>

          <span
            className="text-xs font-medium w-4"
            style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            10×
          </span>
        </div>

        {/* Live value badge */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
          style={{ background: `${trafficColor}18`, border: `1px solid ${trafficColor}40` }}
        >
          <span
            className="text-xs font-bold"
            style={{ color: trafficColor, fontFamily: "'JetBrains Mono', monospace" }}
          >
            ×{trafficMultiplier}
          </span>
          <span className="text-xs" style={{ color: trafficColor, fontSize: "10px" }}>
            {trafficLabel}
          </span>
        </div>
      </div>

      <Divider />

      {/* ── Failure mode toggle ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="label-mono">Chaos Mode</span>

        <button
          onClick={() => !isRunning && onFailureToggle(!failureMode)}
          disabled={isRunning}
          className="relative w-9 h-5 rounded-full transition-all"
          style={{
            background: failureMode ? "#f87171" : "var(--bg-border)",
            cursor: isRunning ? "not-allowed" : "pointer",
            border: "none",
            outline: "none",
            opacity: isRunning ? 0.5 : 1,
          }}
          title="Toggle random service failure simulation"
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
            style={{
              background: failureMode ? "#0a0e1a" : "var(--text-muted)",
              left: failureMode ? "calc(100% - 18px)" : 2,
            }}
          />
        </button>

        {failureMode && (
          <span className="text-xs animate-fade-in" style={{ color: "#f87171", fontSize: "10px" }}>
            Random failures enabled
          </span>
        )}
      </div>

      {/* ── Right: Node + edge count info ── */}
      <div className="ml-auto shrink-0">
        <span className="label-mono">
          Running: {isRunning ? (
            <span style={{ color: "var(--brand-cyan)" }}>●</span>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>○</span>
          )}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="h-5 shrink-0"
      style={{ width: 1, background: "var(--bg-border)" }}
    />
  );
}
