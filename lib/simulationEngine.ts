// lib/simulationEngine.ts
// Pure frontend simulation engine — no backend needed.
// Runs a tick loop every interval, generates requests that flow node-by-node,
// produces per-node metrics and structured log events.
// All logic is deterministic and replaceable by real backend data later.

import { Node, Edge } from "reactflow";
import { CaseNodeData } from "@/components/builder/CustomNode";

// ── Types ──────────────────────────────────────────────────────────────────

export interface NodeMetrics {
  nodeId:     string;
  throughput: number;   // req/s
  latency:    number;   // ms
  errorRate:  number;   // 0–1
  isFailed:   boolean;
  isOverloaded: boolean;
}

export interface SystemMetrics {
  totalThroughput: number;
  avgLatency:      number;
  errorRate:       number;
  activeRequests:  number;
  droppedRequests: number;
}

export type LogLevel = "info" | "success" | "warn" | "error";

export interface LogEntry {
  id:        string;
  timestamp: string;
  level:     LogLevel;
  requestId: number | null;
  message:   string;
}

export interface SimulationState {
  nodeMetrics:   Record<string, NodeMetrics>;
  systemMetrics: SystemMetrics;
  logs:          LogEntry[];
  activeEdges:   Set<string>;   // edge IDs currently carrying traffic
}

// ── Helpers ────────────────────────────────────────────────────────────────

let _requestCounter = 100;
const nextReqId = () => ++_requestCounter;

