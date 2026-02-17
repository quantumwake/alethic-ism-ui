# Midnight Lab Theme Standardization Plan

## Overview
This document outlines the comprehensive plan to standardize all UI components with the Midnight Lab theme, ensuring a consistent look and feel across the entire application based on the CustomStudio design patterns.

---

## Design System Reference (Based on CustomStudio)

### Color Palette (from tailwind.config.js)
```
midnight-base: #16161e       (Main background)
midnight-surface: #1c1c2c    (Card/panel backgrounds)
midnight-elevated: #24243a   (Hover states, elevated surfaces)
midnight-raised: #2e2e50     (Active states, raised elements)

midnight-border: #2a2a45     (Default borders)
midnight-border-subtle: #3a4a70
midnight-border-glow: #5070a0

midnight-text-primary: #ffffff
midnight-text-secondary: #e8e8f8
midnight-text-body: #c0c0e0
midnight-text-muted: #9090c0
midnight-text-subdued: #6868a8

midnight-danger: #ef4444 / bright: #f87171
midnight-warning: #f59e0b / bright: #fbbf24
midnight-success: #10b981 / bright: #34d399
midnight-info: #3b82f6 / bright: #60a5fa
midnight-accent: #8b5cf6 / bright: #a78bfa
```

### Standard Component Patterns (from CustomStudio)

#### Buttons
```jsx
// Primary action
className="p-1.5 rounded-md bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white transition-colors"

// Secondary action
className="p-1.5 rounded-md bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"

// Danger action
className="p-1.5 rounded-md bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white transition-colors"

// Accent action
className="p-1.5 rounded-md bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"

// Warning action
className="p-1.5 rounded-md bg-amber-900/30 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"
```

#### Panels/Cards
```jsx
className="bg-midnight-surface/90 backdrop-blur-sm border border-midnight-border rounded-md shadow-lg"
```

#### Node Styling
```jsx
// Container
className="w-52 min-h-[100px] px-3 py-2 rounded-lg relative bg-gradient-to-br from-{color}/30 via-midnight-elevated to-midnight-surface border-2 border-midnight-border transition-all duration-200"

// Selected state
className="border-{color}-bright shadow-midnight-{type}"

// Header
className="flex items-center gap-2 border-b border-midnight-border/50 pb-2 mb-2"
```

#### Handles
```jsx
const handleStyle = {
    width: 10,
    height: 10,
    background: color,
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
};
```

#### Edges
```jsx
// Dashed animated lines with arrows
strokeDasharray: '6 3'
animation: 'flowDash 0.5s linear infinite'
markerEnd with arrow
```

---

## Phase 1: Theme System Enhancement

### 1.1 Update midnightlab.js theme file
**File:** `src/themes/midnightlab.js`

Add missing properties:
- [ ] `selection` - Ring/outline colors for selected elements
- [ ] `resize` - Resize handle colors
- [ ] `edgeStatus` - Status colors for edges (CREATED, QUEUED, RUNNING, COMPLETED, FAILED)
- [ ] `toolbar` - Toolbar button colors matching CustomStudio pattern
- [ ] `node.transform` - Transform node styling
- [ ] `node.function` - Function node styling

### 1.2 Update edge component theme
**File:** `src/themes/midnightlab/components/edge.js`

- [ ] Add status color mappings
- [ ] Add animation classes

---

## Phase 2: Core Common Components (HIGH PRIORITY)

### 2.1 TerminalButton.tsx
**File:** `src/components/common/TerminalButton.tsx`
**Status:** Uses theme
**Action:** Verify button variants match CustomStudio patterns

### 2.2 TerminalDialog.jsx
**File:** `src/components/common/TerminalDialog.jsx`
**Status:** Uses theme
**Action:** Ensure backdrop blur and shadow styles match

### 2.3 TerminalDialogConfirmation.jsx
**File:** `src/components/common/TerminalDialogConfirmation.jsx`
**Status:** Needs review
**Action:** Full review and update

### 2.4 TerminalInput.tsx
**File:** `src/components/common/TerminalInput.tsx`
**Status:** Uses theme
**Action:** Verify input styling consistency

