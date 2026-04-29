"use client";
// components/dashboard/AnalyticsCharts.tsx
// Displays three charts for simulation results:
//   1. Latency (line chart — p50/p95/p99 percentiles)
//   2. Throughput (area chart — requests per second)
//   3. Resource usage (horizontal bar gauges)
// All data comes from props — charts are purely presentational.

import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MetricsResponse } from "@/lib/api";

interface AnalyticsChartsProps {
  metrics: MetricsResponse | null;
  isLoading: boolean;
}

export default function AnalyticsCharts({ metrics, isLoading }: AnalyticsChartsProps) {
  if (isLoading) return <ChartsSkeletonLoader />;
  if (!metrics) return <EmptyMetricsState />;

  return (
    <div className="flex flex-col gap-4">
      {/* Latency chart */}
      <ChartCard title="Latency" subtitle="ms · p50 / p95 / p99">
        <ResponsiveContainer width="100%" height={90}>
          <LineChart data={metrics.latency} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: "var(--text-muted)", fontFamily: "'JetBrains Mono'" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--text-muted)", fontFamily: "'JetBrains Mono'" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="p50"
              stroke="var(--brand-green)"
              strokeWidth={1.5}
              dot={false}
              name="p50"
            />
            <Line
              type="monotone"
              dataKey="p95"
              stroke="var(--brand-blue)"
              strokeWidth={1.5}
              dot={false}
              name="p95"
            />
            <Line
              type="monotone"
              dataKey="p99"
              stroke="#f87171"
              strokeWidth={1.5}
              dot={false}
              name="p99"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex gap-3 mt-1">
          {[
            { key: "p50", color: "var(--brand-green)" },
            { key: "p95", color: "var(--brand-blue)" },
            { key: "p99", color: "#f87171" },
          ].map(({ key, color }) => (
            <div key={key} className="flex items-center gap-1">
              <div className="w-4 h-0.5 rounded" style={{ background: color }} />
              <span style={{ color: "var(--text-muted)", fontSize: 9, fontFamily: "'JetBrains Mono'" }}>
                {key}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Throughput chart */}
      <ChartCard title="Throughput" subtitle="req/s">
        <ResponsiveContainer width="100%" height={70}>
          <AreaChart data={metrics.throughput} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-cyan)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--brand-cyan)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: "var(--text-muted)", fontFamily: "'JetBrains Mono'" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--text-muted)", fontFamily: "'JetBrains Mono'" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="rps"
              stroke="var(--brand-cyan)"
              strokeWidth={1.5}
              fill="url(#throughputGrad)"
              name="req/s"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Resource usage bars */}
      <ChartCard title="Resource Usage" subtitle="current utilization">
        <div className="flex flex-col gap-2 mt-1">
          {metrics.resources.map((r) => (
            <ResourceBar key={r.resource} label={r.resource} usage={r.usage} unit={r.unit} />
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>
          {title}
        </p>
        <span className="label-mono">{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function ResourceBar({ label, usage, unit }: { label: string; usage: number; unit: string }) {
  // Color shifts from green → yellow → red based on usage %
  const barColor =
    usage > 80 ? "#f87171" : usage > 60 ? "var(--brand-blue)" : "var(--brand-green)";

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
          {label}
        </span>
        <span
          className="text-xs"
          style={{ color: barColor, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}
        >
          {usage}
          {unit}
        </span>
      </div>
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "var(--bg-border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${usage}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

// Custom recharts tooltip styled to match dark theme
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-2.5 py-2 rounded-lg text-xs"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--bg-border)",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <p className="mb-1" style={{ color: "var(--text-muted)", fontSize: "9px" }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: "var(--text-secondary)" }}>{entry.name}:</span>
          <span style={{ color: "var(--text-primary)" }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// Loading skeleton — shown while fetchMetrics() is in flight
function ChartsSkeletonLoader() {
  return (
    <div className="flex flex-col gap-4">
      {[90, 70, 80].map((h, i) => (
        <div
          key={i}
          className="p-3 rounded-xl"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}
        >
          <div
            className="h-3 w-20 rounded mb-3"
            style={{ background: "var(--bg-border)", animation: "pulse 1.5s ease infinite" }}
          />
          <div
            className="rounded"
            style={{
              height: h,
              background: "linear-gradient(90deg, var(--bg-border) 25%, var(--bg-elevated) 50%, var(--bg-border) 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}

// Shown before first simulation run
function EmptyMetricsState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity={0.3}>
        <rect x="3" y="24" width="6" height="9" rx="1" fill="var(--brand-cyan)" />
        <rect x="12" y="16" width="6" height="17" rx="1" fill="var(--brand-blue)" />
        <rect x="21" y="10" width="6" height="23" rx="1" fill="var(--brand-green)" />
        <rect x="30" y="4" width="3" height="29" rx="1" fill="var(--brand-cyan)" opacity="0.5" />
      </svg>
      <div className="text-center">
        <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          No metrics yet
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Run a simulation to see results
        </p>
      </div>
    </div>
  );
}
