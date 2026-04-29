"use client";
// components/layout/RightPanel.tsx
// Right-side panel that houses Analytics and Cost sections.
// Tabs let the user switch between them; data comes from parent state.

import React, { useState } from "react";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import CostPanel from "@/components/dashboard/CostPanel";
import { MetricsResponse, CostEstimateResponse } from "@/lib/api";

interface RightPanelProps {
  metrics: MetricsResponse | null;
  costData: CostEstimateResponse | null;
  isMetricsLoading: boolean;
  isCostLoading: boolean;
  nodeCount: number;
  lastRunId: string | null;
}

type Tab = "analytics" | "cost";

export default function RightPanel({
  metrics,
  costData,
  isMetricsLoading,
  isCostLoading,
  nodeCount,
  lastRunId,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("analytics");

  return (
    <aside
      className="flex flex-col h-full animate-fade-in"
      style={{
        width: 260,
        minWidth: 260,
        background: "var(--bg-surface)",
        borderLeft: "1px solid var(--bg-border)",
      }}
    >
      {/* ── Panel header ── */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid var(--bg-border)" }}>
        <p className="label-mono mb-2">Results</p>

        {/* Tab switcher */}
        <div
          className="flex rounded-lg p-0.5 gap-0.5"
          style={{ background: "var(--bg-elevated)" }}
        >
          {([
            { id: "analytics", label: "Analytics" },
            { id: "cost", label: "Cost" },
          ] as { id: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                background: activeTab === tab.id ? "var(--bg-border)" : "transparent",
                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
                border: "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Last run ID badge */}
        {lastRunId && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--brand-green)" }} />
            <span
              className="truncate"
              style={{
                color: "var(--text-muted)",
                fontSize: "9px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {lastRunId}
            </span>
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {activeTab === "analytics" ? (
          <AnalyticsCharts metrics={metrics} isLoading={isMetricsLoading} />
        ) : (
          <CostPanel
            costData={costData}
            isLoading={isCostLoading}
            nodeCount={nodeCount}
          />
        )}
      </div>

      {/* ── Footer — cloud provider note ── */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderTop: "1px solid var(--bg-border)" }}
      >
        <div className="flex gap-1.5">
          {["AWS", "Azure", "GCP"].map((provider) => (
            <span
              key={provider}
              className="px-1.5 py-0.5 rounded"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--bg-border)",
                color: "var(--text-muted)",
                fontSize: "8px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {provider}
            </span>
          ))}
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: "9px" }}>multi-cloud</span>
      </div>
    </aside>
  );
}