### 2.5 TerminalDropdown.tsx
**File:** `src/components/common/TerminalDropdown.tsx`
**Status:** Uses theme
**Action:** Verify dropdown menu styling

### 2.6 TerminalCheckbox.jsx
**File:** `src/components/common/TerminalCheckbox.jsx`
**Status:** Uses theme
**Action:** Verify checkbox colors

### 2.7 TerminalToggle.jsx
**File:** `src/components/common/TerminalToggle.jsx`
**Status:** Uses theme
**Action:** Verify toggle colors

### 2.8 TerminalSidebar.jsx
**File:** `src/components/common/TerminalSidebar.jsx`
**Status:** Has hardcoded blue resize handle
**Action:** Replace hardcoded colors with theme properties

### 2.9 TerminalContainer.jsx
**File:** `src/components/common/TerminalContainer.jsx`
**Status:** Uses theme
**Action:** Verify background colors

### 2.10 TerminalHeader.jsx
**File:** `src/components/common/TerminalHeader.jsx`
**Status:** Uses theme
**Action:** Verify styling

### 2.11 TerminalFooter.jsx
**File:** `src/components/common/TerminalFooter.jsx`
**Status:** Uses theme
**Action:** Verify styling

### 2.12 TerminalTabBar.jsx
**File:** `src/components/common/TerminalTabBar.jsx`
**Status:** Uses theme
**Action:** Verify tab styling

### 2.13 TerminalTabView.jsx
**File:** `src/components/common/TerminalTabView.jsx`
**Status:** Uses theme
**Action:** Verify styling

### 2.14 TerminalDataTable.jsx
**File:** `src/components/common/TerminalDataTable.jsx`
**Status:** Uses theme
**Action:** Verify table styling

### 2.15 TerminalDataTable2.jsx
**File:** `src/components/common/TerminalDataTable2.jsx`
**Status:** Needs review
**Action:** Full review and update

### 2.16 TerminalContextMenu.jsx
**File:** `src/components/common/TerminalContextMenu.jsx`
**Status:** Uses theme
**Action:** Verify menu styling matches CustomStudio toolbar

### 2.17 TerminalHoverMenu.jsx
**File:** `src/components/common/TerminalHoverMenu.jsx`
**Status:** Uses theme
**Action:** Verify styling

### 2.18 TerminalNotification.jsx
**File:** `src/components/common/TerminalNotification.jsx`
**Status:** Uses theme
**Action:** Verify notification colors

### 2.19 TerminalSearchBar.jsx
**File:** `src/components/common/TerminalSearchBar.jsx`
**Status:** Needs review
**Action:** Full review and update

### 2.20 TerminalAutocomplete.jsx
**File:** `src/components/common/TerminalAutocomplete.jsx`
**Status:** Needs review
**Action:** Full review and update

### 2.21 TerminalFileInput.jsx
**File:** `src/components/common/TerminalFileInput.jsx`
**Status:** Needs review
**Action:** Full review and update

### 2.22 TerminalFileUpload.jsx
**File:** `src/components/common/TerminalFileUpload.jsx`
**Status:** Needs review
**Action:** Full review and update

### 2.23 TerminalLabel.tsx
**File:** `src/components/common/TerminalLabel.tsx`
**Status:** Uses theme
**Action:** Verify styling

### 2.24 TerminalSection.jsx
**File:** `src/components/common/TerminalSection.jsx`
**Status:** Needs review
**Action:** Full review and update

### 2.25 TerminalInfoButton.jsx
**File:** `src/components/common/TerminalInfoButton.jsx`
**Status:** Needs review
**Action:** Full review and update

### 2.26 TerminalCategoryItem.jsx
**File:** `src/components/common/TerminalCategoryItem.jsx`
**Status:** Needs review
**Action:** Full review and update

### 2.27 TerminalCategorySection.jsx
**File:** `src/components/common/TerminalCategorySection.jsx`
**Status:** Needs review
**Action:** Full review and update

