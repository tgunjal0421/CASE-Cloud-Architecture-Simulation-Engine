import { useEffect, useMemo, useRef, useState } from "react";
import DomainLibrary from "./components/DomainLibrary";
import MetricsPanel from "./components/MetricsPanel";
import TopologyCanvas from "./components/TopologyCanvas";
import { TEMPLATES } from "./data/templates";
import { clampNodePosition, getDropCoordinates } from "./utils/canvas";
import { calculateMetrics, createNode, stepSimulation } from "./utils/simulation";

export default function App() {
  const [nodes, setNodes] = useState(TEMPLATES["3-tier web app"].nodes.map((node) => ({ ...node })));
  const [edges, setEdges] = useState(TEMPLATES["3-tier web app"].edges.map((edge) => ({ ...edge })));
  const [selectedForConnection, setSelectedForConnection] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [trafficMultiplier, setTrafficMultiplier] = useState(1);
  const [events, setEvents] = useState([
    { id: "e-1", at: Date.now(), message: "Sandbox initialized with 3-tier web app template." }
  ]);

  const canvasRef = useRef(null);
  const dragState = useRef(null);
  const importInputRef = useRef(null);

  const pushEvent = (message) => {
    setEvents((prev) => [{ id: `e-${Date.now()}`, at: Date.now(), message }, ...prev].slice(0, 25));
  };

  const applyWorkspace = (workspace, sourceLabel) => {
    if (!workspace || !Array.isArray(workspace.nodes) || !Array.isArray(workspace.edges)) {
      pushEvent(`Invalid workspace file from ${sourceLabel}.`);
      return;
    }
    setNodes(workspace.nodes);
    setEdges(workspace.edges);
    setTrafficMultiplier(typeof workspace.trafficMultiplier === "number" ? workspace.trafficMultiplier : 1);
    setSelectedForConnection(null);
    pushEvent(`Workspace loaded from ${sourceLabel}.`);
  };

  const loadTemplate = (templateName) => {
    const template = TEMPLATES[templateName];
    setNodes(template.nodes.map((node) => ({ ...node })));
    setEdges(template.edges.map((edge) => ({ ...edge })));
    setSelectedForConnection(null);
    pushEvent(`Loaded template: ${templateName}.`);
  };

  const getWorkspaceSnapshot = () => ({
    version: 1,
    nodes,
    edges,
    trafficMultiplier,
    exportedAt: new Date().toISOString()
  });

  const saveWorkspace = () => {
    localStorage.setItem("case-simulator-workspace", JSON.stringify(getWorkspaceSnapshot()));
    pushEvent("Workspace saved locally.");
  };

  const exportWorkspace = () => {
    const payload = JSON.stringify(getWorkspaceSnapshot(), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `case-workspace-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    pushEvent("Workspace exported as JSON.");
  };

  const openImportDialog = () => {
    importInputRef.current?.click();
  };

  const onImportWorkspace = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      applyWorkspace(parsed, "import file");
    } catch {
      pushEvent("Failed to import workspace file.");
    } finally {
      event.target.value = "";
    }
  };

  const resetWorkspace = () => {
    loadTemplate("3-tier web app");
    setTrafficMultiplier(1);
    pushEvent("Sandbox reset.");
  };

  const addComponentToCanvas = (component, position) => {
    setNodes((prev) => [...prev, createNode(component, prev.length + 1, position)]);
    pushEvent(`Added ${component.kind} from ${component.domain} domain.`);
  };

  const addByClick = (component) => {
    addComponentToCanvas(component, { x: 330, y: 180 });
  };

  const removeNode = (id) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setEdges((prev) => prev.filter((edge) => edge.from !== id && edge.to !== id));
    setSelectedForConnection((prev) => (prev === id ? null : prev));
    pushEvent("Removed component from architecture.");
  };

  const toggleFailure = (id) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? {
              ...node,
              status: node.status === "healthy" ? "failed" : "healthy",
              rps: node.status === "healthy" ? Math.max(0, Math.round(node.rps * 0.24)) : node.rps + 40,
              latency: node.status === "healthy" ? node.latency + 120 : Math.max(25, node.latency - 110)
            }
          : node
      )
    );
    pushEvent("Injected or recovered component failure.");
  };

  const connectNode = (id) => {
    if (!selectedForConnection) {
      setSelectedForConnection(id);
      pushEvent("Source selected. Pick target component to connect traffic flow.");
      return;
    }
    if (selectedForConnection === id) {
      setSelectedForConnection(null);
      return;
    }
    const exists = edges.some((edge) => edge.from === selectedForConnection && edge.to === id);
    if (!exists) {
      setEdges((prev) => [...prev, { id: `e-${Date.now()}`, from: selectedForConnection, to: id }]);
      pushEvent("Created directed service connection.");
    }
    setSelectedForConnection(null);
  };

  const onTrafficChange = (value) => {
    setTrafficMultiplier(value);
    pushEvent(`Traffic profile set to ${value.toFixed(1)}x.`);
  };

  const onNodePointerDown = (event, nodeId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    dragState.current = {
      id: nodeId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
  };

  const onCanvasDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const onCanvasDrop = (event) => {
    event.preventDefault();
    if (!canvasRef.current) {
      return;
    }
    const raw = event.dataTransfer.getData("application/case-component");
    if (!raw) {
      return;
    }
    const component = JSON.parse(raw);
    const position = getDropCoordinates(canvasRef.current.getBoundingClientRect(), event);
    addComponentToCanvas(component, position);
  };

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }
    const timer = setInterval(() => {
      setNodes((prev) => stepSimulation(prev, edges, trafficMultiplier));
    }, 1100);
    return () => clearInterval(timer);
  }, [isRunning, edges, trafficMultiplier]);

  useEffect(() => {
    const onPointerMove = (event) => {
      const currentDrag = dragState.current;
      if (!currentDrag || !canvasRef.current) {
        return;
      }
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = event.clientX - rect.left - currentDrag.offsetX;
      const rawY = event.clientY - rect.top - currentDrag.offsetY;
      const nextPosition = clampNodePosition(rawX, rawY);
      setNodes((prev) =>
        prev.map((node) =>
          node.id === currentDrag.id ? { ...node, x: nextPosition.x, y: nextPosition.y } : node
        )
      );
    };

    const onPointerUp = () => {
      dragState.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const metrics = useMemo(() => calculateMetrics(nodes), [nodes]);

  return (
    <div className="simulatorShell">
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hiddenImportInput"
        onChange={onImportWorkspace}
      />

      <header className="menuBar">
        <div className="menuBrand">CASE Cloud Architecture Simulator</div>
        <div className="menuSection">
          <span className="menuTitle">File</span>
          <button onClick={saveWorkspace}>Save</button>
          <button onClick={openImportDialog}>Import</button>
          <button onClick={exportWorkspace}>Export</button>
          <button onClick={resetWorkspace}>New</button>
        </div>
        <div className="menuSection">
          <span className="menuTitle">Flow</span>
          <button onClick={() => setIsRunning((prev) => !prev)} className={isRunning ? "warn" : "primary"}>
            {isRunning ? "Stop Flow" : "Start Flow"}
          </button>
        </div>
      </header>

      <main className="workspaceGrid">
        <DomainLibrary onLoadTemplate={loadTemplate} onAddByClick={addByClick} />
        <TopologyCanvas
          canvasRef={canvasRef}
          nodes={nodes}
          edges={edges}
          selectedForConnection={selectedForConnection}
          trafficMultiplier={trafficMultiplier}
          onTrafficChange={onTrafficChange}
          onNodePointerDown={onNodePointerDown}
          onConnect={connectNode}
          onToggleFailure={toggleFailure}
          onRemoveNode={removeNode}
          onCanvasDragOver={onCanvasDragOver}
          onCanvasDrop={onCanvasDrop}
          isRunning={isRunning}
        />
        <MetricsPanel metrics={metrics} events={events} />
      </main>

      <footer className="statusBar">
        <span>Nodes: {nodes.length}</span>
        <span>Links: {edges.length}</span>
        <span>Mode: {isRunning ? "Running" : "Design"}</span>
        <span>Traffic: {trafficMultiplier.toFixed(1)}x</span>
      </footer>
    </div>
  );
}
