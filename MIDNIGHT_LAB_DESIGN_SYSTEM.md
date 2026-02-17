# Midnight Lab Design System

> **Reference Document for Consistent UI Styling**
> A professional, refined dark theme with subtle depth and polish

---

## Design Principles

1. **Visual Hierarchy** - Clear distinction between header, content, and footer
2. **Depth & Layering** - Use shadows and backgrounds to create depth
3. **Consistent Spacing** - Generous padding and margins for breathing room
4. **Smooth Transitions** - 200ms transitions on all interactive elements
5. **Subtle Glows** - Accent glows for focus states and selections
6. **Backdrop Blur** - Frosted glass effect for overlays and floating elements

---

## Color System

### Background Colors (Lightened for Comfort)
| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| Base | `bg-midnight-base` | #1e1e2e | Main app/canvas background |
| Surface | `bg-midnight-surface` | #262640 | Cards, panels, sidebars |
| Elevated | `bg-midnight-elevated` | #303052 | Headers, elevated surfaces |
| Raised | `bg-midnight-raised` | #3a3a62 | Active states, hover states |

### Text Colors
| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| Primary | `text-midnight-text-primary` | Headers, titles, important text |
| Secondary | `text-midnight-text-secondary` | Regular body text |
| Body | `text-midnight-text-body` | Default content text |
| Muted | `text-midnight-text-muted` | Secondary information |
| Subdued | `text-midnight-text-subdued` | Hints, placeholders |
| Label | `text-midnight-text-label` | Form labels |
| Disabled | `text-midnight-text-disabled` | Disabled elements |

### Border Colors (Adjusted for Lighter Backgrounds)
| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| Default | `border-midnight-border` | #3a3a5a | Standard borders |
| Subtle | `border-midnight-border-subtle` | #4a5a80 | Subtle separators |
| Glow | `border-midnight-border-glow` | #6080b0 | Hover/focus borders |

### Semantic Colors
| Status | Base | Bright | Usage |
|--------|------|--------|-------|
| Success | `midnight-success` | `midnight-success-bright` | States, confirmations |
| Info | `midnight-info` | `midnight-info-bright` | Processors, information |
| Warning | `midnight-warning` | `midnight-warning-bright` | Caution states |
| Danger | `midnight-danger` | `midnight-danger-bright` | Errors, destructive actions |
| Accent | `midnight-accent` | `midnight-accent-bright` | Highlights, transforms |

---

## Component Patterns

### Buttons

#### Toolbar/Action Buttons (Small)
```jsx
// Success/Play action
className="p-1.5 rounded-md bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white transition-colors"

// Info/Filter action
className="p-1.5 rounded-md bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"

// Accent/Settings action
className="p-1.5 rounded-md bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"

// Warning/Caution action
className="p-1.5 rounded-md bg-amber-900/30 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"

// Danger/Delete action
className="p-1.5 rounded-md bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white transition-colors"

// Cyan/Export action
className="p-1.5 rounded-md bg-cyan-900/30 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-colors"
```

#### Standard Buttons (via theme)
```jsx
// Primary
className={theme.button.primary}
// "bg-midnight-info hover:bg-midnight-info-bright hover:shadow-midnight-info text-white border border-midnight-info-bright/50 transition-all duration-200"

// Secondary
className={theme.button.secondary}
// "bg-midnight-surface hover:bg-midnight-elevated hover:border-midnight-border-glow text-midnight-text-secondary border border-midnight-border transition-all duration-200"

// Danger
className={theme.button.danger}
// "bg-midnight-danger hover:bg-midnight-danger-bright hover:shadow-midnight-danger text-white border border-midnight-danger-bright/50 transition-all duration-200"

// Ghost
className={theme.button.ghost}
// "bg-transparent hover:bg-midnight-elevated hover:text-midnight-accent-bright text-midnight-text-body border border-midnight-border transition-all duration-200"
```

### Panels & Cards

#### Floating Panel/Toolbar
```jsx
className="bg-midnight-surface/90 backdrop-blur-sm border border-midnight-border rounded-md shadow-lg"
```

#### Card
```jsx
className="bg-midnight-surface border border-midnight-border shadow-midnight-glow-sm rounded-lg"
```

#### Dialog Overlay
```jsx
className="fixed inset-0 bg-black/60 backdrop-blur-sm"
```

#### Dialog Content
```jsx
className="bg-midnight-surface border border-midnight-border rounded-lg shadow-midnight-glow"
```

### Inputs

#### Text Input
```jsx
className="bg-midnight-base border border-midnight-border rounded-md px-3 py-2 text-midnight-text-body focus:border-midnight-info focus:ring-1 focus:ring-midnight-info/50 transition-colors"
```