### 2.28 TemplateFieldWithEditor.tsx
**File:** `src/components/common/TemplateFieldWithEditor.tsx`
**Status:** Needs review
**Action:** Full review and update

---

## Phase 3: Canvas/Flow Components (HIGH PRIORITY - HARDCODED COLORS)

### 3.1 TerminalFlowNode.jsx
**File:** `src/components/canvas/TerminalFlowNode.jsx`
**Status:** CRITICAL - All hardcoded grays/blues
**Action:** Replace ALL hardcoded colors with midnight theme classes
- Replace `bg-gray-800` → `bg-midnight-surface`
- Replace `border-gray-700` → `border-midnight-border`
- Replace `border-blue-500` → `border-midnight-info`
- Replace `bg-gray-700` → `bg-midnight-elevated`
- Replace `text-gray-200` → `text-midnight-text-body`
- Replace `bg-gray-600` → `bg-midnight-raised`
- Replace `hover:bg-blue-500` → `hover:bg-midnight-info`

### 3.2 TerminalFlowEdge.jsx
**File:** `src/components/canvas/TerminalFlowEdge.jsx`
**Status:** CRITICAL - Hardcoded SVG stroke color
**Action:** Replace `stroke="#6B7280"` with theme-aware color

### 3.3 TerminalStateNode.jsx
**File:** `src/components/canvas/TerminalStateNode.jsx`
**Status:** Needs review
**Action:** Full review and update to match CustomStudio StateNodeComponent

### 3.4 TerminalFlow.jsx
**File:** `src/components/canvas/TerminalFlow.jsx`
**Status:** Needs review
**Action:** Full review and update

---

## Phase 4: ReactFlow Custom Components - SKIPPED

> **NOTE:** These components will be deprecated and replaced by CustomStudio flow editor.
> No updates needed.

- ~~CustomEdge.tsx~~
- ~~CustomConnectionLine.jsx~~

---

## Phase 5: Node Components (HIGH PRIORITY)

### 5.1 BaseNode.jsx
**File:** `src/nodes/base/BaseNode.jsx`
**Status:** Has hardcoded blue ring for selection
**Action:** Replace `ring-blue-500` with theme selection color

### 5.2 BaseStateNode.jsx
**File:** `src/nodes/base/BaseStateNode.jsx`
**Status:** Needs review
**Action:** Match styling to CustomStudio StateNodeComponent

### 5.3 BaseProcessorNode.jsx
**File:** `src/nodes/base/BaseProcessorNode.jsx`
**Status:** CRITICAL - Hardcoded purple colors
**Action:** Replace ALL hardcoded colors with theme properties

### 5.4 BaseProcessorLanguageNode.jsx
**File:** `src/nodes/base/BaseProcessorLanguageNode.jsx`
**Status:** Needs review
**Action:** Full review and update

### 5.5 StateNode.jsx
**File:** `src/nodes/StateNode.jsx`
**Status:** Needs review
**Action:** Verify delegation to BaseStateNode is correct

### 5.6 ProcessorNodeOpenAI.jsx
**File:** `src/nodes/ProcessorNodeOpenAI.jsx`
**Action:** Verify styling matches CustomStudio ProcessorNodeComponent

### 5.7 ProcessorNodeAnthropic.jsx
**File:** `src/nodes/ProcessorNodeAnthropic.jsx`
**Action:** Verify styling

### 5.8 ProcessorNodeGoogleAI.jsx
**File:** `src/nodes/ProcessorNodeGoogleAI.jsx`
**Action:** Verify styling

### 5.9 ProcessorNodeMistral.jsx
**File:** `src/nodes/ProcessorNodeMistral.jsx`
**Action:** Verify styling

### 5.10 ProcessorNodeLlama.jsx
**File:** `src/nodes/ProcessorNodeLlama.jsx`
**Action:** Verify styling

### 5.11 ProcessorNodePython.jsx
**File:** `src/nodes/ProcessorNodePython.jsx`
**Action:** Verify styling

### 5.12 ProcessorNodeProvider.jsx
**File:** `src/nodes/ProcessorNodeProvider.jsx`
**Action:** Verify styling

