"use client";
// components/layout/RightPanel.tsx
// Case 1 fix: metrics, logs, cost persist after simulation stops — never wiped on stop
// Case 3 fix: live latency + throughput time-series graphs built from simulation ticks

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { CostEstimateResponse } from "@/lib/api";
import { SystemMetrics, LogEntry } from "@/lib/simulationEngine";
import { SimStatus } from "@/lib/useSimulation";

// ── Rolling chart data point ───────────────────────────────────────────────
interface ChartPoint {
  t:   string;   // HH:MM:SS label
  lat: number;   // avg latency ms
  rps: number;   // total throughput req/s
  err: number;   // error rate %
}

interface RightPanelProps {
  simStatus:        SimStatus;
  costData:         CostEstimateResponse | null;
  isCostLoading:    boolean;
  nodeCount:        number;
  lastRunId:        string | null;
  systemMetrics:    SystemMetrics | null;
  logs:             LogEntry[];
  onClearLogs:      () => void;
}

type Tab = "metrics" | "logs" | "cost";

export default function RightPanel({
  simStatus, costData, isCostLoading,
  nodeCount, lastRunId, systemMetrics, logs, onClearLogs,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("metrics");

  // ── Rolling chart history — accumulates during run, freezes on stop ──
  const [chartHistory, setChartHistory] = useState<ChartPoint[]>([]);
  const prevMetricsRef = useRef<SystemMetrics | null>(null);

  // Append a new point only when metrics actually change (i.e. during run)
  useEffect(() => {
    if (!systemMetrics) return;
    if (prevMetricsRef.current === systemMetrics) return; // same reference = no new tick
    prevMetricsRef.current = systemMetrics;

    // Only accumulate when simulation is running
    if (simStatus !== "running") return;

    const point: ChartPoint = {
      t:   new Date().toLocaleTimeString("en-GB"),
      lat: systemMetrics.avgLatency,
      rps: systemMetrics.totalThroughput,
      err: systemMetrics.errorRate,
    };
    setChartHistory((prev) => [...prev.slice(-29), point]); // keep last 30 points
  }, [systemMetrics, simStatus]);

  // Auto-switch to logs tab when sim starts; switch to metrics when stopped
  useEffect(() => {
    if (simStatus === "running") setActiveTab("logs");
    if (simStatus === "stopped") setActiveTab("metrics");
  }, [simStatus]);

  const hasData = systemMetrics !== null && (systemMetrics.totalThroughput > 0 || systemMetrics.avgLatency > 0);

  const tabs: { id: Tab; label: string }[] = [
    { id: "metrics", label: "Metrics" },
    { id: "logs",    label: `Logs${logs.length > 0 ? ` (${logs.length})` : ""}` },
    { id: "cost",    label: "Cost" },
  ];

  return (
    <aside style={{
      width: 270, minWidth: 270, display: "flex", flexDirection: "column",
      height: "100%", background: "var(--bg-surface)", borderLeft: "1px solid var(--bg-border)",
    }}>
      {/* ── Header ── */}
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--bg-border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
            Results
          </span>
          {/* Frozen badge shown after stop */}
          {simStatus === "stopped" && hasData && (
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 10, background: "rgba(248,113,113,0.12)", border: "1px solid #f8717140", color: "#f87171", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.05em" }}>
              FROZEN
            </span>
          )}
          {simStatus === "running" && (
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 10, background: "rgba(0,229,255,0.12)", border: "1px solid #00e5ff40", color: "#00e5ff", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.05em" }}>
              ● LIVE
            </span>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "var(--bg-elevated)", borderRadius: 8, padding: 2, gap: 2 }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "4px 2px", borderRadius: 6, fontSize: 10, fontWeight: 500,
              background: activeTab === tab.id ? "var(--bg-border)" : "transparent",
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
              border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Run ID */}
        {lastRunId && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: simStatus === "running" ? "#00e5ff" : "#f87171" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 9, fontFamily: "'JetBrains Mono',monospace", overflow: "hidden", textOverflow: "ellipsis" }}>
              {lastRunId}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {activeTab === "metrics" && (
          <MetricsPanel
            systemMetrics={systemMetrics}
            chartHistory={chartHistory}
            simStatus={simStatus}
            hasData={hasData}
          />
        )}
        {activeTab === "logs" && (
          <LogsPanel logs={logs} simStatus={simStatus} onClear={onClearLogs} />
        )}
        {activeTab === "cost" && (
          <CostPanel costData={costData} isLoading={isCostLoading} nodeCount={nodeCount} />
        )}
      </div>
    </aside>
  );
}