#### Select/Dropdown
```jsx
// Trigger
className="bg-midnight-surface hover:bg-midnight-elevated border border-midnight-border rounded-md px-3 py-2 text-midnight-text-body transition-colors"

// Content
className="bg-midnight-surface border border-midnight-border shadow-midnight-glow rounded-md"

// Item
className="px-3 py-2 text-midnight-text-body hover:bg-midnight-elevated hover:text-midnight-accent-bright cursor-pointer transition-colors"
```

### Nodes (Flow Editor)

#### Container Pattern
```jsx
className={`
    w-52 min-h-[100px] px-3 py-2 rounded-lg relative
    bg-gradient-to-br from-{color}/30 via-midnight-elevated to-midnight-surface
    border-2 ${selected ? 'border-{color}-bright shadow-midnight-{type}' : 'border-midnight-border'}
    transition-all duration-200
`}
```

#### State Node (Green)
```jsx
from-midnight-success/30
border-midnight-success-bright (selected)
shadow-midnight-success (selected)
icon: text-midnight-success-bright
```

#### Processor Node (Blue)
```jsx
from-midnight-info/30
border-midnight-info-bright (selected)
shadow-midnight-info (selected)
icon: text-midnight-info-bright
```

#### Transform Node (Purple)
```jsx
from-midnight-accent/30
border-midnight-accent-bright (selected)
shadow-midnight-glow (selected)
icon: text-midnight-accent-bright
```

#### Function Node (Amber)
```jsx
from-midnight-warning/30
border-midnight-warning-bright (selected)
shadow-midnight-glow (selected)
icon: text-midnight-warning-bright
```

#### Node Header
```jsx
className="flex items-center gap-2 border-b border-midnight-border/50 pb-2 mb-2"
// Icon
className="w-4 h-4 text-{node-color}-bright flex-shrink-0"
// Title
className="text-{node-color}-bright font-semibold text-xs uppercase tracking-wide truncate"
```

### Handles (Node Connectors)
```jsx
const handleStyle = {
    width: 10,
    height: 10,
    background: color,
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
};
```

### Edges

#### Edge Line
```jsx
stroke={strokeColor}
strokeWidth={selected ? 2.5 : (isHovered ? 2 : 1.5)}
strokeDasharray="6 3"  // Dashed line
```

#### Edge Animation (when active)
```css
animation: flowDash 0.5s linear infinite;

@keyframes flowDash {
    to { stroke-dashoffset: -8; }
}
```

#### Arrow Marker
```jsx
<marker
    id={`arrow-${id}`}
    viewBox="0 0 10 10"
    refX="8"
    refY="5"
    markerWidth="6"
    markerHeight="6"
    orient="auto-start-reverse"
>
    <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
</marker>
```

### Toolbars (Hover Menus)

#### Node/Edge Toolbar
```jsx
className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-midnight-surface/95 backdrop-blur-sm border border-midnight-border rounded-md shadow-lg z-10"
```

#### Toolbar on Edge (Centered)
```jsx
style={{
    position: 'absolute',
    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
    pointerEvents: 'all',
}}
className="nodrag nopan"
```

### Tabs

#### Tab Bar
```jsx
className="flex border-b border-midnight-border"
```

#### Tab Button (Inactive)
```jsx
className="px-4 py-2 text-midnight-text-muted hover:text-midnight-text-secondary hover:bg-midnight-elevated transition-colors"
```

#### Tab Button (Active)
```jsx
className="px-4 py-2 text-midnight-accent-bright border-b-2 border-midnight-accent bg-midnight-elevated"
```

### Tables

#### Table Header
```jsx
className="bg-midnight-elevated hover:bg-midnight-raised border-b border-r border-midnight-border px-2 py-2 text-left text-midnight-text-label transition-colors duration-150"
```

#### Table Row
```jsx
className="border-b border-midnight-border hover:bg-midnight-elevated transition-colors"
```

#### Table Cell
```jsx
className="px-2 py-2 text-midnight-text-body"
```

---

## Spacing

| Size | Class | Value |
|------|-------|-------|
| XS | `p-1` / `gap-1` | 0.25rem |
| SM | `p-2` / `gap-2` | 0.5rem |
| Base | `p-3` / `gap-3` | 0.75rem |
| LG | `p-4` / `gap-4` | 1rem |

---

## Typography

### Font Family
```jsx
className="font-ibm-plex"  // IBM Plex Mono
```

### Font Sizes
| Size | Class |
|------|-------|
| XS | `text-xs` |
| SM | `text-sm` |
| Base | `text-base` |
| LG | `text-lg` |

### Text Patterns
```jsx
// Section header
className="text-midnight-text-primary font-semibold text-sm"

// Label
className="text-midnight-text-label text-xs uppercase tracking-wide"

// Body text
className="text-midnight-text-body text-sm"

// Muted/hint text
className="text-midnight-text-subdued text-xs"
```

