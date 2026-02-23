# KGraph

A lightweight, zero-dependency graph canvas for React. Built as a drop-in replacement for ReactFlow with a minimal API surface and no external runtime dependencies.

## Quick Start

```tsx
import {
  KGraphCanvas,
  applyNodeChanges,
  applyEdgeChanges,
} from '../kgraph';
import type { KGraphNode, KGraphEdge, NodeChange, EdgeChange, KGraphConnection } from '../kgraph';

function MyGraph() {
  const [nodes, setNodes] = useState<KGraphNode[]>(initialNodes);
  const [edges, setEdges] = useState<KGraphEdge[]>(initialEdges);

  const onNodesChange = (changes: NodeChange[]) =>
    setNodes(prev => applyNodeChanges(changes, prev));

  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges(prev => applyEdgeChanges(changes, prev));

  const onConnect = (conn: KGraphConnection) =>
    setEdges(prev => [...prev, { id: `e-${conn.source}-${conn.target}`, ...conn }]);

  return (
    <KGraphCanvas
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={{ custom: MyCustomNode }}
      fitView
    />
  );
}
```

## Core Components

### `KGraphCanvas`

The main canvas component. Wraps content in a `KGraphProvider` automatically.

```tsx
<KGraphCanvas
  nodes={nodes}
  edges={edges}
  onNodesChange={handleNodesChange}
  onEdgesChange={handleEdgesChange}
  onConnect={handleConnect}
  nodeTypes={{ myType: MyNodeComponent }}
  edgeTypes={{ myEdge: MyEdgeComponent }}
  snapToGrid={true}
  snapGrid={[16, 16]}
  fitView={true}
  showMiniMap={true}
  showBackground={true}
  minZoom={0.1}
  maxZoom={4}
>
  {/* Toolbar or overlays rendered as children */}
</KGraphCanvas>
```

### `Handle`

Connection handle placed inside custom node components. Handles register their position automatically.

```tsx
import { Handle } from '../kgraph';

function MyNode({ id, data, selected }: NodeComponentProps) {
  return (
    <div>
      <Handle id="target-1" type="target" position="top" />
      <span>{data.label}</span>
      <Handle id="source-4" type="source" position="bottom" />
    </div>
  );
}
```

**Handle ID convention:** `target-1` (top), `target-2` (left), `target-3` (right), `target-4` (bottom). Same pattern for `source-*`.

### `EdgeLabel`

Renders HTML content at a point along an edge. Scales inversely with zoom to maintain consistent screen size.

```tsx
import { EdgeLabel, getBezierPath } from '../kgraph';

function MyEdge({ sourceX, sourceY, targetX, targetY, ... }: EdgeComponentProps) {
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, ... });
  return (
    <>
      <path d={path} stroke="#fff" fill="none" />
      <foreignObject>
        <EdgeLabel x={labelX} y={labelY} zoom={zoom}>
          <span>Edge Label</span>
        </EdgeLabel>
      </foreignObject>
    </>
  );
}
```

## Hooks

### `useKGraph()`

Public hook for viewport controls. Available inside `KGraphCanvas` children.

```ts
const {
  fitView,              // (options?: { padding?: number }) => void
  zoomIn,               // () => void
  zoomOut,              // () => void
  zoomTo,               // (level: number) => void
  getViewport,          // () => KGraphViewport
  setViewport,          // React.Dispatch<SetStateAction<KGraphViewport>>
  screenToCanvasPosition, // (screenX, screenY) => { x, y }
  getNodes,             // () => KGraphNode[]
  getEdges,             // () => KGraphEdge[]
} = useKGraph();
```

### `useKGraphContext()`

Internal context hook exposing the full provider value. Use this when you need access to `containerRef`, handle registration, or `canvasToScreenPosition`.

```ts
const {
  viewport,
  containerRef,           // React.RefObject<HTMLDivElement>
  registerHandle,
  unregisterHandle,
  getHandlePosition,
  getAllHandles,
  canvasToScreenPosition, // (canvasX, canvasY) => { x, y }
  nodes,
  edges,
  // ...plus everything from useKGraph()
} = useKGraphContext();
```

## Props Reference — `KGraphCanvasProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `KGraphNode[]` | required | Array of node objects |
| `edges` | `KGraphEdge[]` | required | Array of edge objects |
| `onNodesChange` | `(changes: NodeChange[]) => void` | — | Callback for node mutations |
| `onEdgesChange` | `(changes: EdgeChange[]) => void` | — | Callback for edge mutations |
| `onConnect` | `(connection: KGraphConnection) => void` | — | Called when a new connection is drawn |
| `onNodeClick` | `(event, node) => void` | — | Node click handler |
| `onEdgeClick` | `(event, edge) => void` | — | Edge click handler |
| `onPaneClick` | `(event) => void` | — | Background click handler |
| `onDrop` | `(event, position) => void` | — | Drop handler (receives canvas coordinates) |
| `onDragOver` | `(event) => void` | — | Drag-over handler |
| `nodeTypes` | `Record<string, ComponentType<NodeComponentProps>>` | `{}` | Custom node component map |
| `edgeTypes` | `Record<string, ComponentType<EdgeComponentProps>>` | `{}` | Custom edge component map |
| `snapToGrid` | `boolean` | `true` | Snap node positions to grid |
| `snapGrid` | `[number, number]` | `[16, 16]` | Grid cell size `[x, y]` |
| `panOnDrag` | `boolean` | `true` | Enable canvas panning |
| `zoomOnScroll` | `boolean` | `true` | Enable zoom via scroll/pinch |
| `nodesDraggable` | `boolean` | `true` | Allow node dragging |
| `nodesConnectable` | `boolean` | `true` | Allow drawing connections |
| `elementsSelectable` | `boolean` | `true` | Allow selecting nodes/edges |
| `fitView` | `boolean` | `false` | Auto-fit on mount |
| `showMiniMap` | `boolean` | `true` | Show minimap overlay |
| `showBackground` | `boolean` | `true` | Show dot grid background |
| `backgroundGap` | `number` | `32` | Dot grid spacing |
| `minZoom` | `number` | `0.1` | Minimum zoom level |
| `maxZoom` | `number` | `4` | Maximum zoom level |
| `className` | `string` | `''` | CSS class for canvas container |
| `style` | `CSSProperties` | `{}` | Inline styles for canvas container |
| `children` | `ReactNode` | — | Toolbar/overlay content |

