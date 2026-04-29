"use client";
// components/dashboard/CostPanel.tsx
// Displays estimated monthly cloud costs for the current architecture.
// Cost values come from the fetchCostEstimate() API call.
// Breakdowns update as nodes are added/removed from the canvas.

import React from "react";
import { CostEstimateResponse } from "@/lib/api";

interface CostPanelProps {
  costData: CostEstimateResponse | null;
  isLoading: boolean;
  nodeCount: number;
}

export default function CostPanel({ costData, isLoading, nodeCount }: CostPanelProps) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs font-semibold"
          style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}
        >
          Cost Estimate
        </p>
        <span className="label-mono">Monthly</span>
      </div>

      {/* No nodes state */}
      {nodeCount === 0 ? (
        <p className="text-xs text-center py-3" style={{ color: "var(--text-muted)" }}>
          Add nodes to estimate cost
        </p>
      ) : isLoading ? (
        <CostSkeleton />
      ) : costData ? (
        <>
          {/* Line items */}
          <div className="flex flex-col gap-2 mb-3">
            <CostLineItem
              label="Compute"
              amount={costData.compute.amount}
              unit={costData.compute.unit}
              icon="⬡"
              color="var(--brand-blue)"
              percentage={Math.round((costData.compute.amount / costData.total.amount) * 100)}
            />
            <CostLineItem
              label="Storage"
              amount={costData.storage.amount}
              unit={costData.storage.unit}
              icon="⬛"
              color="var(--brand-violet)"
              percentage={Math.round((costData.storage.amount / costData.total.amount) * 100)}
            />
            <CostLineItem
              label="Network"
              amount={costData.network.amount}
              unit={costData.network.unit}
              icon="⟺"
              color="var(--brand-cyan)"
              percentage={Math.round((costData.network.amount / costData.total.amount) * 100)}
            />
          </div>

          {/* Stacked bar breakdown */}
          <StackedCostBar costData={costData} />

          {/* Total */}
          <div
            className="flex items-center justify-between mt-3 pt-3"
            style={{ borderTop: "1px solid var(--bg-border)" }}
          >
            <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              Est. Total
            </span>
            <span
              className="text-sm font-bold"
              style={{
                color: "var(--brand-cyan)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ${costData.total.amount.toFixed(2)}
              <span className="text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                /mo
              </span>
            </span>
          </div>

          {/* Disclaimer */}
          <p className="text-center mt-2" style={{ color: "var(--text-muted)", fontSize: "9px" }}>
            Estimates based on standard on-demand pricing.
            <br />
            Actual costs may vary.
          </p>
        </>
      ) : null}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function CostLineItem({
  label,
  amount,
  unit,
  icon,
  color,
  percentage,
}: {
  label: string;
  amount: number;
  unit: string;
  icon: string;
  color: string;
  percentage: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <span className="flex-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span
        className="text-xs"
        style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}
      >
        {percentage}%
      </span>
      <span
        className="text-xs font-medium w-14 text-right"
        style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}
      >
        ${amount}
      </span>
    </div>
  );
}

function StackedCostBar({ costData }: { costData: CostEstimateResponse }) {
  const total = costData.total.amount;
  const segments = [
    { amount: costData.compute.amount, color: "var(--brand-blue)" },
    { amount: costData.storage.amount, color: "var(--brand-violet)" },
    { amount: costData.network.amount, color: "var(--brand-cyan)" },
  ];

  return (
    <div className="flex rounded-full overflow-hidden h-1.5 gap-px">
      {segments.map((seg, i) => (
        <div
          key={i}
          className="h-full transition-all duration-500"
          style={{ width: `${(seg.amount / total) * 100}%`, background: seg.color }}
        />
      ))}
    </div>
  );
}

function CostSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ background: "var(--bg-border)" }} />
          <div className="flex-1 h-3 rounded" style={{ background: "var(--bg-border)" }} />
          <div className="w-12 h-3 rounded" style={{ background: "var(--bg-border)" }} />
        </div>
      ))}
    </div>
  );
}
