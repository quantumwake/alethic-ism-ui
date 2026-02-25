# KGraph TODO

## Backend Persistence for Node Groups

Currently, group membership is stored in `node.data.metadata.group` and group definitions (`name`, `color`) live only in the Zustand store (hydrated on load from whatever metadata exists on nodes). This works for basic usage but has limitations:

### What's needed

- **`workflow_node_groups` table** — stores group definitions with columns like:
  - `group_id` (PK)
  - `project_id` (FK)
  - `group_name`
  - `group_color`
  - `is_collapsed` (default view state)
  - `created_at` / `updated_at`

- **`group_id` column on `workflow_nodes`** — proper FK instead of piggybacking on the metadata JSON blob. This makes queries like "get all nodes in group X" a simple WHERE clause instead of JSON parsing.

- **API endpoints:**
  - `POST /workflow/group/create` — create a group definition
  - `PUT /workflow/group/{group_id}` — update name/color/collapsed
  - `DELETE /workflow/group/{group_id}` — delete group (clears group_id on member nodes)
  - `GET /project/{project_id}/workflow/groups` — list all groups for a project
  - `PUT /workflow/node/{node_id}/group` — assign/remove a node from a group

- **Store changes:**
  - `createGroup` → call backend to create group + assign nodes
  - `deleteGroup` → call backend
  - `fetchWorkflowNodes` → also fetch groups via dedicated endpoint instead of hydrating from metadata
  - `toggleGroupCollapse` → persist collapsed state to backend

### Why later

The current metadata-based approach works for a single session and even survives reloads (metadata is persisted via the existing `updateNode` flow). The main gaps are:
- No dedicated color/name persistence (hydration guesses names from group IDs)
- Collapse state is ephemeral (resets on reload)
- No multi-user consistency
