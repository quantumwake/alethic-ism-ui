# KGraph — Custom Flow Diagramming Engine

## Overview

KGraph is a custom-built, zero-dependency (no ReactFlow) flow diagramming engine designed specifically for the Alethic ISM Studio. It replaces `@xyflow/react` with a purpose-built SVG + HTML hybrid canvas that preserves the current look and feel while giving us full control over rendering, interactions, and performance.

---

## Why Replace ReactFlow?

- **Full ownership** — No dependency on a third-party library's release cycle, API changes, or licensing
- **Purpose-built** — We only use ~30% of ReactFlow's API surface; a custom engine can be leaner and faster
- **Custom behaviors** — Features like node collapse, status-based edge animation, and 8-handle nodes are easier to implement natively than via ReactFlow's extension points
- **Bundle size** — The current `flow-vendor` chunk is ~171 KB (55 KB gzipped); a custom engine targeting only what we need should be significantly smaller

---

## Current ReactFlow Usage Audit

### Files that import from `@xyflow/react` (10 files)

| File | Status |
|------|--------|
| `src/CustomStudio.jsx` | **Primary** — active studio, 1060 lines |
| `src/components/studio/CustomStudio.tsx` | **Primary** — reusable ReactFlow wrapper, 577 lines |
| `src/components/studio/CustomStudioWrapper.tsx` | ReactFlowProvider wrapper |
| `src/components/studio/CustomStudioDemo.tsx` | Demo component |
| `src/App.tsx` | ReactFlowProvider at router level |
| `src/useNodesStateSynced.ts` | Uses `applyNodeChanges` |
| `src/useEdgesStateSynced.ts` | Uses `applyEdgeChanges` |
| `src/reactflow/CustomEdge.tsx` | Legacy custom edge |
| `src/nodes/base/BaseNode.jsx` | Legacy Handle/Position |
| `src/nodes/ProcessorNodeMistral.jsx` | Legacy Handle/Position |
| `src/Studio.tsx` | Legacy studio (disabled) |

### ReactFlow APIs actually consumed

| Category | APIs |
|----------|------|
| **Components** | `ReactFlow`, `ReactFlowProvider`, `Background`, `MiniMap`, `Panel`, `Handle`, `BaseEdge`, `EdgeLabelRenderer` |
| **Hooks** | `useReactFlow` → `screenToFlowPosition`, `fitView`, `zoomIn`, `zoomOut` |
| **Utilities** | `applyNodeChanges`, `applyEdgeChanges`, `addEdge`, `getBezierPath` |
| **Types** | `Node`, `Edge`, `Connection`, `NodeTypes`, `EdgeTypes`, `OnNodesChange`, `OnEdgesChange`, `OnConnect`, `EdgeProps`, `Position`, `SelectionMode`, `BackgroundVariant` |

### Features actively used

1. SVG canvas with pan & zoom (wheel + drag)
2. Node rendering as positioned HTML elements
3. Connection handles (8 per node: 4 source + 4 target at Top/Right/Bottom/Left)
4. Bezier edge paths between handles
5. Snap-to-grid (16×16)
6. Drag-and-drop from palette to canvas (via `application/reactflow` data transfer)
7. Node dragging with position persistence to backend
8. Edge click/hover with toolbar overlay
9. Node click/hover with toolbar overlay
10. Canvas lock/unlock (disable pan, zoom, drag, connect, select)
11. Node collapse (graph-level: hide descendants) and visual collapse (node-level: compact icon)
12. MiniMap
13. Dot-grid background (toggleable)
14. Fit-view, zoom-in, zoom-out toolbar buttons
15. Multi-selection with Shift key
16. Delete key to remove selected node/edge
17. Status-based edge coloring and animation (7 statuses)
18. Custom connection line rendering

---

## Architecture