function timestamp(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

function mkLog(level: LogLevel, message: string, requestId: number | null = null): LogEntry {
  return { id: `log-${Date.now()}-${Math.random()}`, timestamp: timestamp(), level, requestId, message };
}

// Base latency per node type (ms)
const BASE_LATENCY: Record<string, number> = {
  loadbalancer: 5,   apigateway: 8,   vm: 20,   container: 15,
  serverless: 30,    database: 45,    mysql: 50, postgresql: 48,
  oracle: 55,        redis: 3,        cache: 3,  queue: 10,
  kafka: 8,          storage: 25,     cdn: 12,   default: 20,
};

function baseLatency(type: string): number {
  return BASE_LATENCY[type] ?? BASE_LATENCY.default;
}

// ── Build adjacency list from edges ──
function buildGraph(edges: Edge[]): Record<string, string[]> {
  const graph: Record<string, string[]> = {};
  for (const e of edges) {
    if (!graph[e.source]) graph[e.source] = [];
    graph[e.source].push(e.target);
  }
  return graph;
}

// Find root nodes (nodes with no incoming edges)
function findRoots(nodes: Node[], edges: Edge[]): string[] {
  const hasIncoming = new Set(edges.map((e) => e.target));
  const roots = nodes.filter((n) => !hasIncoming.has(n.id)).map((n) => n.id);
  return roots.length > 0 ? roots : nodes.slice(0, 1).map((n) => n.id);
}

// Find edge ID between two nodes
function edgeBetween(edges: Edge[], src: string, tgt: string): string | undefined {
  return edges.find((e) => e.source === src && e.target === tgt)?.id;
}

// ── Main simulation tick ───────────────────────────────────────────────────
// Called by the interval in the hook below.
// Returns the new SimulationState (immutable update pattern).

export function runTick(
  prev: SimulationState,
  nodes: Node<CaseNodeData>[],
  edges: Edge[],
  trafficMultiplier: number,
  failureMode: boolean,
  failedNodes: Set<string>,
): SimulationState {
  if (nodes.length === 0) return prev;

  const graph   = buildGraph(edges);
  const roots   = findRoots(nodes, edges);
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Start with copies of previous metrics
  const nodeMetrics: Record<string, NodeMetrics> = {};
  for (const n of nodes) {
    nodeMetrics[n.id] = {
      nodeId:      n.id,
      throughput:  prev.nodeMetrics[n.id]?.throughput ?? 0,
      latency:     prev.nodeMetrics[n.id]?.latency    ?? 0,
      errorRate:   prev.nodeMetrics[n.id]?.errorRate  ?? 0,
      isFailed:    failedNodes.has(n.id),
      isOverloaded: false,
    };
  }

  const newLogs: LogEntry[] = [];
  const activeEdges = new Set<string>();

  // How many requests to simulate this tick
  const reqCount = Math.max(1, Math.round(trafficMultiplier * 1.5));

  let totalLatency  = 0;
  let completedReqs = 0;
  let droppedReqs   = prev.systemMetrics.droppedRequests;

  for (let i = 0; i < reqCount; i++) {
    const reqId   = nextReqId();
    const root    = roots[i % roots.length];
    let   current = root;
    let   totalReqLatency = 0;
    let   dropped = false;
    const path: string[] = [];

    // Walk the graph from root following edges
    const visited = new Set<string>();
    while (current && !visited.has(current)) {
      visited.add(current);
      const node = nodeMap[current];
      if (!node) break;

      const isFailed = failedNodes.has(current);

      if (isFailed) {
        newLogs.push(mkLog("error",
          `Request ${reqId} DROPPED — ${node.data.label} is FAILED`, reqId));
        droppedReqs++;
        dropped = true;
        nodeMetrics[current].errorRate = Math.min(1,
          (nodeMetrics[current].errorRate + 0.15));
        break;
      }

      path.push(node.data.label);

      // Compute node latency — higher traffic = more latency
      const base    = baseLatency(node.data.type);
      const jitter  = (Math.random() - 0.5) * base * 0.4;
      const load    = trafficMultiplier / 10;
      const latency = Math.round(base * (1 + load * 1.5) + jitter);

      totalReqLatency += latency;

      // Update per-node metrics (EMA smoothing)
      const alpha = 0.3;
      nodeMetrics[current].latency    = Math.round(nodeMetrics[current].latency * (1 - alpha) + latency * alpha);
      nodeMetrics[current].throughput = Math.round(nodeMetrics[current].throughput * (1 - alpha) + (trafficMultiplier * 2 + Math.random() * 5) * alpha);
      nodeMetrics[current].errorRate  = Math.max(0, nodeMetrics[current].errorRate * 0.9);
      nodeMetrics[current].isOverloaded = nodeMetrics[current].throughput > 80 || nodeMetrics[current].latency > 200;

      // Random node failure in chaos mode
      if (failureMode && Math.random() < 0.012 && !failedNodes.has(current)) {
        newLogs.push(mkLog("error", `${node.data.label} FAILED — chaos injection`, null));
      }

      // Mark edge as active
      const neighbors = graph[current] ?? [];
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        const eid  = edgeBetween(edges, current, next);
        if (eid) activeEdges.add(eid);
        current = next;
      } else {
        break;
      }
    }

    if (!dropped) {
      totalLatency += totalReqLatency;
      completedReqs++;

      if (path.length > 1) {
        newLogs.push(mkLog(
          totalReqLatency > 300 ? "warn" : "success",
          `Request ${reqId} → ${path.join(" → ")}  (${totalReqLatency}ms)`,
          reqId
        ));
      }
    }
  }

  // System metrics
  const avgLatency     = completedReqs > 0 ? Math.round(totalLatency / completedReqs) : 0;
  const totalThroughput = Object.values(nodeMetrics).reduce((s, m) => s + m.throughput, 0);
  const overallErrorRate = droppedReqs / Math.max(1, droppedReqs + completedReqs + prev.systemMetrics.activeRequests);

  // Keep log buffer capped at 200 entries — newest at top
  const logs = [...newLogs, ...prev.logs].slice(0, 200);

  return {
    nodeMetrics,
    systemMetrics: {
      totalThroughput,
      avgLatency,
      errorRate:      Math.round(overallErrorRate * 100),
      activeRequests: completedReqs,
      droppedRequests: droppedReqs,
    },
    logs,
    activeEdges,
  };
}

// ── Initial empty state ────────────────────────────────────────────────────
export function emptySimState(): SimulationState {
  return {
    nodeMetrics:   {},
    systemMetrics: { totalThroughput: 0, avgLatency: 0, errorRate: 0, activeRequests: 0, droppedRequests: 0 },
    logs:          [],
    activeEdges:   new Set(),
  };
}