// ── METRICS PANEL ──────────────────────────────────────────────────────────
// Case 1: shows data when running OR stopped (as long as hasData)
// Case 3: graphs for latency + throughput + error rate, built from rolling history
function MetricsPanel({ systemMetrics, chartHistory, simStatus, hasData }: {
  systemMetrics: SystemMetrics | null;
  chartHistory:  ChartPoint[];
  simStatus:     SimStatus;
  hasData:       boolean;
}) {
  const isRunning = simStatus === "running";
  const isStopped = simStatus === "stopped";

  if (!hasData && simStatus === "idle") {
    return <EmptyState text="Start simulation to see metrics" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* ── Stat grid — always visible once data exists ── */}
      {systemMetrics && hasData && (
        <div style={{ borderRadius: 10, background: "var(--bg-elevated)", border: `1px solid ${isRunning ? "#00e5ff30" : "#f8717130"}`, padding: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: isRunning ? "#00e5ff" : "#f87171",
              animation: isRunning ? "rpPulse 1.4s ease infinite" : "none",
            }} />
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Syne',sans-serif" }}>
              {isRunning ? "Live System Metrics" : "Last Run Metrics"}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <StatCard label="Throughput" value={`${systemMetrics.totalThroughput}`} unit="r/s" color="#00e5ff" />
            <StatCard
              label="Avg Latency" value={`${systemMetrics.avgLatency}`} unit="ms"
              color={systemMetrics.avgLatency > 200 ? "#f87171" : systemMetrics.avgLatency > 100 ? "#fbbf24" : "#00c896"}
            />
            <StatCard
              label="Error Rate" value={`${systemMetrics.errorRate}`} unit="%"
              color={systemMetrics.errorRate > 10 ? "#f87171" : "#00c896"}
            />
            <StatCard
              label="Dropped" value={`${systemMetrics.droppedRequests}`} unit="req"
              color={systemMetrics.droppedRequests > 0 ? "#f87171" : "var(--text-muted)"}
            />
          </div>
        </div>
      )}

      {/* ── Latency over time graph ── */}
      {chartHistory.length > 1 ? (
        <ChartCard
          title="Latency"
          subtitle="avg ms · over time"
          frozen={isStopped}
        >
          <ResponsiveContainer width="100%" height={90}>
            <LineChart data={chartHistory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: "var(--text-muted)", fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 8, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip unitSuffix="ms" />} />
              <Line type="monotone" dataKey="lat" stroke="#4f8ef7" strokeWidth={2} dot={false} name="latency"
                strokeDasharray={isStopped ? "4 2" : undefined} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : hasData ? (
        <ChartCard title="Latency" subtitle="avg ms · over time" frozen={isStopped}>
          <WaitingForData running={isRunning} />
        </ChartCard>
      ) : null}

      {/* ── Throughput over time graph ── */}
      {chartHistory.length > 1 ? (
        <ChartCard title="Throughput" subtitle="req/s · over time" frozen={isStopped}>
          <ResponsiveContainer width="100%" height={75}>
            <AreaChart data={chartHistory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="rpTg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00e5ff" stopOpacity={isStopped ? 0.15 : 0.3} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: "var(--text-muted)", fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 8, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip unitSuffix="r/s" />} />
              <Area type="monotone" dataKey="rps" stroke="#00e5ff" strokeWidth={isStopped ? 1.5 : 2}
                fill="url(#rpTg)" name="req/s"
                strokeDasharray={isStopped ? "4 2" : undefined} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : hasData ? (
        <ChartCard title="Throughput" subtitle="req/s · over time" frozen={isStopped}>
          <WaitingForData running={isRunning} />
        </ChartCard>
      ) : null}

      {/* ── Error rate over time ── */}
      {chartHistory.length > 1 && (
        <ChartCard title="Error Rate" subtitle="% · over time" frozen={isStopped}>
          <ResponsiveContainer width="100%" height={65}>
            <AreaChart data={chartHistory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="rpEg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f87171" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: "var(--text-muted)", fontFamily: "'JetBrains Mono'" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 8, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip unitSuffix="%" />} />
              <Area type="monotone" dataKey="err" stroke="#f87171" strokeWidth={1.5}
                fill="url(#rpEg)" name="error%"
                strokeDasharray={isStopped ? "4 2" : undefined} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <style>{`@keyframes rpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}`}</style>
    </div>
  );
}

// ── LOGS PANEL ─────────────────────────────────────────────────────────────
// Case 1 fix: logs persist after stop — only "Start simulation to see logs" shown when idle+empty
function LogsPanel({ logs, simStatus, onClear }: {
  logs: LogEntry[]; simStatus: SimStatus; onClear: () => void;
}) {
  const isRunning = simStatus === "running";
  const isStopped = simStatus === "stopped";

  const levelColor: Record<string, string> = {
    success: "#00c896", info: "#4f8ef7", warn: "#fbbf24", error: "#f87171",
  };
  const levelBg: Record<string, string> = {
    success: "rgba(0,200,150,0.07)", info: "rgba(79,142,247,0.07)",
    warn: "rgba(251,191,36,0.07)",   error: "rgba(248,113,113,0.07)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isRunning && (
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e5ff", animation: "rpPulse2 1s ease infinite", display: "inline-block" }} />
          )}
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", fontFamily: "'Syne',sans-serif" }}>
            {isRunning ? "Live Events" : isStopped ? "Captured Events" : "Event Log"}
          </span>
          {logs.length > 0 && (
            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 10, background: "var(--bg-elevated)", color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>
              {logs.length}
            </span>
          )}
        </div>
        {logs.length > 0 && (
          <button onClick={onClear} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", color: "var(--text-muted)", cursor: "pointer" }}>
            Clear
          </button>
        )}
      </div>

      {/* Log list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {logs.length === 0 ? (
          <EmptyState text={isRunning ? "Waiting for events…" : "Start simulation to see logs"} />
        ) : (
          logs.map((log) => (
            <div key={log.id} style={{
              padding: "5px 8px", borderRadius: 7, fontSize: 10,
              background: levelBg[log.level] ?? "var(--bg-elevated)",
              border: `1px solid ${levelColor[log.level] ?? "var(--bg-border)"}20`,
              fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.5,
            }}>
              <span style={{ color: "var(--text-muted)", marginRight: 6, fontSize: 9 }}>{log.timestamp}</span>
              <span style={{ color: levelColor[log.level] ?? "var(--text-secondary)" }}>{log.message}</span>
            </div>
          ))
        )}
      </div>
      <style>{`@keyframes rpPulse2{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

// ── COST PANEL ─────────────────────────────────────────────────────────────
// Case 1: always shows last known cost after stop
function CostPanel({ costData, isLoading, nodeCount }: {
  costData: CostEstimateResponse | null; isLoading: boolean; nodeCount: number;
}) {
  if (nodeCount === 0) return <EmptyState text="Add nodes to estimate cost" />;
  if (isLoading)       return <Skeleton />;
  if (!costData)       return <EmptyState text="No cost data yet" />;

  const total = costData.total.amount;
  const segments = [
    { label: "Compute", amount: costData.compute.amount, color: "#4f8ef7" },
    { label: "Storage", amount: costData.storage.amount, color: "#9b7bea" },
    { label: "Network", amount: costData.network.amount, color: "#00e5ff" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ padding: 10, borderRadius: 10, background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }}>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 10 }}>
          Monthly Estimate
        </p>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: s.color + "20", border: `1px solid ${s.color}30`, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 11, color: "var(--text-secondary)" }}>{s.label}</span>
            <span style={{ fontSize: 11, color: "var(--text-primary)", fontFamily: "'JetBrains Mono',monospace" }}>${s.amount}</span>
          </div>
        ))}
        <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", gap: 1, marginBottom: 10 }}>
          {segments.map((s) => <div key={s.label} style={{ flex: s.amount, background: s.color, transition: "flex 0.5s" }} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--bg-border)" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>Est. Total</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#00e5ff", fontFamily: "'JetBrains Mono',monospace" }}>
            ${total}<span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 400 }}>/mo</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function StatCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div style={{ padding: "6px 8px", borderRadius: 8, background: "rgba(0,0,0,0.2)", border: `1px solid ${color}20` }}>
      <p style={{ fontSize: 8, color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>
        {value}<span style={{ fontSize: 8, fontWeight: 400, marginLeft: 2, color: "var(--text-muted)" }}>{unit}</span>
      </p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, frozen }: {
  title: string; subtitle: string; children: React.ReactNode; frozen?: boolean;
}) {
  return (
    <div style={{
      padding: 10, borderRadius: 10,
      background: "var(--bg-elevated)",
      border: `1px solid ${frozen ? "rgba(248,113,113,0.2)" : "var(--bg-border)"}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Syne',sans-serif" }}>{title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {frozen && <span style={{ fontSize: 8, color: "#f87171", fontFamily: "'JetBrains Mono',monospace" }}>frozen</span>}
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>{subtitle}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function ChartTip({ active, payload, label, unitSuffix }: {
  active?: boolean; payload?: Array<{name:string;value:number;color:string}>; label?: string; unitSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ padding: "6px 10px", borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>
      <p style={{ color: "var(--text-muted)", fontSize: 9, marginBottom: 4 }}>{label}</p>
      {payload.map((e) => (
        <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }} />
          <span style={{ color: "var(--text-secondary)" }}>{e.name}:</span>
          <span style={{ color: "var(--text-primary)" }}>{e.value}{unitSuffix ?? ""}</span>
        </div>
      ))}
    </div>
  );
}

function WaitingForData({ running }: { running: boolean }) {
  return (
    <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>
        {running ? "Collecting data…" : "No data yet"}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 8 }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity={0.25}>
        <rect x="2"  y="18" width="5" height="12" rx="1" fill="#00c896" />
        <rect x="10" y="12" width="5" height="18" rx="1" fill="#4f8ef7" />
        <rect x="18" y="6"  width="5" height="24" rx="1" fill="#00e5ff" />
        <rect x="26" y="2"  width="4" height="28" rx="1" fill="#00e5ff" opacity="0.5" />
      </svg>
      <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>{text}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[80, 60, 70].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 10, background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }} />
      ))}
    </div>
  );
}
