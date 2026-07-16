# Frontend Overview

## Core Features

- Simulator-like UI shell with:
  - top menu bar (File actions + Flow control)
  - central architecture workspace
  - scrollable component toolbar
  - metrics/events panel
  - bottom status bar
- Drag-and-drop cloud components onto the canvas.
- Connect nodes with directed links.
- Move and remove nodes.
- Toggle node failure/recovery states.
- Save, import, and export workspace configurations.

## Workspace JSON Shape

Exported workspace files contain:

- `version`
- `nodes`
- `edges`
- `trafficMultiplier`
- `exportedAt`

## Current Source Structure

- `frontend/src/App.jsx` - main app state and orchestration
- `frontend/src/components/DomainLibrary.jsx` - left toolbar UI
- `frontend/src/components/TopologyCanvas.jsx` - central canvas and link rendering
- `frontend/src/components/MetricsPanel.jsx` - right metrics/events panel
- `frontend/src/data/domains.js` - domain component catalog
- `frontend/src/data/templates.js` - starter template topologies
- `frontend/src/utils/canvas.js` - canvas sizing/clamping helpers
- `frontend/src/utils/simulation.js` - simulation and metrics logic
- `frontend/src/styles.css` - styling for simulator layout
