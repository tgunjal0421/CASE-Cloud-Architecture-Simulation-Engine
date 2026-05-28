// lib/useSimulation.ts
// Simulation state hook backed by backend run lifecycle + polling.

import { useState, useCallback, useRef, useEffect } from "react";
import { Node, Edge } from "reactflow";
import { CaseNodeData } from "@/components/builder/CustomNode";
import {
  SimulationState,
  LogEntry,
  startSimulation,
  fetchRunSnapshot,
  stopSimulation,
  toggleRunFailure,
} from "./api";

const POLL_MS = 800;

export type SimStatus = "idle" | "running" | "stopped";

export interface UseSimulationReturn {
  simStatus:   SimStatus;
  simState:    SimulationState;
  failedNodes: Set<string>;
  startSim:    () => Promise<string | null>;
  stopSim:     () => Promise<void>;
  toggleFail:  (nodeId: string, label: string) => void;
  resetSim:    () => void;
  clearLogs:   () => void;
}

function emptySimState(): SimulationState {
  return {
    nodeMetrics: {},
    systemMetrics: {
      totalThroughput: 0,
      avgLatency: 0,
      errorRate: 0,
      activeRequests: 0,
      droppedRequests: 0,
    },
    logs: [],
    activeEdges: new Set<string>(),
  };
}

export function useSimulation(
  nodes: Node<CaseNodeData>[],
  edges: Edge[], 
  trafficMultiplier: number,
  failureMode: boolean,
): UseSimulationReturn {
  const [simStatus,   setSimStatus]   = useState<SimStatus>("idle");
  const [simState,    setSimState]    = useState<SimulationState>(emptySimState());
  const [failedNodes, setFailedNodes] = useState<Set<string>>(new Set());
  const runIdRef = useRef<string | null>(null);

  const nodesRef      = useRef(nodes);
  const edgesRef      = useRef(edges);
  const multiplierRef = useRef(trafficMultiplier);
  const failModeRef   = useRef(failureMode);
  const failedRef     = useRef(failedNodes);

  useEffect(() => { nodesRef.current      = nodes;             }, [nodes]);
  useEffect(() => { edgesRef.current      = edges;             }, [edges]);
  useEffect(() => { multiplierRef.current = trafficMultiplier; }, [trafficMultiplier]);
  useEffect(() => { failModeRef.current   = failureMode;       }, [failureMode]);
  useEffect(() => { failedRef.current     = failedNodes;       }, [failedNodes]);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollRun = useCallback(async () => {
    const runId = runIdRef.current;
    if (!runId) return;
    try {
      const snapshot = await fetchRunSnapshot(runId);
      setSimState(snapshot.state);
      setFailedNodes(new Set(snapshot.config.failedNodes));
      if (snapshot.status !== "running") {
        clearPoll();
        setSimStatus("stopped");
      }
    } catch (err) {
      console.error("Polling simulation run failed", err);
      clearPoll();
      setSimStatus("stopped");
    }
  }, [clearPoll]);

  const startSim = useCallback(async () => {
    if (pollRef.current !== null) return runIdRef.current;
    try {
      const result = await startSimulation({
        nodes: nodesRef.current,
        edges: edgesRef.current,
        trafficMultiplier: multiplierRef.current,
        failureMode: failModeRef.current,
        failedNodes: Array.from(failedRef.current),
      });
      runIdRef.current = result.runId;
      setSimStatus("running");
      await pollRun();
      pollRef.current = setInterval(pollRun, POLL_MS);
      return result.runId;
    } catch (err) {
      console.error("Failed to start simulation", err);
      setSimStatus("idle");
      return null;
    }
  }, [pollRun]);

  const stopSim = useCallback(async () => {
    clearPoll();
    const runId = runIdRef.current;
    if (runId) {
      try {
        await stopSimulation(runId);
        const snapshot = await fetchRunSnapshot(runId);
        setSimState(snapshot.state);
        setFailedNodes(new Set(snapshot.config.failedNodes));
      } catch (err) {
        console.error("Failed to stop simulation", err);
      }
    }
    setSimStatus("stopped");
  }, [clearPoll]);

  const toggleFail = useCallback((nodeId: string, label: string) => {
    setFailedNodes((prev) => {
      const next = new Set(prev);
      const wasFailed = next.has(nodeId);
      if (wasFailed) next.delete(nodeId);
      else next.add(nodeId);

      const entry: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("en-GB"),
        level: wasFailed ? "success" : "error",
        requestId: null,
        message: wasFailed
          ? `${label} RECOVERED - back online`
          : `${label} FAILED - manually triggered`,
      };
      setSimState((s) => ({ ...s, logs: [entry, ...s.logs].slice(0, 200) }));
      const runId = runIdRef.current;
      if (runId && simStatus === "running") {
        toggleRunFailure(runId, nodeId).catch((err) => {
          console.error("Failed to sync failure toggle", err);
        });
      }
      return next;
    });
  }, [simStatus]);

  const resetSim = useCallback(() => {
    clearPoll();
    runIdRef.current = null;
    setSimStatus("idle");
    setSimState(emptySimState());
    setFailedNodes(new Set());
  }, [clearPoll]);

  const clearLogs = useCallback(() => {
    setSimState((s) => ({ ...s, logs: [] }));
  }, []);

  useEffect(() => () => clearPoll(), [clearPoll]);

  return { simStatus, simState, failedNodes, startSim, stopSim, toggleFail, resetSim, clearLogs };
}