### 5.13 ProcessorNodeDatabase.jsx
**File:** `src/nodes/ProcessorNodeDatabase.jsx`
**Action:** Verify styling

### 5.14 ProcessorNodeTransformCoalescer.jsx
**File:** `src/nodes/ProcessorNodeTransformCoalescer.jsx`
**Action:** Match styling to CustomStudio TransformNodeComponent

### 5.15 ProcessorNodeTransformComposite.jsx
**File:** `src/nodes/ProcessorNodeTransformComposite.jsx`
**Action:** Match styling to CustomStudio TransformNodeComponent

### 5.16 ProcessorNodeVisualOpenAI.jsx
**File:** `src/nodes/ProcessorNodeVisualOpenAI.jsx`
**Action:** Verify styling

### 5.17 TrainerNode.jsx
**File:** `src/nodes/TrainerNode.jsx`
**Action:** Full review and update

### 5.18 FunctionNodeUserInteraction.jsx
**File:** `src/nodes/FunctionNodeUserInteraction.jsx`
**Action:** Match styling to CustomStudio FunctionNodeComponent

### 5.19 FunctionNodeDataSourceSQL.jsx
**File:** `src/nodes/FunctionNodeDataSourceSQL.jsx`
**Action:** Match styling to CustomStudio FunctionNodeComponent

---

## Phase 6: ISM Components

### 6.1 TerminalEdgeFunctionDialog.tsx
**File:** `src/components/ism/TerminalEdgeFunctionDialog.tsx`
**Status:** Has hardcoded text colors (green-400, yellow-400, red-400)
**Action:** Replace with theme status colors

### 6.2 TerminalTemplateEditor.tsx
**File:** `src/components/ism/TerminalTemplateEditor.tsx`
**Status:** Uses hardcoded "vs-dark" Monaco theme
**Action:** Consider creating midnight lab Monaco theme

### 6.3 TerminalSyslog.jsx
**File:** `src/components/ism/TerminalSyslog.jsx`
**Status:** Uses theme
**Action:** Verify styling

### 6.4 TerminalStateDataTable.jsx
**File:** `src/components/ism/TerminalStateDataTable.jsx`
**Status:** Uses theme
**Action:** Verify styling

### 6.5 TerminalStateFilterDialog.tsx
**File:** `src/components/ism/TerminalStateFilterDialog.tsx`
**Action:** Full review and update

### 6.6 TerminalStateImportHgDialog.jsx
**File:** `src/components/ism/TerminalStateImportHgDialog.jsx`
**Action:** Full review and update

### 6.7 TerminalStateExportDialog.jsx
**File:** `src/components/ism/TerminalStateExportDialog.jsx`
**Action:** Full review and update

### 6.8 TerminalStateUploadDialog.jsx
**File:** `src/components/ism/TerminalStateUploadDialog.jsx`
**Action:** Full review and update

### 6.9 TerminalErrorsDialog.jsx
**File:** `src/components/ism/TerminalErrorsDialog.jsx`
**Action:** Full review and update

### 6.10 TerminalFileRenameDialog.jsx
**File:** `src/components/ism/TerminalFileRenameDialog.jsx`
**Action:** Full review and update

### 6.11 TerminalProjectCloneDialog.jsx
**File:** `src/components/ism/TerminalProjectCloneDialog.jsx`
**Action:** Full review and update

### 6.12 TerminalUsageReport.jsx
**File:** `src/components/ism/TerminalUsageReport.jsx`
**Action:** Verify uses theme.usageReport properties

### 6.13 TerminalStreamDebug.jsx
**File:** `src/components/ism/TerminalStreamDebug.jsx`
**Action:** Full review and update

### 6.14 TerminalUserMenu.jsx
**File:** `src/components/ism/TerminalUserMenu.jsx`
**Action:** Full review and update

### 6.15 TerminalNewFileDialog.jsx
**File:** `src/components/ism/TerminalNewFileDialog.jsx`
**Action:** Full review and update