---

## Shadows

| Name | Class | Usage |
|------|-------|-------|
| Glow | `shadow-midnight-glow` | Dialogs, floating panels |
| Glow SM | `shadow-midnight-glow-sm` | Cards, smaller elements |
| Glow LG | `shadow-midnight-glow-lg` | Large prominent elements |
| Danger | `shadow-midnight-danger` | Error states |
| Success | `shadow-midnight-success` | Success states |
| Info | `shadow-midnight-info` | Info/active states |

---

## Transitions

### Standard Transition
```jsx
className="transition-all duration-200"
```

### Color-only Transition
```jsx
className="transition-colors duration-150"
```

---

## Status Colors (for dynamic states)

### Edge/Process Status
| Status | Color |
|--------|-------|
| CREATED | `#9ca3af` (gray-400) |
| QUEUED | `#4b5563` (gray-600) |
| ROUTE | `#eab308` (yellow-500) |
| ROUTED | `#f59e0b` (amber-500) |
| RUNNING | `#3b82f6` (blue-500) |
| COMPLETED | `#22c55e` (green-500) |
| FAILED | `#ef4444` (red-500) |
| DEFAULT | `#8b5cf6` (violet-500) |

---

## Icon Sizes

| Size | Class |
|------|-------|
| SM | `w-3.5 h-3.5` | Toolbar buttons |
| Base | `w-4 h-4` | Standard icons |
| MD | `w-5 h-5` | Emphasis icons |
| LG | `w-6 h-6` | Large icons |

---

## Z-Index Layers

| Layer | Value | Usage |
|-------|-------|-------|
| Base | 0 | Normal content |
| Elevated | 10 | Floating toolbars |
| Dropdown | 20 | Dropdown menus |
| Modal | 30 | Dialogs |
| Overlay | 40 | Backdrops |
| Toast | 50 | Notifications |

---

## Layout Components

### Header
```jsx
className={`
    h-14 px-6 flex items-center justify-between
    bg-midnight-elevated/80 backdrop-blur-sm
    border-b border-midnight-border
    shadow-[0_2px_8px_rgba(0,0,0,0.3)]
`}
// Title: text-midnight-text-primary font-semibold tracking-wide
```

### Footer
```jsx
className={`
    h-9 px-6 flex items-center justify-between
    bg-midnight-surface/90 backdrop-blur-sm
    border-t border-midnight-border
    text-xs font-mono text-midnight-text-subdued
`}
```

### Sidebar
```jsx
className={`
    flex bg-midnight-surface/60
    border-r border-midnight-border  // or border-l for right sidebar
`}
```

### Tab Bar
```jsx
className={`
    flex flex-col py-3 gap-1
    bg-midnight-elevated/50
    border-r border-midnight-border
`}
```

### Tab Button
```jsx
// Active state
className="bg-midnight-accent/20 text-midnight-accent-bright shadow-[0_0_12px_rgba(139,92,246,0.3)]"

// Inactive state
className="text-midnight-text-muted hover:text-midnight-text-body hover:bg-midnight-raised/50"

// Common
className="w-10 h-10 mx-auto rounded-lg transition-all duration-200"
```

---

## Do's and Don'ts

### DO
- Use midnight-* color tokens from Tailwind config
- Use theme.* properties when available
- Apply transitions to interactive elements (200ms default)
- Use backdrop-blur on floating elements
- Use /30 opacity for button backgrounds, full color on hover
- Add subtle shadows for depth (`shadow-[0_2px_8px_rgba(0,0,0,0.3)]`)
- Use generous padding (px-6, py-4 for containers)
- Apply rounded corners consistently (rounded-md for buttons, rounded-lg for cards)

### DON'T
- Use hardcoded hex colors (e.g., `#6B7280`)
- Use generic Tailwind colors (e.g., `bg-gray-800`)
- Mix color systems (gray vs midnight)
- Skip hover/focus states
- Use inline styles for colors
- Use `rounded-none` for buttons (use `rounded-md` instead)
- Forget focus rings on interactive elements

---

## Quick Reference: Color Replacements

| Old (Hardcoded) | New (Midnight) |
|-----------------|----------------|
| `bg-gray-800` | `bg-midnight-surface` |
| `bg-gray-700` | `bg-midnight-elevated` |
| `bg-gray-600` | `bg-midnight-raised` |
| `border-gray-700` | `border-midnight-border` |
| `border-blue-500` | `border-midnight-info` |
| `text-gray-200` | `text-midnight-text-body` |
| `text-gray-400` | `text-midnight-text-muted` |
| `hover:bg-blue-500` | `hover:bg-midnight-info` |
| `ring-blue-500` | `ring-midnight-info` |
| `stroke="#6B7280"` | Use theme color variable |
