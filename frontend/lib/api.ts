// lib/api.ts
// Backend integration layer for simulation + dashboard API calls.

import {
  MOCK_LATENCY_DATA,
  MOCK_THROUGHPUT_DATA,
  MOCK_RESOURCE_DATA,
  MOCK_COST_DATA,
} from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface SimulationConfig {
  nodes: unknown[];
  edges: unknown[];
  trafficMultiplier: number;
  failureMode: boolean;
  failedNodes?: string[];
}

export interface StartSimulationResult {
  status: "running";
  runId: string;
}

export interface ArchitectureSavePayload {
  name: string;
  nodes: unknown[];
  edges: unknown[];
}

export interface MetricsResponse {
  latency: typeof MOCK_LATENCY_DATA;
  throughput: typeof MOCK_THROUGHPUT_DATA;
  resources: typeof MOCK_RESOURCE_DATA;
}

export interface CostEstimateResponse {
  compute: { label: string; amount: number; unit: string };
  storage: { label: string; amount: number; unit: string };
  network: { label: string; amount: number; unit: string };
  total: { label: string; amount: number; unit: string };
}

export interface NodeMetrics {
  nodeId: string;
  throughput: number;
  latency: number;
  errorRate: number;
  isFailed: boolean;
  isOverloaded: boolean;
}

export interface SystemMetrics {
  totalThroughput: number;
  avgLatency: number;
  errorRate: number;
  activeRequests: number;
  droppedRequests: number;
}

export type LogLevel = "info" | "success" | "warn" | "error";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  requestId: number | null;
  message: string;
}

export interface SimulationState {
  nodeMetrics: Record<string, NodeMetrics>;
  systemMetrics: SystemMetrics;
  logs: LogEntry[];
  activeEdges: Set<string>;
}

export interface RunSnapshot {
  runId: string;
  status: "running" | "stopped";
  updatedAt: number;
  config: {
    traffic: number;
    chaos: boolean;
    failedNodes: string[];
  };
  state: SimulationState;
}

type BackendNode = { id: string; type: string; label: string };
type BackendEdge = { id: string; source: string; target: string };

function toBackendNode(node: any): BackendNode {
  return {
    id: String(node.id),
    type: String(node.data?.type ?? node.type ?? "default"),
    label: String(node.data?.label ?? node.id),
  };
}

function toBackendEdge(edge: any, idx: number): BackendEdge {
  return {
    id: String(edge.id ?? `edge-${idx}`),
    source: String(edge.source),
    target: String(edge.target),
  };
}

function fromBackendSnapshot(raw: any): RunSnapshot {
  const logs: LogEntry[] = (raw.state?.logs ?? []).map((l: any) => ({
    id: String(l.id),
    timestamp: String(l.timestamp),
    level: l.level as LogLevel,
    requestId: l.request_id === undefined ? null : l.request_id,
    message: String(l.message),
  }));

  return {
    runId: String(raw.run_id),
    status: raw.status,
    updatedAt: Number(raw.updated_at ?? Date.now()),
    config: {
      traffic: Number(raw.config?.traffic ?? 1),
      chaos: Boolean(raw.config?.chaos),
      failedNodes: raw.config?.failed_nodes ?? [],
    },
    state: {
      nodeMetrics: raw.state?.node_metrics ?? {},
      systemMetrics: raw.state?.system_metrics ?? {
        totalThroughput: 0,
        avgLatency: 0,
        errorRate: 0,
        activeRequests: 0,
        droppedRequests: 0,
      },
      logs,
      activeEdges: new Set<string>(raw.state?.active_edges ?? []),
    },
  };
}

export async function startSimulation(config: SimulationConfig): Promise<StartSimulationResult> {
  const payload = {
    nodes: (config.nodes ?? []).map(toBackendNode),
    edges: (config.edges ?? []).map(toBackendEdge),
    traffic: config.trafficMultiplier,
    chaos: config.failureMode,
    failed_nodes: config.failedNodes ?? [],
  };
  const res = await apiFetch<{ run_id: string; status: "running" }>("/simulate/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { runId: res.run_id, status: res.status };
}

export async function fetchRunSnapshot(runId: string): Promise<RunSnapshot> {
  const raw = await apiFetch<any>(`/simulate/${runId}`);
  return fromBackendSnapshot(raw);
}

export async function stopSimulation(runId: string): Promise<{ runId: string; status: "stopped" }> {
  const res = await apiFetch<{ run_id: string; status: "stopped" }>(`/simulate/${runId}/stop`, { method: "POST" });
  return { runId: res.run_id, status: res.status };
}

export async function toggleRunFailure(runId: string, nodeId: string): Promise<{ failedNodes: string[] }> {
  const res = await apiFetch<{ failed_nodes: string[] }>(`/simulate/${runId}/toggle-failure`, {
    method: "POST",
    body: JSON.stringify({ node_id: nodeId }),
  });
  return { failedNodes: res.failed_nodes };
}

export async function saveArchitecture(payload: ArchitectureSavePayload): Promise<{ id: string; savedAt: string }> {
  console.info("[API] saveArchitecture called:", payload.name);
  return { id: `arch_${Date.now()}`, savedAt: new Date().toISOString() };
}

export async function fetchMetrics(): Promise<MetricsResponse> {
  return { latency: MOCK_LATENCY_DATA, throughput: MOCK_THROUGHPUT_DATA, resources: MOCK_RESOURCE_DATA };
}

export async function fetchCostEstimate(nodeCount: number): Promise<CostEstimateResponse> {
  const multiplier = Math.max(1, nodeCount * 0.4);
  return {
    compute: { ...MOCK_COST_DATA.compute, amount: +(MOCK_COST_DATA.compute.amount * multiplier).toFixed(2) },
    storage: { ...MOCK_COST_DATA.storage, amount: +(MOCK_COST_DATA.storage.amount * multiplier).toFixed(2) },
    network: { ...MOCK_COST_DATA.network, amount: +(MOCK_COST_DATA.network.amount * multiplier).toFixed(2) },
    total: { ...MOCK_COST_DATA.total, amount: +((MOCK_COST_DATA.compute.amount + MOCK_COST_DATA.storage.amount + MOCK_COST_DATA.network.amount) * multiplier).toFixed(2) },
  };
}

export async function resetArchitecture(): Promise<{ ok: boolean }> {
  return { ok: true };
}