```
src/kgraph/
├── core/
│   ├── KGraphCanvas.tsx          # Top-level component (replaces ReactFlow + ReactFlowProvider)
│   ├── KGraphProvider.tsx        # React context for canvas state (viewport, selection, etc.)
│   ├── types.ts                  # All TypeScript interfaces
│   └── constants.ts              # Default config values
│
├── viewport/
│   ├── useViewport.ts            # Pan & zoom state management
│   ├── ViewportTransform.tsx     # SVG <g> wrapper applying transform matrix
│   └── math.ts                   # screenToCanvas, canvasToScreen, fitView, clamp
│
├── nodes/
│   ├── NodeRenderer.tsx          # Renders all visible nodes as positioned HTML overlays
│   ├── NodeWrapper.tsx           # Individual node container (position, drag, selection, handles)
│   ├── Handle.tsx                # Connection handle component (replaces ReactFlow Handle)
│   └── useNodeDrag.ts            # Drag logic with snap-to-grid support
│
├── edges/
│   ├── EdgeRenderer.tsx          # SVG layer rendering all edges
│   ├── EdgePath.tsx              # Individual edge SVG path (bezier curve)
│   ├── EdgeLabel.tsx             # HTML overlay positioned at edge midpoint (replaces EdgeLabelRenderer)
│   ├── ConnectionLine.tsx        # Temporary edge while drawing a new connection
│   └── bezier.ts                 # getBezierPath equivalent — cubic bezier math
│
├── background/
│   ├── DotGrid.tsx               # SVG dot pattern background (replaces Background)
│   └── GridPattern.tsx           # Optional line grid pattern
│
├── minimap/
│   └── MiniMap.tsx               # Minimap component (replaces MiniMap)
│
├── interactions/
│   ├── useCanvasInteractions.ts  # Pan, zoom (wheel), pane click
│   ├── useConnectionDraw.ts     # Drawing new connections between handles
│   ├── useSelection.ts           # Click selection, multi-select with Shift, rubber-band selection
│   ├── useKeyboard.ts            # Keyboard shortcuts (Delete, etc.)
│   └── useDragAndDrop.ts         # External drag-and-drop onto canvas
│
├── state/
│   ├── useKGraphState.ts         # Central state hook (nodes, edges, changes)
│   ├── applyNodeChanges.ts       # Immutable node change application (position, selection, remove, add)
│   ├── applyEdgeChanges.ts       # Immutable edge change application (selection, remove, add)
│   └── changeTypes.ts            # NodeChange, EdgeChange union types
│
├── hooks/
│   ├── useKGraph.ts              # Public hook (replaces useReactFlow) — fitView, zoomIn, zoomOut, screenToCanvasPosition
│   └── useVisibleElements.ts     # Viewport culling — only render nodes/edges in view
│
└── index.ts                      # Public API barrel export
```

---

## Detailed Component Design

### Phase 1 — Core Canvas & Viewport

#### 1.1 `KGraphProvider` + Context

```typescript
// types.ts
interface KGraphViewport {
  x: number;       // pan offset X
  y: number;       // pan offset Y
  zoom: number;    // scale factor (0.1 – 4.0)
}

interface KGraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  selected?: boolean;
  dragging?: boolean;
  hidden?: boolean;
  width?: number;
  height?: number;
}

interface KGraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: Record<string, any>;
  selected?: boolean;
  animated?: boolean;
}

interface KGraphHandle {
  id: string;
  type: 'source' | 'target';
  position: 'top' | 'right' | 'bottom' | 'left';
}

// Change types (mirrors ReactFlow's change system so migration is easy)
type NodeChange =
  | { type: 'position'; id: string; position: { x: number; y: number }; dragging: boolean }
  | { type: 'select'; id: string; selected: boolean }
  | { type: 'remove'; id: string }
  | { type: 'add'; item: KGraphNode }
  | { type: 'dimensions'; id: string; dimensions: { width: number; height: number } };

type EdgeChange =
  | { type: 'select'; id: string; selected: boolean }
  | { type: 'remove'; id: string }
  | { type: 'add'; item: KGraphEdge };
```

The context provides:
- Viewport state (x, y, zoom) and setters
- `screenToCanvasPosition(screenX, screenY)` — converts mouse coordinates to canvas coordinates
- `canvasToScreenPosition(canvasX, canvasY)` — inverse
- `fitView(padding?)` — auto-fit all nodes into viewport
- `zoomIn()`, `zoomOut()`, `zoomTo(level)`
- `setSelectedNodeId`, `setSelectedEdgeId`
- Handle position registry (map of `nodeId:handleId` → `{x, y}` in canvas coords)

#### 1.2 `KGraphCanvas`

The top-level component. Rendering structure:

