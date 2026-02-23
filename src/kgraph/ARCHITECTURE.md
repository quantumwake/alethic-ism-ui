# KGraph Architecture

Internal architecture reference for the KGraph canvas library.

## Architecture Overview

KGraph follows a **Provider → Canvas → Renderers** pattern:

```
KGraphCanvas (public API)
  └─ KGraphProvider (context: viewport, handles, coordinate transforms)
       └─ InnerCanvas (pan, zoom, keyboard, drag-drop, connection drawing)
            ├─ DotGrid (background layer)
            ├─ EdgeRenderer (SVG layer)
            │    └─ EdgeComponent per edge
            ├─ NodeRenderer (HTML layer)
            │    └─ NodeWrapper per node
            │         └─ NodeComponent (user-defined)
            │              └─ Handle components
            ├─ EdgeLabel layer (HTML overlay)
            ├─ MiniMap (absolute-positioned overlay)
            └─ children (toolbar / user overlays)
```

The public `KGraphCanvas` component creates a `KGraphProvider` and passes all props to `InnerCanvas`. This ensures the context is always available to children.

## Layer Structure

Layers are stacked via CSS positioning within the canvas container. From back to front:

| Layer | Element | Z-Index | Rendering |
|-------|---------|---------|-----------|
| Background | `DotGrid` (SVG) | base | SVG `<pattern>` with viewport-tracked offset |
| Edges | SVG `<g>` with viewport transform | base | SVG paths via `EdgeRenderer` |
| Connection line | SVG `<g>` (same layer as edges) | base | Temporary bezier + circle during connection drag |
| Nodes | `div` with CSS transform | base | HTML `NodeWrapper` elements via `NodeRenderer` |
| Edge labels | `div` with CSS transform | z-index: 10 | HTML overlays via `EdgeLabel` |
| MiniMap | Absolute-positioned `div` | z-index: 20 | SVG rectangles + viewport indicator |
| Overlays | `children` of canvas | z-index: 30+ | User-provided (e.g. `StudioToolbar`) |

The edge SVG layer and node HTML layer both apply the viewport transform, but via different methods:
- **SVG edges:** `transform="translate(x, y) scale(zoom)"` on a `<g>` element
- **HTML nodes:** `transform: translate(Xpx, Ypx) scale(zoom)` as CSS on a wrapping `<div>`

## Viewport & Transform System

The viewport is stored as `{ x, y, zoom }` in `KGraphProvider` state.

### Coordinate Spaces

- **Screen space:** pixel coordinates relative to the browser window (`clientX/clientY`)
- **Container space:** pixel coordinates relative to the canvas container (screen minus container rect offset)
- **Canvas space:** logical coordinates used for node positions (container space, un-translated and un-scaled)

### Transforms

```
canvas_to_screen: screenX = canvasX * zoom + viewport.x + rect.left
screen_to_canvas: canvasX = (screenX - rect.left - viewport.x) / zoom
```

These are exposed via `screenToCanvasPosition()` and `canvasToScreenPosition()` on the context.

### Zoom

Zoom operations maintain the visual center point (or mouse position for wheel zoom):

```
newX = cx - (cx - oldX) * (newZoom / oldZoom)
newY = cy - (cy - oldY) * (newZoom / oldZoom)
```

- **Wheel zoom:** Uses a native (non-passive) event listener to `preventDefault`. Trackpad pinch gestures fire wheel events with `ctrlKey=true` and use a higher sensitivity multiplier.
- **Button zoom:** `zoomIn()` multiplies by 1.2, `zoomOut()` divides by 1.2. Both center on the container midpoint.
- **`zoomTo(level)`:** Sets an exact zoom level, centered.
- **`fitView()`:** Computes the bounding box of all nodes and calculates a zoom/offset to fit them with padding.

## Handle Registration System

Handles are the connection points on nodes. The registration flow:

