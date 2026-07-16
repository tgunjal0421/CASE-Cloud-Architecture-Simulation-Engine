import React from "react";
import { BaseEdge, getSmoothStepPath, EdgeProps } from "reactflow";

export default function TrafficEdge(props: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  // Expect numeric traffic value in data.traffic (requests per tick)
  const traffic = Number(props.data?.traffic ?? 0);
  const isActive = traffic > 0;

  // Visual encoding: color/intensity and stroke width scale with traffic
  const intensity = Math.min(1, Math.log10(traffic + 1) / 2); // 0..~1
  const color = isActive ? `rgba(0,229,255,${0.5 + intensity * 0.5})` : "#94A3B8";
  const strokeWidth = isActive ? Math.max(2, 2 + intensity * 4) : 2;

  // Animation speed: higher traffic -> faster motion (shorter dur)
  const dur = isActive ? Math.max(0.4, 2.5 - intensity * 2.0) : 2.5;

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth,
          opacity: isActive ? 0.95 : 0.6,
        }}
      />

      {isActive && (
        // render a single particle whose speed reflects traffic; frontend can be extended
        <circle r={6 + intensity * 4} fill="#00E5FF" style={{ pointerEvents: "none" }}>
          <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
}