```
<div class="kgraph-canvas" style="width:100%; height:100%; position:relative; overflow:hidden;">
  ├── <svg style="position:absolute; inset:0; width:100%; height:100%;">
  │   ├── <DotGrid />                          // Background pattern
  │   └── <g transform="translate(x,y) scale(zoom)">
  │       └── <EdgeRenderer edges={edges} />   // All edge SVG paths
  │       └── <ConnectionLine />               // Temp edge while drawing
  │   </g>
  ├── <div style="position:absolute; inset:0; transform-origin:0 0; transform:translate(x,y) scale(zoom);">
  │   └── <NodeRenderer nodes={nodes} />       // All node HTML elements
  ├── <MiniMap />                              // Overlay, bottom-right
  └── <div class="kgraph-toolbar">             // Overlay, top-left
      └── [toolbar buttons]
  </div>
```

**Key design decision**: Edges are SVG, nodes are HTML `<div>`s. This is the same hybrid approach ReactFlow uses, and it's what makes nodes look great (full CSS/HTML rendering) while edges remain smooth vector paths. The SVG layer and the HTML node layer share the same transform so they stay in sync.

Props (designed to be a drop-in shape-match for the existing `CustomStudioProps`):

```typescript
interface KGraphCanvasProps {
  nodes: KGraphNode[];
  edges: KGraphEdge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: { source: string; target: string; sourceHandle?: string; targetHandle?: string }) => void;
  onNodeClick?: (event: React.MouseEvent, node: KGraphNode) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: KGraphEdge) => void;
  onPaneClick?: (event: React.MouseEvent) => void;
  onDrop?: (event: React.DragEvent, position: { x: number; y: number }) => void;
  onDragOver?: (event: React.DragEvent) => void;
  nodeTypes?: Record<string, React.ComponentType<NodeComponentProps>>;
  edgeTypes?: Record<string, React.ComponentType<EdgeComponentProps>>;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
  panOnDrag?: boolean;
  zoomOnScroll?: boolean;
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  elementsSelectable?: boolean;
  selectionMode?: 'partial' | 'full';
  multiSelectionKeyCode?: string;
  fitView?: boolean;
  showMiniMap?: boolean;
  showBackground?: boolean;
  backgroundGap?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;       // For toolbar overlays
}
```

### Phase 2 — Node System

#### 2.1 `NodeRenderer`

Iterates over visible nodes (viewport-culled) and renders a `NodeWrapper` for each.

#### 2.2 `NodeWrapper`

Positions the node component absolutely within the HTML layer:

```
<div style="position:absolute; left:{node.position.x}px; top:{node.position.y}px; transform:translate(0,0);">
  <CustomNodeComponent id={node.id} data={node.data} selected={node.selected} ... />
</div>
```

Responsibilities:
- Measures node dimensions via `ResizeObserver` → reports `dimensions` change
- Handles mouse-down for drag initiation (delegates to `useNodeDrag`)
- Handles click for selection
- Renders `Handle` sub-components at computed positions

#### 2.3 `Handle`

Replaces `<Handle>` from ReactFlow. Renders a small circular hit target at the specified position (top/right/bottom/left) of the node.

```typescript
interface HandleProps {
  id: string;
  type: 'source' | 'target';
  position: 'top' | 'right' | 'bottom' | 'left';
  style?: React.CSSProperties;
  onConnect?: (params: Connection) => void;
}
```

On mount, registers its absolute canvas position into the handle registry (context). On node move, positions update. Edges read from this registry to know where to start/end.

The current system uses 8 handles per node — 4 source (invisible, opacity:0) overlapping 4 target handles. We'll replicate this by rendering a single visual dot per side but registering both a source and target handle at each position.

#### 2.4 `useNodeDrag`

```
mousedown on node →
  record startPosition, startMouse
  add mousemove/mouseup listeners to window

mousemove →
  delta = (currentMouse - startMouse) / zoom
  newPosition = startPosition + delta
  if snapToGrid: snap to grid
  emit NodeChange { type: 'position', dragging: true }

mouseup →
  emit NodeChange { type: 'position', dragging: false }
  (this triggers backend persist in useNodesStateSynced)
  cleanup listeners
```

### Phase 3 — Edge System

#### 3.1 `bezier.ts` — Path Math