## Types

### `KGraphNode`

```ts
interface KGraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  selected?: boolean;
  dragging?: boolean;
  hidden?: boolean;
  width?: number;   // auto-measured via ResizeObserver
  height?: number;  // auto-measured via ResizeObserver
}
```

### `KGraphEdge`

```ts
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
```

### `KGraphConnection`

```ts
interface KGraphConnection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

### `KGraphViewport`

```ts
interface KGraphViewport {
  x: number;   // translate X (pixels)
  y: number;   // translate Y (pixels)
  zoom: number; // scale factor
}
```

### `NodeComponentProps`

Props received by custom node components:

```ts
interface NodeComponentProps {
  id: string;
  data: Record<string, any>;
  selected: boolean;
  type: string;
}
```

### `EdgeComponentProps`

Props received by custom edge components:

```ts
interface EdgeComponentProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: HandlePosition;
  targetPosition: HandlePosition;
  selected: boolean;
  style?: React.CSSProperties;
}
```

### `HandlePosition`

```ts
type HandlePosition = 'top' | 'right' | 'bottom' | 'left';
```

### `HandleType`

```ts
type HandleType = 'source' | 'target';
```

### Change types

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

## Utilities

### `getBezierPath(options)`

Computes a cubic bezier path between two handle positions. Returns `[pathString, labelX, labelY, offsetX, offsetY]`.

```ts
const [path, labelX, labelY] = getBezierPath({
  sourceX: 100,
  sourceY: 200,
  sourcePosition: 'bottom',
  targetX: 300,
  targetY: 50,
  targetPosition: 'top',
  curvature: 0.25,  // optional, default 0.25
});
```

### `applyNodeChanges(changes, nodes)`

Immutably applies an array of `NodeChange` objects to a nodes array. Handles position, select, remove, add, and dimensions changes.

```ts
const updatedNodes = applyNodeChanges(changes, nodes);
```

### `applyEdgeChanges(changes, edges)`

Immutably applies an array of `EdgeChange` objects to an edges array. Handles select, remove, and add changes.

```ts
const updatedEdges = applyEdgeChanges(changes, edges);
```

## Custom Node Components

Custom nodes receive `NodeComponentProps` and render any JSX. Use `Handle` components to define connection points.

```tsx
import { Handle } from '../kgraph';
import type { NodeComponentProps } from '../kgraph';

const MyNode: React.FC<NodeComponentProps> = ({ id, data, selected }) => (
  <div className={`p-4 border ${selected ? 'border-blue-500' : 'border-gray-600'}`}>
    <Handle id="target-1" type="target" position="top" />
    <h3>{data.title}</h3>
    <p>{data.description}</p>
    <Handle id="source-4" type="source" position="bottom" />
  </div>
);

// Register in nodeTypes:
<KGraphCanvas nodeTypes={{ myNode: MyNode }} ... />
```

## Custom Edge Components

Custom edges receive `EdgeComponentProps` with pre-computed source/target coordinates.

```tsx
import { getBezierPath } from '../kgraph';
import type { EdgeComponentProps } from '../kgraph';

const MyEdge: React.FC<EdgeComponentProps> = ({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected,
}) => {
  const [path] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <g>
      <path d={path} fill="none" stroke={selected ? '#fff' : '#666'} strokeWidth={2} />
    </g>
  );
};

// Register in edgeTypes:
<KGraphCanvas edgeTypes={{ default: MyEdge }} ... />
```

## Export (PNG/SVG)

The `StudioToolbar` includes PNG and SVG export buttons. These use `html-to-image` to capture the canvas container, filtering out UI overlays (minimap, toolbar, background). Exported files use the canvas background color (`#0e0e10`) and download with a timestamped filename.

To implement export in your own toolbar:

```tsx
import { useKGraphContext } from '../kgraph';
import { toPng, toSvg } from 'html-to-image';

function ExportButton() {
  const { containerRef } = useKGraphContext();

  const handleExport = () => {
    const el = containerRef.current;
    if (!el) return;

    toPng(el, {
      backgroundColor: '#0e0e10',
      filter: (node: HTMLElement) => {
        const cl = node.classList;
        if (!cl) return true;
        if (cl.contains('kgraph-minimap')) return false;
        if (cl.contains('kgraph-background')) return false;
        return true;
      },
    }).then((dataUrl) => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `graph-${Date.now()}.png`;
      a.click();
    });
  };

  return <button onClick={handleExport}>Export PNG</button>;
}
```