1. **`Handle` component** renders a `<div>` with `data-handleid`, `data-handletype`, `data-handleposition`, and `data-nodeid` attributes.
2. **`NodeWrapper`** uses a `ResizeObserver` and position-change effects to scan for `[data-handleid]` elements inside its wrapper ref.
3. For each handle element, `NodeWrapper` computes the absolute canvas position based on the node position + handle placement (top/bottom/left/right of the node's measured dimensions).
4. `registerHandle(info: HandleInfo)` stores the handle in a `Map<string, HandleInfo>` on the provider, keyed by `"nodeId:handleId"`.
5. On node unmount, `unregisterHandle()` removes all handles for that node.

The `HandleInfo` structure:

```ts
interface HandleInfo {
  nodeId: string;
  handleId: string;
  type: 'source' | 'target';
  position: 'top' | 'right' | 'bottom' | 'left';
  x: number;  // absolute canvas X
  y: number;  // absolute canvas Y
}
```

### HandleContext

A lightweight React context (`HandleContext`) passes `nodeId` and `onConnectionStart` from `NodeWrapper` down to `Handle` components, so handle components don't need explicit `nodeId` props.

## Connection Flow

Drawing a new connection between nodes:

1. **Mouse down** on a `source` handle → `Handle.onMouseDown` calls `onConnectionStart(nodeId, handleId, type, event)`.
2. **InnerCanvas** receives the event, looks up the handle position, and sets `connectionDrag` state with source coordinates.
3. **Mouse move** → `screenToCanvasPosition` converts mouse coordinates to canvas space → updates `connectionDrag.mouseX/mouseY`.
4. **`ConnectionLine` component** renders a temporary bezier path from source handle to current mouse position.
5. **Mouse up** → `document.elementFromPoint(clientX, clientY)` finds the element under the cursor → walks up to find `[data-handleid]` → if found on a different node, calls `onConnect({ source, target, sourceHandle, targetHandle })`.
6. If the source handle is hit (stacked on top of target), the handle ID is translated from `source-N` to `target-N`.

## Selection System

Selection is managed through the change system:

- **Node click:** Dispatches `NodeChange` with `type: 'select'` for the clicked node (selected=true) and all others (selected=false). Simultaneously deselects all edges.
- **Edge click:** Same pattern but for edges, deselecting all nodes.
- **Pane click:** Deselects all nodes and edges (detected when a mousedown+mouseup occurs without panning).
- **Selection state:** Stored on each `KGraphNode.selected` / `KGraphEdge.selected` property. Applied immutably via `applyNodeChanges` / `applyEdgeChanges`.

## Keyboard Handling

A global `keydown` listener on `window` handles:

- **Delete / Backspace:** Removes the currently selected node or edge by dispatching a `remove` change. Skipped if focus is in an `INPUT`, `TEXTAREA`, `SELECT`, `contentEditable` element, or inside a `[role="dialog"]`, `[role="combobox"]`, or `[role="listbox"]`.

## Drag & Drop

### Node Dragging

1. **Mouse down** on a `NodeWrapper` (excluding handles and dialogs) starts tracking.
2. A 2px threshold distinguishes clicks from drags.
3. Movement is scaled by `1/zoom` to convert screen pixels to canvas units.
4. If `snapToGrid` is enabled, positions are rounded to the nearest grid cell.
5. `NodeChange` with `type: 'position'` is dispatched on every move (`dragging: true`) and on mouse up (`dragging: false`).
6. Uses refs (`onNodesChangeRef`, `zoomRef`, `snapRef`) to avoid stale closures in window event listeners.

### Palette Drag & Drop

1. External elements can initiate an HTML5 drag with data (e.g., node type).
2. `onDragOver` on the canvas prevents default and sets `dropEffect: 'move'`.
3. `onDrop` converts the drop position from screen to canvas coordinates via `screenToCanvasPosition` and passes both the event and position to the user's `onDrop` handler.

## Pan System

1. **Mouse down** on the canvas (not on a node or edge label) starts pan tracking if `panOnDrag` is enabled.
2. A 3px threshold distinguishes clicks from pans.
3. Mouse move updates viewport `x` and `y` directly (no zoom scaling needed since pan is in screen space).
4. If no panning occurred (click without drag), the event is treated as a pane click → deselects all elements.

## Interface Reference

### Core Types

```ts
// Node data
interface KGraphNode {
  id: string; type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  selected?: boolean; dragging?: boolean; hidden?: boolean;
  width?: number; height?: number;
}

// Edge data
interface KGraphEdge {
  id: string; source: string; target: string;
  sourceHandle?: string; targetHandle?: string;
  type?: string; data?: Record<string, any>;
  selected?: boolean; animated?: boolean;
}

// New connection
interface KGraphConnection {
  source: string; target: string;
  sourceHandle?: string; targetHandle?: string;
}

// Viewport transform
interface KGraphViewport { x: number; y: number; zoom: number; }
```

### Handle Types

```ts
type HandlePosition = 'top' | 'right' | 'bottom' | 'left';
type HandleType = 'source' | 'target';
interface HandleInfo {
  nodeId: string; handleId: string;
  type: HandleType; position: HandlePosition;
  x: number; y: number;
}
```

### Change Types

```ts
type NodeChange =
  | { type: 'position'; id: string; position?: { x: number; y: number }; dragging: boolean }
  | { type: 'select'; id: string; selected: boolean }
  | { type: 'remove'; id: string }
  | { type: 'add'; item: KGraphNode }
  | { type: 'dimensions'; id: string; dimensions: { width: number; height: number } };

type EdgeChange =
  | { type: 'select'; id: string; selected: boolean }
  | { type: 'remove'; id: string }
  | { type: 'add'; item: KGraphEdge };
```

### Component Props

```ts
// Received by custom node components
interface NodeComponentProps {
  id: string; data: Record<string, any>;
  selected: boolean; type: string;
}

// Received by custom edge components
interface EdgeComponentProps {
  id: string;
  sourceX: number; sourceY: number; targetX: number; targetY: number;
  sourcePosition: HandlePosition; targetPosition: HandlePosition;
  selected: boolean; style?: React.CSSProperties;
}

// Handle component props
interface HandleProps {
  id: string; type: HandleType; position: HandlePosition;
  style?: React.CSSProperties; className?: string;
}
```

### Context Value

```ts
interface KGraphContextValue {
  viewport: KGraphViewport;
  setViewport: React.Dispatch<React.SetStateAction<KGraphViewport>>;
  screenToCanvasPosition: (screenX: number, screenY: number) => { x: number; y: number };
  canvasToScreenPosition: (canvasX: number, canvasY: number) => { x: number; y: number };
  fitView: (options?: { padding?: number }) => void;
  zoomIn: () => void; zoomOut: () => void; zoomTo: (level: number) => void;
  registerHandle: (info: HandleInfo) => void;
  unregisterHandle: (nodeId: string, handleId: string) => void;
  getHandlePosition: (nodeId: string, handleId: string) => HandleInfo | undefined;
  getAllHandles: () => Map<string, HandleInfo>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  nodes: KGraphNode[]; edges: KGraphEdge[];
}
```

## Extension Points

### Custom Node Types

Register via `nodeTypes` prop on `KGraphCanvas`. Each component receives `NodeComponentProps`. Use `Handle` components for connection points. Node dimensions are auto-measured via `ResizeObserver`.

### Custom Edge Types

Register via `edgeTypes` prop. Each component receives `EdgeComponentProps` with pre-resolved handle coordinates. Use `getBezierPath` or render custom SVG paths. The key `'default'` provides the fallback edge.

### Toolbar / Overlays

Pass as `children` of `KGraphCanvas`. These render after the minimap and receive the `KGraphProvider` context. Use `useKGraph()` for viewport controls and `useKGraphContext()` for the container ref.

### Export

Access `containerRef` from `useKGraphContext()` and use `html-to-image` (`toPng` / `toSvg`) with a filter function to exclude overlays (minimap, toolbar, background).