Replaces `getBezierPath` from ReactFlow. Computes a cubic bezier curve given:
- `sourceX, sourceY, sourcePosition` (which side of the source node)
- `targetX, targetY, targetPosition` (which side of the target node)
- Optional curvature factor

Returns `[pathString, labelX, labelY, offsetX, offsetY]` — identical signature to ReactFlow's `getBezierPath` for easy migration.

The algorithm:
1. Compute control point offsets based on source/target positions (e.g., if source exits right, control point is to the right)
2. Build SVG path string: `M sx,sy C cp1x,cp1y cp2x,cp2y tx,ty`
3. Label position is the bezier midpoint at t=0.5

#### 3.2 `EdgeRenderer`

SVG `<g>` containing all edge paths. For each edge:
1. Look up source handle position from registry → `(sourceX, sourceY, sourcePosition)`
2. Look up target handle position from registry → `(targetX, targetY, targetPosition)`
3. Compute bezier path
4. Render `<EdgePath>` (or custom edge type component)

#### 3.3 `EdgePath`

Default edge rendering:
```svg
<g>
  <!-- Invisible wider hit area for easier clicking -->
  <path d={path} stroke="transparent" strokeWidth={20} fill="none"
        onMouseEnter={...} onMouseLeave={...} onClick={...} />
  <!-- Visible edge -->
  <path d={path} stroke={color} strokeWidth={2} fill="none"
        strokeDasharray={animated ? "5,5" : "none"} />
  <!-- Arrow marker -->
  <marker ...> <path d="M 0 0 L 10 5 L 0 10 z" /> </marker>
</g>
```

#### 3.4 `EdgeLabel`

HTML overlay positioned at the edge midpoint using CSS `transform`. This replaces `EdgeLabelRenderer`:

```
<div style="position:absolute; left:0; top:0;
            transform: translate({labelX}px, {labelY}px) translate(-50%, -50%) scale(1/zoom);">
  {children}  // toolbar buttons, labels, etc.
</div>
```

The `scale(1/zoom)` ensures labels maintain consistent screen size regardless of zoom level.

#### 3.5 `ConnectionLine`

Renders while the user drags from a handle to create a new connection. Follows the mouse cursor with a temporary bezier path. On mouse-up over a valid target handle, fires `onConnect`.

### Phase 4 — Interactions

#### 4.1 `useCanvasInteractions`

Attached to the root `<div>`:

**Pan** (mouse drag on empty canvas):
```
mousedown on pane (not on node/edge) →
  if !panOnDrag: return
  record startViewport, startMouse

mousemove →
  viewport.x = startViewport.x + (currentMouse.x - startMouse.x)
  viewport.y = startViewport.y + (currentMouse.y - startMouse.y)

mouseup → cleanup
```

**Zoom** (wheel):
```
wheel →
  if !zoomOnScroll: return
  zoomDelta = -event.deltaY * 0.001
  newZoom = clamp(zoom + zoomDelta, 0.1, 4.0)
  // Zoom toward mouse position:
  viewport.x = mouseX - (mouseX - viewport.x) * (newZoom / zoom)
  viewport.y = mouseY - (mouseY - viewport.y) * (newZoom / zoom)
  zoom = newZoom
```

**Pane click**: On click with no drag → fire `onPaneClick`, clear selection.

#### 4.2 `useSelection`

- Click on node → select node, deselect all others (unless Shift held)
- Click on edge → select edge, deselect all others (unless Shift held)
- Shift+Click → toggle selection (additive)
- Click on pane → deselect all
- Rubber-band selection (stretch goal): drag on pane draws a rectangle, selects all nodes within

#### 4.3 `useKeyboard`

- `Delete` / `Backspace` → remove selected node/edge (fires change events)

#### 4.4 `useConnectionDraw`

```
mousedown on source handle →
  record sourceNodeId, sourceHandleId
  start rendering ConnectionLine from handle position to mouse

mousemove →
  update ConnectionLine endpoint to mouse position (canvas coords)

mouseup →
  if over a target handle:
    fire onConnect({ source, target, sourceHandle, targetHandle })
  cancel ConnectionLine
```

#### 4.5 `useDragAndDrop`

