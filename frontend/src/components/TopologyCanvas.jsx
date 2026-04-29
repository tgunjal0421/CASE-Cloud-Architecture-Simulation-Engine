import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../utils/canvas";

export default function TopologyCanvas({
  canvasRef,
  nodes,
  edges,
  selectedForConnection,
  isRunning,
  trafficMultiplier,
  onTrafficChange,
  onNodePointerDown,
  onConnect,
  onToggleFailure,
  onRemoveNode,
  onCanvasDragOver,
  onCanvasDrop
}) {
  return (
    <section className="panel canvasPanel">
      <h2>Simulation Workspace</h2>
      <div className="topologyHints">
        <small>Build order: place blocks {"->"} connect arrows {"->"} start flow simulation.</small>
      </div>
      <div className="sliderWrap">
        <label htmlFor="traffic">Traffic Multiplier: {trafficMultiplier.toFixed(1)}x</label>
        <input
          id="traffic"
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={trafficMultiplier}
          onChange={(event) => onTrafficChange(Number(event.target.value))}
        />
      </div>

      <div className="topologyCanvas" ref={canvasRef} onDragOver={onCanvasDragOver} onDrop={onCanvasDrop}>
        <svg className="edgeLayer" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} preserveAspectRatio="none">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3.5" orient="auto">
              <polygon points="0 0, 7 3.5, 0 7" fill="#8db4ff" />
            </marker>
          </defs>
          {edges.map((edge) => {
            const source = nodes.find((node) => node.id === edge.from);
            const target = nodes.find((node) => node.id === edge.to);
            if (!source || !target) {
              return null;
            }
            return (
              <line
                key={edge.id}
                x1={source.x + 146}
                y1={source.y + 42}
                x2={target.x}
                y2={target.y + 42}
                stroke="#8db4ff"
                strokeWidth="2.5"
                markerEnd="url(#arrow)"
              />
            );
          })}
        </svg>

        {nodes.map((node) => (
          <article
            key={node.id}
            className={`canvasNode ${node.status === "failed" ? "failed" : "healthy"} ${
              selectedForConnection === node.id ? "selectedNode" : ""
            }`}
            style={{ left: node.x, top: node.y }}
            onPointerDown={(event) => onNodePointerDown(event, node.id)}
          >
            <h3>
              {node.icon} {node.kind}
            </h3>
            <p>{node.domain}</p>
            <p>{isRunning ? `${node.rps} RPS · ${node.latency} ms` : "Design mode"}</p>
            <div className="nodeActions">
              <button onClick={() => onConnect(node.id)}>Link</button>
              <button onClick={() => onToggleFailure(node.id)}>{node.status === "healthy" ? "Fail" : "Recover"}</button>
              <button onClick={() => onRemoveNode(node.id)} className="ghost">
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