### 6.16 TerminalTemplateEditorContainer.tsx
**File:** `src/components/ism/TerminalTemplateEditorContainer.tsx`
**Action:** Full review and update

### Edge Function Components:
### 6.17 CalibratorConfig.tsx
**File:** `src/components/ism/edge-function/CalibratorConfig.tsx`
**Action:** Full review and update

### 6.18 ValidatorConfig.tsx
**File:** `src/components/ism/edge-function/ValidatorConfig.tsx`
**Action:** Full review and update

### 6.19 TransformerConfig.tsx
**File:** `src/components/ism/edge-function/TransformerConfig.tsx`
**Action:** Full review and update

### 6.20 FilterConfig.tsx
**File:** `src/components/ism/edge-function/FilterConfig.tsx`
**Action:** Full review and update

---

## Phase 7: Tab Components

### 7.1 PropertyTab.jsx
**File:** `src/tabs/PropertyTab.jsx`
**Status:** Uses theme
**Action:** Verify styling

### 7.2 ProjectTab.jsx
**File:** `src/tabs/ProjectTab.jsx`
**Action:** Full review and update

### 7.3 ComponentTab.jsx
**File:** `src/tabs/ComponentTab.jsx`
**Action:** Full review and update

### 7.4 ComponentTab2.jsx
**File:** `src/tabs/ComponentTab2.jsx`
**Action:** Full review and update - ensure drag items match midnight style

### 7.5 MenuTab.jsx
**File:** `src/tabs/MenuTab.jsx`
**Action:** Full review and update

### 7.6 ProjectFileTab.jsx
**File:** `src/tabs/ProjectFileTab.jsx`
**Action:** Full review and update

### 7.7 AIAssistantTab.jsx
**File:** `src/tabs/AIAssistantTab.jsx`
**Action:** Full review and update

### Property Sub-components:
### 7.8 ProcessorPropertyTab.jsx
**File:** `src/tabs/property/ProcessorPropertyTab.jsx`
**Action:** Full review and update

### 7.9 EdgePropertyTab.jsx
**File:** `src/tabs/property/EdgePropertyTab.jsx`
**Action:** Full review and update

### 7.10 StatePropertyTab.jsx
**File:** `src/tabs/property/StatePropertyTab.jsx`
**Status:** Uses theme
**Action:** Verify styling

### 7.11 ProcessorBaseConfig.jsx
**File:** `src/tabs/property/processor/ProcessorBaseConfig.jsx`
**Action:** Full review and update

### 7.12 ProcessorLLMConfig.jsx
**File:** `src/tabs/property/processor/ProcessorLLMConfig.jsx`
**Action:** Full review and update

### 7.13 ProcessorStateTablesConfig.jsx
**File:** `src/tabs/property/processor/ProcessorStateTablesConfig.jsx`
**Action:** Full review and update

### 7.14 ProcessorJoinConfig.jsx
**File:** `src/tabs/property/processor/ProcessorJoinConfig.jsx`
**Action:** Full review and update

### 7.15 StateColumns.jsx
**File:** `src/tabs/property/state/StateColumns.jsx`
**Action:** Full review and update

### 7.16 StateColumnOrderDialog.jsx
**File:** `src/tabs/property/state/StateColumnOrderDialog.jsx`
**Action:** Full review and update

### 7.17 StateConfigDataKeyDefinition.jsx
**File:** `src/tabs/property/state/StateConfigDataKeyDefinition.jsx`
**Action:** Full review and update

---

## Phase 8: Studio Components

### 8.1 CustomStudio.tsx (in components/studio)
**File:** `src/components/studio/CustomStudio.tsx`
**Action:** This is the REFERENCE implementation - verify it uses midnight colors

### 8.2 CustomStudioDemo.tsx
**File:** `src/components/studio/CustomStudioDemo.tsx`
**Action:** Full review and update

### 8.3 CustomStudioWrapper.tsx
**File:** `src/components/studio/CustomStudioWrapper.tsx`
**Action:** Full review and update

---

## Phase 9: Main Layout Components