Handles external drag-and-drop (from component palette):
```
onDragOver → event.preventDefault(), event.dataTransfer.dropEffect = 'move'
onDrop →
  const type = event.dataTransfer.getData('application/kgraph')  // rename from 'application/reactflow'
  const canvasPosition = screenToCanvasPosition(event.clientX, event.clientY)
  fire onDrop(event, canvasPosition)
```

### Phase 5 — Background & MiniMap

#### 5.1 `DotGrid`

SVG pattern that tiles dots:
```svg
<svg>
  <defs>
    <pattern id="kgraph-dots" x={viewport.x % gap} y={viewport.y % gap}
             width={gap * zoom} height={gap * zoom} patternUnits="userSpaceOnUse">
      <circle cx={1.5} cy={1.5} r={1.5} fill="rgba(255,255,255,0.15)" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#kgraph-dots)" />
</svg>
```

#### 5.2 `MiniMap`

A scaled-down view of the entire graph rendered as simple colored rectangles:
- Renders in a fixed-size `<svg>` (e.g., 200×150px) positioned at bottom-right
- Each node is a small filled rectangle, color-coded by type
- A viewport indicator rectangle shows the currently visible area
- Click/drag on the minimap pans the main viewport

### Phase 6 — State Management Utilities

#### 6.1 `applyNodeChanges(changes, nodes) → nodes`

Pure function. Drop-in replacement for ReactFlow's `applyNodeChanges`:

```typescript
function applyNodeChanges(changes: NodeChange[], nodes: KGraphNode[]): KGraphNode[] {
  let result = [...nodes];
  for (const change of changes) {
    switch (change.type) {
      case 'position':
        result = result.map(n => n.id === change.id
          ? { ...n, position: change.position ?? n.position, dragging: change.dragging }
          : n);
        break;
      case 'select':
        result = result.map(n => n.id === change.id
          ? { ...n, selected: change.selected }
          : n);
        break;
      case 'remove':
        result = result.filter(n => n.id !== change.id);
        break;
      case 'add':
        result.push(change.item);
        break;
      case 'dimensions':
        result = result.map(n => n.id === change.id
          ? { ...n, width: change.dimensions.width, height: change.dimensions.height }
          : n);
        break;
    }
  }
  return result;
}
```

#### 6.2 `applyEdgeChanges(changes, edges) → edges`

Same pattern for edges.

#### 6.3 `useKGraph` hook

Replaces `useReactFlow()`. Returns from context:

```typescript
function useKGraph() {
  return {
    screenToCanvasPosition: (x: number, y: number) => { x: number, y: number },
    fitView: (options?: { padding?: number }) => void,
    zoomIn: () => void,
    zoomOut: () => void,
    zoomTo: (level: number) => void,
    getViewport: () => KGraphViewport,
    setViewport: (viewport: KGraphViewport) => void,
    getNodes: () => KGraphNode[],
    getEdges: () => KGraphEdge[],
  };
}
```

---

## Migration Strategy

### Step 1: Build KGraph as a parallel module (`src/kgraph/`)

Build the entire KGraph engine as a new module without touching existing code. This allows side-by-side testing.

### Step 2: Create `KGraphStudio.tsx` wrapper

A new version of `src/components/studio/CustomStudio.tsx` that uses KGraph instead of ReactFlow, exposing the exact same external props interface. This is the **bridge component** — it should be API-compatible with the existing `CustomStudioProps` so `CustomStudio.jsx` can swap to it with minimal changes.

### Step 3: Swap `CustomStudio.jsx` to use KGraph

Replace imports:
```diff
- import { ReactFlowProvider, useReactFlow, Handle, Position, getBezierPath, EdgeLabelRenderer, BaseEdge, MarkerType } from '@xyflow/react';
- import '@xyflow/react/dist/style.css';
+ import { KGraphProvider, useKGraph, Handle, getBezierPath, EdgeLabel } from './kgraph';

- import { CustomStudio as StudioCanvas } from './components/studio';
+ import { KGraphCanvas } from './kgraph';
```

Update edge components:
```diff
- const [edgePath, labelX, labelY] = getBezierPath({...});
+ const [edgePath, labelX, labelY] = getBezierPath({...});  // Same signature, our implementation
```

