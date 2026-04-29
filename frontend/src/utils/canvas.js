export const CANVAS_WIDTH = 860;
export const CANVAS_HEIGHT = 430;
export const NODE_WIDTH = 146;
export const NODE_HEIGHT = 112;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function clampNodePosition(x, y) {
  return {
    x: clamp(x, 8, CANVAS_WIDTH - NODE_WIDTH - 8),
    y: clamp(y, 8, CANVAS_HEIGHT - NODE_HEIGHT - 8)
  };
}

export function getDropCoordinates(canvasRect, event) {
  const offsetX = event.clientX - canvasRect.left - NODE_WIDTH / 2;
  const offsetY = event.clientY - canvasRect.top - NODE_HEIGHT / 2;
  return clampNodePosition(offsetX, offsetY);
}
