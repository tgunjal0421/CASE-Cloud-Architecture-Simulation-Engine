// lib/api.ts
// Placeholder API functions. Each function mirrors the expected real endpoint.
// Replace the mock delay + return value with actual fetch() calls when backend is ready.
//
// Convention:
//   - All functions return Promises (async-ready)
//   - Errors are thrown so callers can catch them
//   - Shape of returned data should match backend contract

import {
  MOCK_LATENCY_DATA,
  MOCK_THROUGHPUT_DATA,
  MOCK_RESOURCE_DATA,
  MOCK_COST_DATA,
} from "./mockData";

// Simulated network delay (ms) — remove in production
const MOCK_DELAY = 800;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ── Types ──────────────────────────────────────────────────────────────────

export interface SimulationConfig {
  nodes: unknown[];          // React Flow node objects
  edges: unknown[];          // React Flow edge objects
  trafficMultiplier: number; // 1–10
  failureMode: boolean;
}

export interface SimulationResult {
  status: "success" | "error";
  runId: string;
  durationMs: number;
  summary: string;
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

// ── API Functions ──────────────────────────────────────────────────────────

/**
 * POST /api/simulation/run
 * Triggers a simulation run on the backend.
 * Returns a run ID and summary once complete.
 */
export async function runSimulation(
  config: SimulationConfig
): Promise<SimulationResult> {
  await delay(MOCK_DELAY);
  console.info("[API] runSimulation called with config:", config);

  // TODO: Replace with real call:
  // const res = await fetch('/api/simulation/run', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(config),
  // });
  // return res.json();

  return {
    status: "success",
    runId: `run_${Date.now()}`,
    durationMs: 1200,
    summary: `Simulation complete — ${config.nodes.length} nodes, traffic ×${config.trafficMultiplier}`,
  };
}

/**
 * POST /api/architecture/save
 * Persists the current architecture to the backend (PostgreSQL via FastAPI).
 */
export async function saveArchitecture(
  payload: ArchitectureSavePayload
): Promise<{ id: string; savedAt: string }> {
  await delay(MOCK_DELAY / 2);
  console.info("[API] saveArchitecture called:", payload.name);

  // TODO: Replace with real call:
  // const res = await fetch('/api/architecture/save', { method: 'POST', ... });

  return {
    id: `arch_${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
}

/**
 * GET /api/metrics/latest
 * Fetches the most recent simulation metrics.
 * Used to populate the right panel analytics charts.
 */
export async function fetchMetrics(): Promise<MetricsResponse> {
  await delay(MOCK_DELAY);
  console.info("[API] fetchMetrics called");

  // TODO: Replace with real call:
  // const res = await fetch('/api/metrics/latest');
  // return res.json();

  return {
    latency: MOCK_LATENCY_DATA,
    throughput: MOCK_THROUGHPUT_DATA,
    resources: MOCK_RESOURCE_DATA,
  };
}

/**
 * GET /api/cost/estimate
 * Returns cost estimate for the current architecture configuration.
 */
export async function fetchCostEstimate(nodeCount: number): Promise<CostEstimateResponse> {
  await delay(MOCK_DELAY / 2);
  console.info("[API] fetchCostEstimate called, nodeCount:", nodeCount);

  // Scale mock costs loosely by node count
  const multiplier = Math.max(1, nodeCount * 0.4);

  return {
    compute: { ...MOCK_COST_DATA.compute, amount: +(MOCK_COST_DATA.compute.amount * multiplier).toFixed(2) },
    storage: { ...MOCK_COST_DATA.storage, amount: +(MOCK_COST_DATA.storage.amount * multiplier).toFixed(2) },
    network: { ...MOCK_COST_DATA.network, amount: +(MOCK_COST_DATA.network.amount * multiplier).toFixed(2) },
    total: {
      ...MOCK_COST_DATA.total,
      amount: +(
        (MOCK_COST_DATA.compute.amount + MOCK_COST_DATA.storage.amount + MOCK_COST_DATA.network.amount) *
        multiplier
      ).toFixed(2),
    },
  };
}

/**
 * DELETE /api/architecture/:id
 * Resets / clears the current architecture from the backend session.
 */
export async function resetArchitecture(): Promise<{ ok: boolean }> {
  await delay(200);
  console.info("[API] resetArchitecture called");
  return { ok: true };
}