### 9.1 Layout.jsx
**File:** `src/Layout.jsx`
**Action:** Verify all layout elements use theme

### 9.2 Studio.tsx
**File:** `src/Studio.tsx`
**Action:** Verify styling matches CustomStudio.jsx

### 9.3 CustomStudio.jsx (main)
**File:** `src/CustomStudio.jsx`
**Status:** REFERENCE - This is the target look and feel
**Action:** This is already done - use as reference

---

## Phase 10: ISMQL Components

### 10.1 IsmQL.jsx
**File:** `src/components/ismql/IsmQL.jsx`
**Action:** Full review and update

---

## Implementation Order

### Week 1: Foundation
1. Update midnightlab.js theme with missing properties
2. Fix Phase 3 canvas components (hardcoded colors)
3. Fix Phase 4 ReactFlow components (CustomEdge.tsx)

### Week 2: Node System
4. Fix Phase 5 node components (BaseNode, BaseProcessorNode)
5. Update all processor node variants
6. Update state and function nodes

### Week 3: Common Components
7. Review and update all Phase 2 common components
8. Ensure consistent button, input, dropdown styling

### Week 4: ISM & Tab Components
9. Update Phase 6 ISM components
10. Update Phase 7 tab components

### Week 5: Final Polish
11. Update remaining studio components
12. Full integration testing
13. Visual QA across all views

---

## Testing Checklist

For each component updated:
- [ ] Verify background colors use midnight-base/surface/elevated/raised
- [ ] Verify text colors use midnight-text-* hierarchy
- [ ] Verify border colors use midnight-border variants
- [ ] Verify hover states use midnight-elevated
- [ ] Verify selected states use appropriate accent colors
- [ ] Verify status colors (danger/warning/success/info) are consistent
- [ ] Verify transitions are smooth (200ms default)
- [ ] Verify backdrop blur is applied where appropriate
- [ ] Verify shadows use midnight-glow variants
- [ ] Test in both light areas and dark areas of the UI

---

## Notes

- The CustomStudio.jsx file is the REFERENCE implementation
- All components should match its look and feel
- Theme colors from tailwind.config.js must be used consistently
- Avoid hardcoded hex colors - use Tailwind classes
- Status colors should use theme.status.* properties
- Button colors should follow the /30 opacity background pattern

---

## Progress Tracking

| Phase | Component Count | Completed | Status |
|-------|----------------|-----------|--------|
| 1     | 2              | 2         | DONE |
| 2     | 28             | 3         | In Progress |
| 3     | 4              | 4         | DONE |
| 4     | ~~2~~          | -         | SKIPPED |
| 5     | 19             | 4         | In Progress |
| 6     | 20             | 5         | In Progress |
| 7     | 17             | 7         | In Progress |
| 8     | 3              | 0         | Not Started |
| 9     | 3              | 5         | In Progress |
| 10    | 1              | 0         | Not Started |
| **Total** | **97**     | **30**    | **31%** |

### Completed Components:
- **Phase 1:** midnightlab.js theme enhanced with nodes/toolbar/selection/edgeStatus
- **Phase 2:** TerminalSidebar.jsx (resize handle colors), TerminalTabView.jsx
- **Phase 3:** TerminalFlowNode.jsx, TerminalFlowEdge.jsx, TerminalStateNode.jsx, TerminalFlow.jsx
- **Phase 5:** BaseNode.jsx, BaseProcessorNode.jsx, BaseStateNode.jsx, ProcessorNodeMistral.jsx
- **Phase 6:** TerminalEdgeFunctionDialog.tsx, TerminalUsageReport.jsx, TerminalStateFilterDialog.tsx, TerminalStateDataTable.jsx, EdgePropertyTab.jsx
- **Phase 7:** ComponentTab2.jsx (verified), AIAssistantTab.jsx, Topbar.jsx, processors.jsx, Layout.jsx, PropertyTab.jsx
- **Phase 9:** Login.jsx, SignupBasic.jsx, NewProjectDialog.jsx, ProjectTemplateDialog.jsx, ProjectTemplateInfo.jsx, DiscourseChannel.jsx
