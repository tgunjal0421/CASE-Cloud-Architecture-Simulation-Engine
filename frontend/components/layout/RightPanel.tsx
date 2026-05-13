"use client";
// components/layout/RightPanel.tsx
// Non-blocking monitoring sidebar — pushes canvas, does NOT overlay it.
// Layout: header → 3-tab area (Metrics/Logs/Cost) → always-visible Scenario controls.
// No backdrop. Canvas stays fully interactive while panel is open.

import React, { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { CostEstimateResponse } from "@/lib/api";
import { SystemMetrics, LogEntry } from "@/lib/simulationEngine";
import { SimStatus } from "@/lib/useSimulation";
import { SCENARIO_PRESETS } from "@/lib/mockData";

interface ChartPoint { t: string; lat: number; rps: number; err: number; }

interface RightPanelProps {
  isOpen:            boolean;
  onClose:           () => void;
  simStatus:         SimStatus;
  costData:          CostEstimateResponse | null;
  isCostLoading:     boolean;
  nodeCount:         number;
  lastRunId:         string | null;
  systemMetrics:     SystemMetrics | null;
  logs:              LogEntry[];
  onClearLogs:       () => void;
  trafficMultiplier: number;
  failureMode:       boolean;
  activePresetId:    string | null;
  onPresetSelect:    (id: string) => void;
  onTrafficChange:   (v: number) => void;
  onFailureToggle:   (v: boolean) => void;
}

type Tab = "metrics" | "logs" | "cost";

export default function RightPanel({
  isOpen, onClose, simStatus, costData, isCostLoading,
  nodeCount, lastRunId, systemMetrics, logs, onClearLogs,
  trafficMultiplier, failureMode, activePresetId, onPresetSelect,
  onTrafficChange, onFailureToggle,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("metrics");
  const [chartHistory, setChartHistory] = useState<ChartPoint[]>([]);
  const prevRef = useRef<SystemMetrics | null>(null);

  useEffect(() => {
    if (!systemMetrics || prevRef.current === systemMetrics) return;
    prevRef.current = systemMetrics;
    if (simStatus !== "running") return;
    setChartHistory((prev) => [...prev.slice(-29), {
      t: new Date().toLocaleTimeString("en-GB"),
      lat: systemMetrics.avgLatency,
      rps: systemMetrics.totalThroughput,
      err: systemMetrics.errorRate,
    }]);
  }, [systemMetrics, simStatus]);

  useEffect(() => {
    if (simStatus === "running") setActiveTab("logs");
    if (simStatus === "stopped") setActiveTab("metrics");
  }, [simStatus]);

  const isRunning = simStatus === "running";
  const isStopped = simStatus === "stopped";
  const hasData = !!systemMetrics && (systemMetrics.totalThroughput > 0 || systemMetrics.avgLatency > 0);

  const tabs: { id: Tab; label: string }[] = [
    { id: "metrics", label: "Metrics" },
    { id: "logs",    label: `Logs${logs.length > 0 ? ` ·${logs.length}` : ""}` },
    { id: "cost",    label: "Cost" },
  ];

  const paneW = 340;

  return (
    <div style={{
      width: isOpen ? paneW : 0,
      minWidth: isOpen ? paneW : 0,
      flexShrink: 0,
      transition: "width 0.22s cubic-bezier(0.16,1,0.3,1), min-width 0.22s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Inner panel — fixed width inside the flex slot */}
      <div style={{
        width: paneW, height: "100%",
        display: "flex", flexDirection: "column",
        background: "var(--bg-surface)",
        borderLeft: "1px solid var(--bg-border)",
        overflow: "hidden",
      }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 12px", height: 36, flexShrink: 0,
          borderBottom: "1px solid var(--bg-border)",
          background: "var(--bg-elevated)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="eng-label">Monitor</span>
            {isRunning && <LiveBadge />}
            {isStopped && hasData && <FrozenBadge />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {lastRunId && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: "0.03em" }}>
                {lastRunId.slice(-12)}
              </span>
            )}
            <button onClick={onClose} style={{
              width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
              borderRadius: 3, fontSize: 12, lineHeight: 1, transition: "background 0.1s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-border)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
            >✕</button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex", flexShrink: 0,
          borderBottom: "1px solid var(--bg-border)",
          background: "var(--bg-surface)",
        }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "6px 4px",
              fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 500,
              letterSpacing: "0.08em", textTransform: "uppercase",
              background: "none", border: "none", cursor: "pointer",
              color: activeTab === tab.id ? "var(--brand-cyan)" : "var(--text-muted)",
              borderBottom: `2px solid ${activeTab === tab.id ? "var(--brand-cyan)" : "transparent"}`,
              marginBottom: -1, transition: "color 0.12s, border-color 0.12s",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── Tab content — scrollable, flex-grows to fill space above scenario strip ── */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {activeTab === "metrics" && (
            <MetricsPanel
              systemMetrics={systemMetrics} chartHistory={chartHistory}
              simStatus={simStatus} hasData={hasData}
            />
          )}
          {activeTab === "logs" && (
            <LogsPanel logs={logs} simStatus={simStatus} onClear={onClearLogs} />
          )}
          {activeTab === "cost" && (
            <CostPanel costData={costData} isLoading={isCostLoading} nodeCount={nodeCount} />
          )}
        </div>

        {/* ── Always-visible Scenario Controls strip ── */}
        <ScenarioStrip
          simStatus={simStatus}
          trafficMultiplier={trafficMultiplier}
          failureMode={failureMode}
          activePresetId={activePresetId}
          onPresetSelect={onPresetSelect}
          onTrafficChange={onTrafficChange}
          onFailureToggle={onFailureToggle}
        />
      </div>
    </div>
  );
}

// ── SCENARIO STRIP (always visible at bottom) ─────────────────────────────
function ScenarioStrip({
  simStatus, trafficMultiplier, failureMode,
  activePresetId, onPresetSelect, onTrafficChange, onFailureToggle,
}: {
  simStatus: SimStatus; trafficMultiplier: number; failureMode: boolean;
  activePresetId: string | null;
  onPresetSelect: (id: string) => void;
  onTrafficChange: (v: number) => void;
  onFailureToggle: (v: boolean) => void;
}) {
  const isRunning = simStatus === "running";
  const pct = ((trafficMultiplier - 1) / 9) * 100;
  const trafficColor =
    trafficMultiplier <= 2 ? "var(--brand-green)"
    : trafficMultiplier <= 5 ? "var(--brand-blue)"
    : trafficMultiplier <= 8 ? "var(--brand-violet)"
    : "var(--brand-red)";

  const trafficLabel =
    trafficMultiplier <= 2 ? "Low"
    : trafficMultiplier <= 5 ? "Moderate"
    : trafficMultiplier <= 8 ? "High"
    : "Extreme";

  return (
    <div style={{
      flexShrink: 0,
      borderTop: "1px solid var(--bg-border)",
      background: "var(--bg-elevated)",
    }}>
      {/* Section label */}
      <div style={{
        padding: "6px 12px 4px",
        borderBottom: "1px solid var(--bg-border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span className="eng-label">Scenarios</span>
        {isRunning && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--brand-cyan)",
            letterSpacing: "0.06em",
          }}>live · changes apply instantly</span>
        )}
      </div>

      {/* Preset buttons — compact row */}
      <div style={{
        display: "flex", gap: 4, padding: "6px 10px",
        borderBottom: "1px solid var(--bg-border)",
      }}>
        {SCENARIO_PRESETS.map((p) => {
          const active = activePresetId === p.id;
          return (
            <button key={p.id} onClick={() => onPresetSelect(p.id)} style={{
              flex: 1, padding: "4px 2px",
              fontFamily: "var(--font-mono)", fontSize: 8,
              letterSpacing: "0.04em", textTransform: "uppercase",
              borderRadius: 3, border: `1px solid ${active ? "var(--brand-cyan)" : "var(--bg-border)"}`,
              background: active ? "rgba(3,105,161,0.1)" : "var(--bg-surface)",
              color: active ? "var(--brand-cyan)" : "var(--text-muted)",
              cursor: "pointer", transition: "all 0.12s",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {p.label.replace(" Traffic", "").replace("Chaos Test", "Chaos")}
            </button>
          );
        })}
      </div>

      {/* Traffic slider row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px", borderBottom: "1px solid var(--bg-border)",
      }}>
        <span className="eng-label" style={{ flexShrink: 0 }}>Traffic</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", flexShrink: 0 }}>1×</span>
        <input type="range" min={1} max={10} step={1}
          value={trafficMultiplier}
          onChange={(e) => onTrafficChange(Number(e.target.value))}
          style={{
            flex: 1, height: 3, cursor: "pointer", borderRadius: 2, outline: "none",
            background: `linear-gradient(to right, ${trafficColor} ${pct}%, var(--bg-border) ${pct}%)`,
          }}
        />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", flexShrink: 0 }}>10×</span>
        {/* Value chip */}
        <div style={{
          display: "flex", alignItems: "center", gap: 3, flexShrink: 0,
          padding: "2px 6px", borderRadius: 3,
          background: `rgba(3,105,161,0.06)`,
          border: `1px solid ${trafficColor}40`,
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, color: trafficColor }}>
            ×{trafficMultiplier}
          </span>
          {isRunning && (
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: trafficColor,
              animation: "pulseDot 1s ease infinite" }} />
          )}
        </div>
      </div>

      {/* Chaos row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 10px 8px",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span className="eng-label">Chaos Mode</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)" }}>
            Random failure injection
          </span>
        </div>
        <button onClick={() => onFailureToggle(!failureMode)} style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 9px", borderRadius: 3,
          background: failureMode ? "rgba(220,38,38,0.08)" : "var(--bg-surface)",
          border: `1px solid ${failureMode ? "rgba(220,38,38,0.3)" : "var(--bg-border)"}`,
          color: failureMode ? "var(--brand-red)" : "var(--text-muted)",
          cursor: "pointer", fontFamily: "var(--font-mono)",
          fontSize: 9, letterSpacing: "0.05em", textTransform: "uppercase",
          transition: "all 0.15s",
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: failureMode ? "var(--brand-red)" : "var(--text-muted)",
            flexShrink: 0,
          }} />
          {failureMode ? "On" : "Off"}
        </button>
      </div>
    </div>
  );
}

// ── METRICS ────────────────────────────────────────────────────────────────
function MetricsPanel({ systemMetrics, chartHistory, simStatus, hasData }: {
  systemMetrics: SystemMetrics | null; chartHistory: ChartPoint[];
  simStatus: SimStatus; hasData: boolean;
}) {
  const isRunning = simStatus === "running";
  const isStopped = simStatus === "stopped";
  if (!hasData && simStatus === "idle") return <Empty text="Run simulation to see metrics" />;

  return (
    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 8 }}>

      {/* Stat row */}
      {systemMetrics && hasData && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4,
          padding: "6px 0",
          borderBottom: "1px solid var(--bg-border)",
        }}>
          <MiniStat label="RPS"     value={systemMetrics.totalThroughput} unit=""   color="var(--brand-cyan)" />
          <MiniStat label="Lat"     value={systemMetrics.avgLatency}      unit="ms"
            color={systemMetrics.avgLatency > 200 ? "var(--brand-red)" : systemMetrics.avgLatency > 100 ? "var(--brand-amber)" : "var(--brand-green)"} />
          <MiniStat label="Err"     value={systemMetrics.errorRate}       unit="%"
            color={systemMetrics.errorRate > 10 ? "var(--brand-red)" : "var(--brand-green)"} />
          <MiniStat label="Drop"    value={systemMetrics.droppedRequests} unit=""
            color={systemMetrics.droppedRequests > 0 ? "var(--brand-red)" : "var(--text-muted)"} />
        </div>
      )}

      {/* Latency graph */}
      {chartHistory.length > 1 ? (
        <GraphCard label="Latency (ms)" frozen={isStopped}>
          <ResponsiveContainer width="100%" height={68}>
            <LineChart data={chartHistory} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
              <XAxis dataKey="t" tick={tick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={tick} tickLine={false} axisLine={false} />
              <Tooltip content={<CTip unit="ms" />} />
              <Line type="monotone" dataKey="lat" stroke="var(--brand-blue)" strokeWidth={1.5}
                dot={false} strokeDasharray={isStopped ? "4 3" : undefined} />
            </LineChart>
          </ResponsiveContainer>
        </GraphCard>
      ) : hasData ? (
        <GraphCard label="Latency (ms)" frozen={false}><Collecting running={isRunning} /></GraphCard>
      ) : null}

      {/* Throughput graph */}
      {chartHistory.length > 1 ? (
        <GraphCard label="Throughput (r/s)" frozen={isStopped}>
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={chartHistory} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="rpTp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--brand-cyan)" stopOpacity={isStopped ? 0.1 : 0.2} />
                  <stop offset="95%" stopColor="var(--brand-cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={tick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={tick} tickLine={false} axisLine={false} />
              <Tooltip content={<CTip unit="r/s" />} />
              <Area type="monotone" dataKey="rps" stroke="var(--brand-cyan)" strokeWidth={1.5}
                fill="url(#rpTp)" strokeDasharray={isStopped ? "4 3" : undefined} />
            </AreaChart>
          </ResponsiveContainer>
        </GraphCard>
      ) : hasData ? (
        <GraphCard label="Throughput (r/s)" frozen={false}><Collecting running={isRunning} /></GraphCard>
      ) : null}

      {/* Error rate graph */}
      {chartHistory.length > 1 && (
        <GraphCard label="Error Rate (%)" frozen={isStopped}>
          <ResponsiveContainer width="100%" height={54}>
            <AreaChart data={chartHistory} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="rpEr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--brand-red)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="var(--brand-red)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={tick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={tick} tickLine={false} axisLine={false} />
              <Tooltip content={<CTip unit="%" />} />
              <Area type="monotone" dataKey="err" stroke="var(--brand-red)" strokeWidth={1.5}
                fill="url(#rpEr)" strokeDasharray={isStopped ? "4 3" : undefined} />
            </AreaChart>
          </ResponsiveContainer>
        </GraphCard>
      )}
    </div>
  );
}

// ── LOGS ───────────────────────────────────────────────────────────────────
function LogsPanel({ logs, simStatus, onClear }: {
  logs: LogEntry[]; simStatus: SimStatus; onClear: () => void;
}) {
  const isRunning = simStatus === "running";

  const cfg: Record<string, { color: string; bg: string; icon: string }> = {
    success: { color: "var(--brand-green)",  bg: "rgba(4,120,87,0.04)",    icon: "✓" },
    info:    { color: "var(--brand-blue)",   bg: "rgba(37,99,235,0.04)",   icon: "·" },
    warn:    { color: "var(--brand-amber)",  bg: "rgba(180,83,9,0.05)",    icon: "!" },
    error:   { color: "var(--brand-red)",    bg: "rgba(220,38,38,0.05)",   icon: "✕" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Log header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "5px 10px", borderBottom: "1px solid var(--bg-border)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isRunning && (
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--brand-cyan)",
              display: "inline-block", animation: "pulseDot 1s ease infinite" }} />
          )}
          <span className="eng-label">
            {isRunning ? "Live" : simStatus === "stopped" ? "Captured" : "Events"}
          </span>
          {logs.length > 0 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>
              {logs.length}
            </span>
          )}
        </div>
        {logs.length > 0 && (
          <button onClick={onClear} style={{
            fontFamily: "var(--font-mono)", fontSize: 8,
            padding: "1px 6px", borderRadius: 3,
            background: "none", border: "1px solid var(--bg-border)",
            color: "var(--text-muted)", cursor: "pointer", letterSpacing: "0.05em",
          }}>Clear</button>
        )}
      </div>

      {/* Dense scrollable log list */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {logs.length === 0 ? (
          <Empty text={isRunning ? "Waiting for events…" : "Start simulation to see logs"} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {logs.map((log) => {
              const s = cfg[log.level] ?? cfg.info;
              return (
                <div key={log.id} style={{
                  display: "flex", alignItems: "baseline", gap: 0,
                  padding: "3px 10px",
                  background: s.bg,
                  borderBottom: "1px solid rgba(0,0,0,0.03)",
                  fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: 1.5,
                }}>
                  {/* Icon */}
                  <span style={{ color: s.color, width: 14, flexShrink: 0, fontSize: 9 }}>{s.icon}</span>
                  {/* Timestamp */}
                  <span style={{ color: "var(--text-muted)", fontSize: 9, marginRight: 6, flexShrink: 0, letterSpacing: "0.01em" }}>
                    {log.timestamp}
                  </span>
                  {/* Message */}
                  <span style={{ color: s.color, fontSize: 9, wordBreak: "break-all", lineHeight: 1.4 }}>
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── COST ───────────────────────────────────────────────────────────────────
function CostPanel({ costData, isLoading, nodeCount }: {
  costData: CostEstimateResponse | null; isLoading: boolean; nodeCount: number;
}) {
  if (nodeCount === 0) return <Empty text="Add nodes to estimate cost" />;
  if (isLoading)       return <Loading />;
  if (!costData)       return <Empty text="No cost data" />;

  const total = costData.total.amount;
  const rows = [
    { label: "Compute", amount: costData.compute.amount, color: "var(--brand-blue)" },
    { label: "Storage", amount: costData.storage.amount, color: "var(--brand-violet)" },
    { label: "Network", amount: costData.network.amount, color: "var(--brand-cyan)" },
  ];

  return (
    <div style={{ padding: "10px" }}>
      <div style={{ padding: "8px 10px", background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: 4 }}>
        <div className="eng-label" style={{ marginBottom: 8 }}>Monthly Estimate</div>
        {rows.map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <div style={{ width: 2, height: 12, borderRadius: 1, background: r.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-secondary)" }}>{r.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-primary)" }}>${r.amount}</span>
          </div>
        ))}
        <div style={{ display: "flex", height: 3, borderRadius: 2, overflow: "hidden", marginTop: 8, marginBottom: 10, gap: 1 }}>
          {rows.map((r) => <div key={r.label} style={{ flex: r.amount, background: r.color }} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--bg-border)" }}>
          <span className="eng-label">Total</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--brand-cyan)" }}>
            ${total}<span style={{ fontSize: 8, color: "var(--text-muted)", fontWeight: 400 }}>/mo</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────
const tick = { fontSize: 8, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" } as const;

function MiniStat({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 2,
      padding: "4px 5px", background: "var(--bg-elevated)",
      border: "1px solid var(--bg-border)", borderRadius: 3, minWidth: 0,
    }}>
      <span className="eng-label">{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 7, fontWeight: 400, color: "var(--text-muted)", marginLeft: 1 }}>{unit}</span>
      </span>
    </div>
  );
}

function GraphCard({ label, frozen, children }: { label: string; frozen: boolean; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--bg-border)", borderRadius: 3, padding: "6px 6px 4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="eng-label">{label}</span>
        {frozen && <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--brand-red)", letterSpacing: "0.06em" }}>FROZEN</span>}
      </div>
      {children}
    </div>
  );
}

function CTip({ active, payload, label, unit }: {
  active?: boolean; payload?: Array<{name:string;value:number;color:string}>; label?: string; unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ padding: "4px 7px", borderRadius: 3, background: "var(--bg-surface)", border: "1px solid var(--bg-border)", fontFamily: "var(--font-mono)", fontSize: 9 }}>
      <div style={{ color: "var(--text-muted)", fontSize: 8, marginBottom: 2 }}>{label}</div>
      {payload.map((e) => (
        <div key={e.name} style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: e.color }} />
          <span style={{ color: "var(--text-primary)" }}>{e.value}{unit ?? ""}</span>
        </div>
      ))}
    </div>
  );
}

function Collecting({ running }: { running: boolean }) {
  return (
    <div style={{ height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>
        {running ? "Collecting data…" : "No data"}
      </span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>{text}</p>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: 5 }}>
      {[50, 40, 35].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 3, background: "var(--bg-elevated)", border: "1px solid var(--bg-border)" }} />
      ))}
    </div>
  );
}

function LiveBadge() {
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 8, padding: "1px 5px", borderRadius: 3,
      background: "rgba(3,105,161,0.1)", border: "1px solid rgba(3,105,161,0.25)",
      color: "var(--brand-cyan)", letterSpacing: "0.08em", textTransform: "uppercase",
    }}>● Live</span>
  );
}

function FrozenBadge() {
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 8, padding: "1px 5px", borderRadius: 3,
      background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)",
      color: "var(--brand-red)", letterSpacing: "0.08em", textTransform: "uppercase",
    }}>Frozen</span>
  );
}