Update node components:
```diff
- <Handle type="target" position={Position.Top} id="target-1" ... />
+ <Handle type="target" position="top" id="target-1" ... />  // String enum instead of Position object
```

### Step 4: Update `useNodesStateSynced` and `useEdgesStateSynced`

```diff
- import { applyNodeChanges, OnNodesChange } from '@xyflow/react';
+ import { applyNodeChanges } from './kgraph';
+ import type { NodeChange } from './kgraph';
```

### Step 5: Update drag-and-drop palette

```diff
// ComponentTab2.jsx, ComponentTab.jsx
- event.dataTransfer.setData('application/reactflow', nodeType);
+ event.dataTransfer.setData('application/kgraph', nodeType);
```

### Step 6: Remove `ReactFlowProvider` wrappers

- Remove from `App.tsx`
- Remove from `CustomStudioWrapper.tsx`
- Replace with `KGraphProvider` only where needed (inside `KGraphCanvas`)

### Step 7: Clean up legacy files

Delete:
- `src/reactflow/` directory (CustomEdge.tsx, CustomConnectionLine.jsx)
- `src/nodes/` directory (all legacy node components — 21 files)
- `src/Studio.tsx` (legacy studio, already disabled)
- `src/components/studio/CustomStudio.tsx` (replaced by KGraph)
- `src/components/studio/CustomStudioWrapper.tsx`
- `src/components/studio/CustomStudioDemo.tsx`

### Step 8: Uninstall `@xyflow/react`

```bash
npm uninstall @xyflow/react
```

Remove from `vite.config.ts`:
```diff
- 'flow-vendor': ['@xyflow/react'],
```

---

## Implementation Order

| Phase | What | Files | Est. Complexity |
|-------|------|-------|----------------|
| **1** | Core types, context, canvas shell | `types.ts`, `constants.ts`, `KGraphProvider.tsx`, `KGraphCanvas.tsx` | Low |
| **2** | Viewport (pan, zoom, transforms) | `useViewport.ts`, `ViewportTransform.tsx`, `math.ts`, `useCanvasInteractions.ts` | Medium |
| **3** | Node rendering + dragging | `NodeRenderer.tsx`, `NodeWrapper.tsx`, `Handle.tsx`, `useNodeDrag.ts` | Medium |
| **4** | Edge rendering (bezier math, SVG paths) | `bezier.ts`, `EdgeRenderer.tsx`, `EdgePath.tsx`, `EdgeLabel.tsx` | Medium |
| **5** | Connection drawing (creating new edges) | `ConnectionLine.tsx`, `useConnectionDraw.ts` | Medium |
| **6** | Selection + keyboard | `useSelection.ts`, `useKeyboard.ts` | Low |
| **7** | State utilities (applyChanges) | `applyNodeChanges.ts`, `applyEdgeChanges.ts`, `changeTypes.ts` | Low |
| **8** | Background + MiniMap | `DotGrid.tsx`, `MiniMap.tsx` | Low |
| **9** | Drag-and-drop from palette | `useDragAndDrop.ts` | Low |
| **10** | `useKGraph` public hook | `useKGraph.ts` | Low |
| **11** | Integration — swap CustomStudio.jsx | Modify existing files | Medium |
| **12** | Cleanup — remove ReactFlow | Delete files, uninstall package | Low |

---

## Key Technical Details

### Handle Position Calculation

Each node has 8 handles. Their canvas positions must be recalculated whenever:
- The node moves (drag)
- The node resizes (expand/collapse)
- The viewport changes (not needed — handles are in canvas space)

Position formula for a handle on a node at `(nodeX, nodeY)` with dimensions `(width, height)`:
```
top:    (nodeX + width/2, nodeY)
right:  (nodeX + width, nodeY + height/2)
bottom: (nodeX + width/2, nodeY + height)
left:   (nodeX, nodeY + height/2)
```

Store in a `Map<string, {x, y, position}>` keyed by `${nodeId}:${handleId}`.

### Bezier Curve Algorithm

For a source exiting from the right side and a target entering from the left side:
```
source control point: (sourceX + offset, sourceY)
target control point: (targetX - offset, targetY)
where offset = Math.abs(targetX - sourceX) * 0.5 (clamped to min 50px)
```

