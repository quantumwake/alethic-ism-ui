# ISM Workflow Assistant — Tool Reference

**44 tools** across 8 categories. All tools execute in the browser via the Zustand store.

---

## Table of Contents

1. [Workflow Tools (10)](#workflow-tools)
2. [State Tools (7)](#state-tools)
3. [Processor Tools (4)](#processor-tools)
4. [Template Tools (5)](#template-tools)
5. [Edge Function Tools (2)](#edge-function-tools)
6. [Data Tools (4)](#data-tools)
7. [Project Tools (4)](#project-tools)
8. [UI Tools (8)](#ui-tools)
9. [Store Action → API Mapping](#store-action--api-mapping)
10. [State Config Types Reference](#state-config-types-reference)
11. [State Flags Reference](#state-flags-reference)
12. [Processor Properties Reference](#processor-properties-reference)
13. [Edge Function Types Reference](#edge-function-types-reference)

---

## Workflow Tools

**Definition file:** `src/tools/definitions/workflow.js`

| # | Tool | Description | Key Parameters | Store Action | API Endpoint | Confirm |
|---|------|-------------|----------------|--------------|-------------|---------|
| 1 | `create_state_node` | Create a new data state node on the canvas | `label`, `position_x?`, `position_y?` | `createStateWithWorkflowNode()` then `authPost('/state/create')` | `POST /workflow/node/create` + `POST /state/create` | No |
| 2 | `create_processor_node` | Create a new processor node with auto-provider assignment | `node_type` (required), `label?`, `provider_id?`, `position_x?`, `position_y?` | `createProcessorWithWorkflowNode()` then `authPost('/processor/create')` | `POST /workflow/node/create` + `POST /processor/create` | No |
| 3 | `delete_node` | Delete a node and its connected edges | `node_id` (required) | `deleteProcessor()` / `deleteState()` / `deleteNode()` | `DELETE /workflow/node/{id}` | **Yes** |
| 4 | `move_node` | Reposition a node on the canvas | `node_id`, `position_x`, `position_y` (all required) | `setWorkflowNodes()` then `updateNode()` | `POST /workflow/node/create` (update) | No |
| 5 | `get_nodes` | List all nodes in the workflow | (none) | Reads `store.workflowNodes` | (none — local) | No |
| 6 | `get_node_details` | Get full node details including data/config | `node_id` (required) | `fetchProcessor()` / `fetchState()` | `GET /processor/{id}` / `GET /state/{id}` | No |
| 7 | `create_edge` | Connect a state to a processor | `state_node_id`, `processor_node_id`, `direction` (all required) | `createProcessorStateWithWorkflowEdge()` | `POST /workflow/edge/create` + `POST /processor/state/route` | No |
| 8 | `delete_edge` | Remove a connection between nodes | `edge_id` (required) | `deleteProcessorStateWithWorkflowEdge()` | `DELETE /workflow/edge/{id}` + `DELETE /processor/state/route/{id}` | **Yes** |
| 9 | `get_edges` | List all edges in the workflow | (none) | Reads `store.workflowEdges` | (none — local) | No |
| 10 | `create_pipeline` | Create input→processor→output in one step | `node_type` (required), `processor_label?`, `input_label?`, `output_label?`, `existing_input_state_id?`, `existing_output_state_ids?[]`, `provider_id?`, `user_template_id?`, `system_template_id?` | Combines: `createStateWithWorkflowNode` + `createProcessorWithWorkflowNode` + `createProcessorStateWithWorkflowEdge` + `authPost('/state/create')` + `authPost('/processor/create')` | Multiple (see above) | No |

### `create_pipeline` Details

The compound tool that creates a full pipeline. Supports both creating new states and reusing existing ones:

- **New pipeline**: omit `existing_input_state_id` and `existing_output_state_ids`
- **Reuse input**: pass `existing_input_state_id` to connect to an existing input state
- **Reuse output(s)**: pass `existing_output_state_ids[]` to connect to existing output states
- **Mixed**: reuse input, create new output (or vice versa)

Auto-configures:
- Provider assignment (based on `node_type` → `class_name` mapping)
- Output state type (e.g. `StateConfigLM` for LM processors)
- Template assignment (if `user_template_id` is passed)
- Handle selection (auto-detected from positions)

### `create_edge` Direction

| Direction | Edge Direction | Source | Target |
|-----------|---------------|--------|--------|
| `INPUT` | State → Processor | state_node_id | processor_node_id |
| `OUTPUT` | Processor → State | processor_node_id | state_node_id |

---

## State Tools

**Definition file:** `src/tools/definitions/state.js`

| # | Tool | Description | Key Parameters | Store Action | API Endpoint | Confirm |
|---|------|-------------|----------------|--------------|-------------|---------|
| 11 | `configure_state` | Set state config type and properties | `state_id` (required), `state_type?`, `config?` | `authPost('/state/create')` | `POST /state/create` | No |
| 12 | `configure_state_lm` | Configure state for LLM processing (StateConfigLM) | `state_id`, `user_template_id` (required), `system_template_id?` | `authPost('/state/create')` | `POST /state/create` | No |
| 13 | `set_state_flag` | Set a boolean flag on a state | `state_id`, `flag_name`, `value` (all required) | `authPost('/state/create')` | `POST /state/create` | No |
| 14 | `set_state_columns` | Define column schema for a state | `state_id`, `columns[]` (required) | `authPost('/state/create')` | `POST /state/create` | No |
| 15 | `set_primary_key` | Set primary key columns | `state_id`, `keys[]` (required) | `authPost('/state/create')` | `POST /state/create` | No |
| 16 | `set_query_inheritance` | Configure column inheritance from input states | `state_id` (required), `keys?[]`, `inherit_all?` | `authPost('/state/create')` | `POST /state/create` | No |
| 17 | `get_state` | Get full state details (config, columns, flags) | `state_id` (required) | `fetchState()` | `GET /state/{id}` | No |

### `set_state_columns` Column Format

```json
{
    "state_id": "s1",
    "columns": [
        { "name": "question", "type": "string", "required": true },
        { "name": "answer", "type": "string" },
        { "name": "score", "type": "number" }
    ]
}
```

Columns are converted to a map keyed by `name` before sending to the API.

---

## Processor Tools

**Definition file:** `src/tools/definitions/processor.js`

| # | Tool | Description | Key Parameters | Store Action | API Endpoint | Confirm |
|---|------|-------------|----------------|--------------|-------------|---------|
| 18 | `configure_processor` | Set processor properties (temperature, maxTokens, etc.) | `processor_id`, `properties` (required) | `authPost('/processor/create')` | `POST /processor/create` | No |
| 19 | `change_processor_status` | Change processor status (ROUTE/TERMINATE/etc.) | `processor_id`, `status` (required) | `changeProcessorStatus()` | `POST /processor/{id}/status` | **Yes** |
| 20 | `get_processor` | Get full processor details | `processor_id` (required) | `fetchProcessor()` | `GET /processor/{id}` | No |
| 21 | `set_processor_provider` | Assign a runtime provider to a processor | `processor_id`, `provider_id` (required) | `authPost('/processor/create')` | `POST /processor/create` | No |

### Processor Status Values

| Status | Meaning |
|--------|---------|
| `CREATED` | Initial state / reset |
| `ROUTE` | Start processing (route data through) |
| `TERMINATE` | Stop processing |
| `STOPPED` | Processing stopped |

---

## Template Tools

**Definition file:** `src/tools/definitions/template.js`

| # | Tool | Description | Key Parameters | Store Action | API Endpoint | Confirm |
|---|------|-------------|----------------|--------------|-------------|---------|
| 22 | `create_template` | Create a new template (prompt/code) | `template_type`, `template_content`, `template_path` (all required) | `saveTemplate()` | `POST /template/create` | No |
| 23 | `update_template` | Update existing template content | `template_id`, `template_content` (required), `template_type?` | `saveTemplate()` | `POST /template/create` | No |
| 24 | `get_template` | Get template details and content | `template_id` (required) | `getTemplate()` (local) | (none — local) | No |
| 25 | `list_templates` | List all project templates | (none) | `fetchTemplates()` | `GET /template/list/{project_id}` | No |
| 26 | `assign_template_to_state` | Assign template to a state config slot | `state_id`, `template_id`, `slot` (all required) | `authPost('/state/create')` | `POST /state/create` | No |

### Template Types

| Type | Use Case |
|------|----------|
| `mako` | Mako template engine (default for prompts) |
| `jinja2` | Jinja2 template engine |
| `python` | Python code for code processors |
| `sql` | SQL queries for database processors |
| `text` | Plain text |

### Template Slots

| Slot | State Config | Description |
|------|-------------|-------------|
| `user_template_id` | StateConfigLM | User/instruction prompt for LLM |
| `system_template_id` | StateConfigLM | System prompt for LLM |
| `template_id` | StateConfigCode, StateConfigDB, etc. | Code/query template |

---

## Edge Function Tools

**Definition file:** `src/tools/definitions/edgeFunction.js`

| # | Tool | Description | Key Parameters | Store Action | API Endpoint | Confirm |
|---|------|-------------|----------------|--------------|-------------|---------|
| 27 | `set_edge_function` | Configure an edge function on a route | `route_id` (required), `function_type` (required), `template_id?`, `max_attempts?` | `updateEdgeFunctionConfig()` | `POST /processor/state/route/{id}/function` | No |
| 28 | `get_edge_function` | Get edge function config for a route | `route_id` (required) | `fetchEdgeFunctionConfig()` | `GET /processor/state/route/{id}/function` | No |

### Edge Function Type Details

| Type | Description | Key Field |
|------|-------------|-----------|
| `CALIBRATOR` | Retry/calibration logic | `max_attempts` (default: 3) |
| `VALIDATOR` | Input/output validation | `template_id` (Lua script) |
| `TRANSFORMER` | Data transformation | `template_id` (Lua script) |
| `FILTER` | Conditional filtering | `template_id` (Lua script) |

**Note:** `route_id` is the same as the workflow edge ID.

---

## Data Tools

**Definition file:** `src/tools/definitions/data.js`

| # | Tool | Description | Key Parameters | Store Action | API Endpoint | Confirm |
|---|------|-------------|----------------|--------------|-------------|---------|
| 29 | `purge_state_data` | Delete ALL data in a state (destructive) | `state_id` (required) | `purgeStateData()` | `DELETE /state/{id}/data` | **Yes** |
| 30 | `get_state_sample` | Get sample data rows from a state | `state_id` (required), `limit?` (default: 10) | `authGet('/template/state/sample/{id}')` | `GET /template/state/sample/{id}?limit=N` | No |
| 31 | `upload_state_data` | Upload data rows to a state | `state_id`, `data[]` (required) | `publishQueryState()` per row | `POST /template/state/forward/entry/{id}` | No |
| 32 | `export_state` | Export state data as downloadable file | `state_id` (required), `filename?` | `exportStateData()` | `GET /state/{id}/export` | No |

---

## Project Tools

**Definition file:** `src/tools/definitions/project.js`

| # | Tool | Description | Key Parameters | Store Action | API Endpoint | Confirm |
|---|------|-------------|----------------|--------------|-------------|---------|
| 33 | `get_project_summary` | Overview of current project | (none) | Reads store state | (none — local) | No |
| 34 | `list_processors` | List all processors with status | (none) | `authGet('/project/{id}/processors')` | `GET /project/{id}/processors` | No |
| 35 | `list_states` | List all states with config types | (none) | `authGet('/project/{id}/states')` | `GET /project/{id}/states` | No |
| 36 | `list_providers` | List all available runtime providers | (none) | `fetchProviders()` or reads `store.providers` | `GET /provider/list` | No |

---

## UI Tools

**Definition file:** `src/tools/definitions/ui.js`

| # | Tool | Description | Key Parameters | Store Action | API Endpoint | Confirm |
|---|------|-------------|----------------|--------------|-------------|---------|
| 37 | `select_node` | Select/highlight a node on canvas | `node_id` (required) | `setSelectedNodeId()` | (none — local) | No |
| 38 | `switch_to_bench` | Switch to Bench (canvas) workspace | (none) | `setCurrentWorkspace('bench')` | (none — local) | No |
| 39 | `switch_workspace` | Switch to any workspace | `workspace` (required: home/bench/editor) | `setCurrentWorkspace()` | (none — local) | No |
| 40 | `trigger_file_upload` | Open file picker for CSV upload | `state_id` (required) | `setPendingUploadStateId()` + `setCurrentWorkspace('bench')` | (none — local) | No |
| 41 | `group_nodes` | Group nodes visually on canvas | `node_ids?[]`, `group_name?`, `match_label?`, `match_type?` | `createGroup()` | (none — local) | No |
| 42 | `ungroup_nodes` | Remove a node group | `group_name` (required) | `deleteGroup()` | (none — local) | No |
| 43 | `rename_group` | Rename an existing group | `current_name`, `new_name` (required) | `renameGroup()` | (none — local) | No |
| 44 | `open_in_editor` | Open a template in the code editor | `template_id` (required) | `setSelectedFile()` + `setCurrentWorkspace('editor')` | (none — local) | No |

### `group_nodes` Matching

Three ways to specify which nodes to group (evaluated in order):
1. **`node_ids`** — explicit array of node IDs
2. **`match_label`** — case-insensitive label substring match
3. **`match_type`** — group all `state` or `processor` nodes

Requires at least 2 matching nodes.

---

## Store Action → API Mapping

| Store Action | API Endpoint | Method | Purpose |
|-------------|-------------|--------|---------|
| `createStateWithWorkflowNode()` | `/workflow/node/create` | POST | Create state node on canvas |
| `createProcessorWithWorkflowNode()` | `/workflow/node/create` | POST | Create processor node on canvas |
| `createProcessorStateWithWorkflowEdge()` | `/workflow/edge/create` + `/processor/state/route` | POST | Create edge + route |
| `deleteProcessorStateWithWorkflowEdge()` | `/workflow/edge/{id}` + `/processor/state/route/{id}` | DELETE | Remove edge + route |
| `deleteProcessor()` | `/processor/{id}` | DELETE | Delete processor |
| `deleteState()` | `/state/{id}` | DELETE | Delete state |
| `deleteNode()` | `/workflow/node/{id}` | DELETE | Delete workflow node |
| `updateNode()` | `/workflow/node/create` | POST | Update node position/props |
| `fetchProcessor()` | `/processor/{id}` | GET | Fetch processor data |
| `fetchState()` | `/state/{id}` | GET | Fetch state data |
| `changeProcessorStatus()` | `/processor/{id}/status` | POST | Change processor status |
| `saveTemplate()` | `/template/create` | POST | Create/update template |
| `fetchTemplates()` | `/template/list/{project_id}` | GET | List project templates |
| `fetchProviders()` | `/provider/list` | GET | List available providers |
| `purgeStateData()` | `/state/{id}/data` | DELETE | Delete all state data |
| `publishQueryState()` | `/template/state/forward/entry/{id}` | POST | Push a data row to state |
| `exportStateData()` | `/state/{id}/export` | GET | Export state data |
| `updateEdgeFunctionConfig()` | `/processor/state/route/{id}/function` | POST | Set edge function config |
| `fetchEdgeFunctionConfig()` | `/processor/state/route/{id}/function` | GET | Get edge function config |
| `authPost('/state/create')` | `/state/create` | POST | Create/update state config |
| `authPost('/processor/create')` | `/processor/create` | POST | Create/update processor |
| `authPost('/assistant/chat')` | `/assistant/chat` | POST | LLM chat completion |
| `authGet('/assistant/models')` | `/assistant/models` | GET | List available models |
| `authGet('/project/{id}/processors')` | `/project/{id}/processors` | GET | List project processors |
| `authGet('/project/{id}/states')` | `/project/{id}/states` | GET | List project states |
| `authGet('/template/state/sample/{id}')` | `/template/state/sample/{id}` | GET | Sample state data |

---

## State Config Types Reference

| Type | Purpose | Key Config Fields |
|------|---------|-------------------|
| `StateConfig` | Default / generic state | `name`, `storage_class`, `primary_key[]`, flags |
| `StateConfigLM` | AI/LLM processor output | `user_template_id` (required), `system_template_id` (optional) |
| `StateConfigCode` | Python processor output | `template_id` |
| `StateConfigDB` | SQL datasource output | `template_id` |
| `StateConfigVisual` | Vision processor output | `template_id`, `width`, `height`, `quantity` |
| `StateConfigAudio` | Audio processor output | `template_id` |
| `StateConfigStream` | Streaming state | `url`, `template_id` |
| `StateConfigUserInput` | User interaction state | `template_id` |

### Provider Class → State Config Mapping

| Provider Class Name | State Config Type |
|-------------------|------------------|
| `NaturalLanguageProcessing` | `StateConfigLM` |
| `CodeProcessing` | `StateConfigCode` |
| `DatabaseProcessing` | `StateConfigDB` |
| `ImageProcessing` | `StateConfigVisual` |
| `AudioProcessing` | `StateConfigAudio` |
| `StreamProcessing` | `StateConfigStream` |
| `DataTransformation` | `StateConfig` |
| `Interaction` | `StateConfigUserInput` |

---

## State Flags Reference

All flags are boolean. Set via `set_state_flag` tool.

| Flag | Default | Description |
|------|---------|-------------|
| `flag_append_to_session` | `false` | Append entries to session context |
| `flag_dedup_drop_enabled` | `false` | Enable deduplication by input hash |
| `flag_enable_execute_set` | `false` | Process entire input set at once |
| `flag_flatten_on_save` | `true` | Flatten nested types to dot-notation |
| `flag_keep_raw_output` | `true` | Store raw processor output |
| `flag_include_provider_info` | `true` | Include provider info in state rows |
| `flag_require_primary_key` | `false` | Enforce primary key on inputs |
| `flag_query_state_inheritance_all` | `true` | Copy all inherited values |
| `flag_include_prompts_in_state` | `false` | Include prompts in output columns |
| `flag_auto_save_output_state` | `false` | Auto-save output to storage |
| `flag_auto_route_output_state` | `false` | Auto-route output downstream |

---

## Processor Properties Reference

Set via `configure_processor` tool. These apply to LM (language model) processors.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `temperature` | float | 0.7 | Randomness (0-2) |
| `maxTokens` | int | 2048 | Maximum output tokens |
| `topP` | float | 1.0 | Nucleus sampling (0-1) |
| `presencePenalty` | float | 0.0 | Presence penalty (-2 to 2) |
| `frequencyPenalty` | float | 0.0 | Frequency penalty (-2 to 2) |
| `maxBatchSize` | int | 100 | Maximum batch size |
| `requestDelay` | int | 0 | Delay between requests (ms) |

---

## Edge Function Types Reference

Configured via `set_edge_function` tool. Functions are Lua scripts attached to processor-state routes.

| Type | Purpose | Common Return Pattern | `max_attempts` |
|------|---------|----------------------|----------------|
| `CALIBRATOR` | Retry with modified data | `{PASS, RETRY}` multi-action | Yes (default: 3) |
| `VALIDATOR` | Check data quality | `PASS` or `DROP` | No |
| `TRANSFORMER` | Reshape data | `PASS` with modified data | No |
| `FILTER` | Conditional selection | `PASS` or `DROP` | No |

### Lua Function Signature

```lua
-- Inputs:
--   data (table): one row of key/value pairs
--   route_metadata (table): engine metadata (attempt, etc.)
--
-- Returns:
--   Single action:  "ACTION", data
--   Multi-action:   { {action="A", data=d1}, {action="B", data=d2} }

function process(data, route_metadata)
    return "PASS", data
end
```

### Available Actions

| Action | Effect |
|--------|--------|
| `PASS` | Forward data to the next stage |
| `RETRY` | Re-process with (optionally modified) data |
| `DROP` | Discard the row |

---

## Tool Counts by Category

| Category | Count | Confirm-Required |
|----------|-------|-----------------|
| workflow | 10 | delete_node, delete_edge |
| state | 7 | (none) |
| processor | 4 | change_processor_status |
| template | 5 | (none) |
| edge_function | 2 | (none) |
| data | 4 | purge_state_data |
| project | 4 | (none) |
| ui | 8 | (none) |
| **Total** | **44** | **4 tools** |
