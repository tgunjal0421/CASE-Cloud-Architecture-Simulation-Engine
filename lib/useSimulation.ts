// lib/useSimulation.ts
// Single source of truth for simulation state.
// SimStatus drives ALL behaviors — traffic, logs, metrics all gated by it.
// Interval is guaranteed to be cleared on stop/unmount — no leaks.

import { useState, useCallback, useRef, useEffect } from "react";
import { Node, Edge } from "reactflow";
import { CaseNodeData } from "@/components/builder/CustomNode";
import { runTick, emptySimState, SimulationState, LogEntry } from "./simulationEngine";

const TICK_MS = 800;

// ── Centralized simulation status ─────────────────────────────────────────
export type SimStatus = "idle" | "running" | "stopped";

export interface UseSimulationReturn {
  simStatus:   SimStatus;
  simState:    SimulationState;
  failedNodes: Set<string>;
  startSim:    () => void;
  stopSim:     () => void;
  toggleFail:  (nodeId: string, label: string) => void;
  resetSim:    () => void;
  clearLogs:   () => void;
}

export function useSimulation(
  nodes: Node<CaseNodeData>[],
  edges: Edge[],
  trafficMultiplier: number,   // live — ref-tracked so slider works during run
  failureMode: boolean,
): UseSimulationReturn {
  const [simStatus,   setSimStatus]   = useState<SimStatus>("idle");
  const [simState,    setSimState]    = useState<SimulationState>(emptySimState());
  const [failedNodes, setFailedNodes] = useState<Set<string>>(new Set());

  // Refs — interval closure reads these without needing re-registration
  const nodesRef      = useRef(nodes);
  const edgesRef      = useRef(edges);
  const multiplierRef = useRef(trafficMultiplier);
  const failModeRef   = useRef(failureMode);
  const failedRef     = useRef(failedNodes);

  // Keep refs fresh on every render
  useEffect(() => { nodesRef.current      = nodes;             }, [nodes]);
  useEffect(() => { edgesRef.current      = edges;             }, [edges]);
  useEffect(() => { multiplierRef.current = trafficMultiplier; }, [trafficMultiplier]);
  useEffect(() => { failModeRef.current   = failureMode;       }, [failureMode]);
  useEffect(() => { failedRef.current     = failedNodes;       }, [failedNodes]);

  // Single interval ref — never allow duplicates
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Guaranteed interval teardown ──
  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Tick — only runs while interval is active ──
  const tick = useCallback(() => {
    setSimState((prev) =>
      runTick(
        prev,
        nodesRef.current,
        edgesRef.current,
        multiplierRef.current,
        failModeRef.current,
        failedRef.current,
      )
    );
  }, []);

  // ── Start — guard against double-start ──
  const startSim = useCallback(() => {
    if (intervalRef.current !== null) return; // already running
    setSimStatus("running");
    tick(); // immediate first tick so UI doesn't wait 800ms
    intervalRef.current = setInterval(tick, TICK_MS);
  }, [tick]);

  // ── Stop — clears interval immediately, freezes state ──
  const stopSim = useCallback(() => {
    clearTick();
    setSimStatus("stopped");
    // simState is NOT reset — metrics/logs remain visible after stop
  }, [clearTick]);

  // ── Toggle node failure — works in any state ──
  const toggleFail = useCallback((nodeId: string, label: string) => {
    setFailedNodes((prev) => {
      const next      = new Set(prev);
      const wasFailed = next.has(nodeId);
      wasFailed ? next.delete(nodeId) : next.add(nodeId);

      const entry: LogEntry = {
        id:        `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("en-GB"),
        level:     wasFailed ? "success" : "error",
        requestId: null,
        message:   wasFailed
          ? `${label} RECOVERED — back online`
          : `${label} FAILED — manually triggered`,
      };
      // Always add failure log regardless of sim state
      setSimState((s) => ({ ...s, logs: [entry, ...s.logs].slice(0, 200) }));
      return next;
    });
  }, []);

  // ── Full reset — clears everything including canvas metrics ──
  const resetSim = useCallback(() => {
    clearTick();
    setSimStatus("idle");
    setSimState(emptySimState());
    setFailedNodes(new Set());
  }, [clearTick]);

  const clearLogs = useCallback(() => {
    setSimState((s) => ({ ...s, logs: [] }));
  }, []);

  // Cleanup on unmount — prevents memory leaks in dev hot-reload
  useEffect(() => () => clearTick(), [clearTick]);

  return { simStatus, simState, failedNodes, startSim, stopSim, toggleFail, resetSim, clearLogs };
}