For other direction combinations, the control point offsets rotate accordingly:
- **top**: control offset is `(0, -offset)`
- **right**: control offset is `(+offset, 0)`
- **bottom**: control offset is `(0, +offset)`
- **left**: control offset is `(-offset, 0)`

### Viewport Transform Synchronization

The SVG layer and HTML node layer must share the exact same transform:
- **SVG**: `<g transform="translate(${x}, ${y}) scale(${zoom})">`
- **HTML**: `<div style="transform: translate(${x}px, ${y}px) scale(${zoom}); transform-origin: 0 0;">`

This keeps edges (SVG) and nodes (HTML) perfectly aligned.

### Performance Considerations

1. **Viewport culling** — Only render nodes and edges that are within the visible viewport + a margin. For a graph with hundreds of nodes, this prevents DOM bloat.
2. **Edge path memoization** — Recompute bezier paths only when source/target handle positions change.
3. **RAF-based drag** — Use `requestAnimationFrame` for smooth node dragging and panning.
4. **Batched state updates** — Group multiple `NodeChange` events into a single state update.
5. **CSS `will-change`** — Apply `will-change: transform` to the viewport container for GPU-accelerated transforms.

### Testing Strategy

1. **Unit tests** for `bezier.ts`, `applyNodeChanges`, `applyEdgeChanges`, `math.ts` (viewport math)
2. **Component tests** for `Handle`, `DotGrid`, `MiniMap`, `EdgePath`
3. **Integration test** — Render `KGraphCanvas` with sample nodes/edges, verify:
   - Nodes appear at correct positions
   - Edges connect correct handles
   - Pan/zoom works
   - Node drag updates position
   - Connection drawing fires `onConnect`
4. **Visual regression** — Screenshot comparison to ensure the look stays identical to current ReactFlow-based rendering

---

## API Compatibility Guarantee

The public API of KGraph is intentionally designed to mirror ReactFlow's API shape so that the migration of `CustomStudio.jsx` is a **find-and-replace** level change. Specifically:

| ReactFlow API | KGraph Equivalent | Notes |
|---------------|-------------------|-------|
| `<ReactFlow>` | `<KGraphCanvas>` | Same props shape |
| `<ReactFlowProvider>` | `<KGraphProvider>` | Built into KGraphCanvas, rarely needed standalone |
| `<Handle>` | `<Handle>` | Same name, `position` uses strings instead of `Position` enum |
| `<Background>` | `<DotGrid>` | Built into KGraphCanvas, controlled via props |
| `<MiniMap>` | `<MiniMap>` | Built into KGraphCanvas, controlled via props |
| `<Panel>` | Regular `<div>` | No special component needed — just use `children` |
| `<EdgeLabelRenderer>` | `<EdgeLabel>` | Position via props instead of CSS transform hack |
| `<BaseEdge>` | `<EdgePath>` | Renders SVG path |
| `useReactFlow()` | `useKGraph()` | Same methods: `fitView`, `zoomIn`, `zoomOut`, `screenToCanvasPosition` |
| `applyNodeChanges()` | `applyNodeChanges()` | Same signature |
| `applyEdgeChanges()` | `applyEdgeChanges()` | Same signature |
| `getBezierPath()` | `getBezierPath()` | Same signature and return type |
| `Position.Top` etc. | `'top'` etc. | String literals instead of enum |
| `screenToFlowPosition()` | `screenToCanvasPosition()` | Same behavior |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Edge routing doesn't look as good as ReactFlow | Use the same cubic bezier algorithm; test with identical node layouts |
| Performance regression with many nodes | Implement viewport culling from the start; benchmark against ReactFlow |
| Handle positions drift from edges | Use ResizeObserver + position tracking in a central registry; update edges reactively |
| Subtle interaction bugs (drag, zoom, pan) | Build each interaction as an isolated hook with unit tests; compare behavior side-by-side with ReactFlow |
| Migration breaks existing functionality | Keep ReactFlow code intact until KGraph is fully validated; use a feature flag to toggle between them during development |

---

## Summary

KGraph is a focused, purpose-built replacement for ReactFlow that preserves the exact same visual design and interaction model while removing the third-party dependency. The architecture is modular (each concern in its own file/hook), the API is designed for drop-in migration, and the implementation order is structured to deliver a working canvas early (Phases 1–4) with progressive feature additions.