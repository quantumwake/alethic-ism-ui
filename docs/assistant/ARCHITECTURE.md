# ISM Workflow Assistant — Architecture

## Overview

The ISM Workflow Assistant is a tool-calling chat agent embedded in the ISM UI. Users describe workflow intentions in natural language; the assistant translates those into concrete store mutations (create nodes, edges, templates, etc.) through an agentic loop of up to 10 LLM round-trips per user message.

All tool execution happens **in the browser** — the backend is a thin auth + passthrough proxy to OpenAI or Anthropic. This keeps latency low and avoids duplicating store logic on the server.

---

## Architecture Diagram

```
User
  |
  v
+-------------------------------------------------------------------+
| AIAssistantTab.jsx                                                |
|                                                                   |
|   +-----------+    +-------------+    +------------------------+  |
|   | Textarea  |--->| sendChat    |--->| chatAssistantSlice     |  |
|   | + Send    |    | Message()   |    +------------------------+  |
|   +-----------+    +-------------+              |                 |
|                                                 v                 |
|   +-------------------------+      +----------------------------+ |
|   | chatDisplayMessages[]   |<-----| _runAssistantLoop()        | |
|   | (UI-friendly messages)  |      |                            | |
|   +-------------------------+      |  1. Pre-fetch labels       | |
|                                    |  2. Seed ID mapping        | |
|   +-------------------------+      |  3. Build system prompt    | |
|   | Confirmation Cards      |<-----|  4. Call backend API       | |
|   | (approve / reject)      |      |  5. Parse response         | |
|   +-------------------------+      |  6. Execute tool calls     | |
|                                    |  7. Loop (up to 10x)       | |
+-------------------------------------------------------------------+
         |                           +----------------------------+ |
         |                                       |                  |
         |                  +------------+  +---------------+       |
         |                  | Registry   |  | ID Mapping    |       |
         |                  | (44 tools) |  | (short<>UUID) |       |
         |                  +-----+------+  +---------------+       |
         |                        |                                 |
         |          +-------------+-------------+                   |
         |          |             |             |                   |
         |   +------+----+ +-----+-----+ +----+--------+            |
         |   | workflow   | | state     | | processor  |  ...       |
         |   | tools      | | tools     | | tools      |            |
         |   +------+-----+ +-----+----+ +-----+-------+            |
         |          |              |            |                   |
         |          v              v            v                   |
         |   +------------------------------------------+           |
         |   | Zustand Store (via createStoreProxy)     |           |
         |   | workflowNodes, workflowEdges,            |           |
         |   | templates, providers, authPost, etc.     |           |
         |   +--------------------+---------------------+           |
         |                        |                                 |
         v                        v                                 |
  +--------------+     +----------------------------+               |
  | Provider     |     | ISM Backend API            |               |
  | Adapter      |     |                            |               |
  | (OpenAI fmt) |---->| POST /assistant/chat       |               |
  |              |     | POST /state/create         |               |
  +--------------+     | POST /processor/create     |               |
                       | POST /workflow/node/create |               |
                       | POST /workflow/edge/create |               |
                       +-----------+----------------+               |
                                   |                                |
                       +-----------+-----------+                    |
                       | OpenAI / Anthropic    |                    |
                       | (LLM providers)       |                    |
                       +-----------------------+
```

---

## File Manifest

| File | Purpose |
|------|---------|
| `src/tools/registry.js` | Singleton tool registry — register, lookup, execute with ID translation |
| `src/tools/index.js` | Bootstrap — imports all definition files, auto-initializes on import |
| `src/tools/systemPrompt.js` | Dynamic system prompt builder — injects nodes, edges, templates, providers |
| `src/tools/idMapping.js` | Short ID (s1, p1, t1, e1) ↔ UUID bidirectional translation layer |
| `src/tools/autoLayout.js` | Intelligent auto-positioning — grid-based, pipeline-aware layout |
| `src/tools/providers/base.js` | Abstract adapter interface — `formatTools`, `parseResponse`, `formatToolResults` |
| `src/tools/providers/openai.js` | OpenAI adapter — converts schemas to `tools[]` format, parses `tool_calls[]` |
| `src/tools/definitions/workflow.js` | 10 tools: create/delete/move nodes, create/delete edges, create_pipeline |
| `src/tools/definitions/state.js` | 7 tools: configure_state, configure_state_lm, flags, columns, keys, inheritance |
| `src/tools/definitions/processor.js` | 4 tools: configure, status change, get, set provider |
| `src/tools/definitions/template.js` | 5 tools: create, update, get, list, assign to state |
| `src/tools/definitions/edgeFunction.js` | 2 tools: set/get edge function (Lua scripts on routes) |
| `src/tools/definitions/data.js` | 4 tools: purge, sample, upload, export state data |
| `src/tools/definitions/project.js` | 4 tools: project summary, list processors/states/providers |
| `src/tools/definitions/ui.js` | 8 tools: select node, switch workspace, file upload, groups, open editor |
| `src/store/slice/chatAssistantSlice.js` | Zustand slice — conversation state, agentic loop, confirmation handling |
| `src/tabs/AIAssistantTab.jsx` | React UI — chat interface, message bubbles, confirmation cards, settings |
| `alethic-ism-api/api/assistant.py` | FastAPI backend — auth passthrough to OpenAI/Anthropic, format conversion |

---

## Component Details

### 1. Tool Registry (`src/tools/registry.js`)

Singleton `ToolRegistry` class managing a `Map<name, toolDef>`. Each tool has:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique identifier (e.g. `create_pipeline`) |
| `description` | string | Sent to LLM as tool description |
| `parameters` | object | JSON Schema for arguments |
| `execute` | async fn | `(params, store) => result` |
| `confirm` | boolean | Whether to prompt user before executing |
| `category` | string | Grouping: workflow, state, processor, template, edge_function, data, project, ui |

Key methods:
- `register(tool)` — add a tool definition
- `getSchemas()` — return neutral `[{name, description, parameters}]` for adapters
- `execute(name, params, store)` — translate short IDs → UUIDs, run, translate back
- `requiresConfirmation(name)` — check the `confirm` flag

### 2. Provider Adapters (`src/tools/providers/`)

Adapters convert between the **neutral schema format** used internally and the **provider-specific format** sent to the LLM API.

**Base class** (`base.js`):
```
formatTools(schemas) → provider tool definitions
parseResponse(response) → { content, toolCalls: [{id, name, arguments}] }
formatToolResults(results) → messages for conversation history
formatAssistantToolCallMessage(content, toolCalls) → assistant message
```

**OpenAI adapter** (`openai.js`):
- `formatTools`: wraps each schema in `{ type: "function", function: { name, description, parameters } }`
- `parseResponse`: extracts `choices[0].message.content` and `tool_calls[]`
- `formatToolResults`: creates `{ role: "tool", tool_call_id, content }` messages
- `formatAssistantToolCallMessage`: creates `{ role: "assistant", tool_calls: [...] }` message

The OpenAI format is the **canonical wire format**. Anthropic responses are converted to OpenAI format on the backend before reaching the frontend.

### 3. System Prompt (`src/tools/systemPrompt.js`)

`buildSystemPrompt({ nodes, edges, templates, providers, projectId, selectedNodeId })` constructs a dynamic prompt that includes:

1. **ISM concept definitions** — State, Processor, Edge, Template, Route, Provider
2. **Short ID convention** — s1/p1/t1/e1 format explanation
3. **Workflow pattern** — State → Processor → State
4. **Available node types** — derived from `NODE_TYPE_TO_CLASS_NAME` mapping
5. **Provider summary** — grouped by class_name, compact format
6. **State config type mapping** — NaturalLanguageProcessing → StateConfigLM, etc.
7. **Handle convention** — auto-detected from positions
8. **Edge types** — `state_auto_stream_playable_edge` (INPUT) and `default` (OUTPUT)
9. **Lua edge functions** — signature, return values, types, example
10. **State flags** — all 11 boolean flags with defaults
11. **Processor properties** — temperature, maxTokens, topP, etc.
12. **Instructions** — 10 rules for the LLM (prefer create_pipeline, etc.)
13. **Current context** — nodes with labels/connections, edges, templates

The prompt is rebuilt on **every iteration** of the agentic loop so newly created nodes appear immediately.

#### Key Mappings

`NODE_TYPE_TO_CLASS_NAME`:
```
processor_openai → NaturalLanguageProcessing
processor_anthropic → NaturalLanguageProcessing
processor_google → NaturalLanguageProcessing
processor_python → CodeProcessing
processor_visual_openai → ImageProcessing
processor_state_coalescer → DataTransformation
function_datasource_sql → DatabaseProcessing
function_user_interaction → Interaction
```

`CLASS_NAME_TO_STATE_CONFIG`:
```
NaturalLanguageProcessing → StateConfigLM
CodeProcessing → StateConfigCode
DatabaseProcessing → StateConfigDB
ImageProcessing → StateConfigVisual
AudioProcessing → StateConfigAudio
StreamProcessing → StateConfigStream
DataTransformation → StateConfig
Interaction → StateConfigUserInput
```

### 4. ID Mapping (`src/tools/idMapping.js`)

Singleton `IdMapping` class that maintains bidirectional `short ↔ UUID` translation.

**Short ID format:**
| Prefix | Entity Type |
|--------|-------------|
| `s` | State nodes |
| `p` | Processor/function nodes |
| `t` | Templates |
| `e` | Edges |

**Lifecycle:**
1. `seedFromContext({nodes, edges, templates})` — called at the start of each loop iteration
2. `translateParams(params)` — before tool execution: short → UUID (recursive)
3. Tool executes with real UUIDs
4. `translateResult(result)` — after execution: auto-register new UUIDs, then UUID → short
5. `reset()` — called on `clearChatHistory`

**Auto-registration** uses `FIELD_TO_TYPE` to infer entity type from field names:
```
input_state_id, output_state_id, state_id → state
processor_id → processor
template_id, user_template_id, system_template_id → template
```

### 5. Auto Layout (`src/tools/autoLayout.js`)

Singleton `AutoLayout` class that tracks positions used during a conversation turn and provides intelligent defaults.

**Positioning rules:**
1. If user specifies position → use it
2. If relative to existing node → place right/below/left/above
3. If standalone → find empty grid spot, stagger to avoid collisions
4. Pipeline pattern: states at `START_X` (100), processors at `START_X + 300`

**Constants:**
| Name | Value |
|------|-------|
| `GRID_SNAP` | 16px |
| `NODE_SPACING_X` | 300px |
| `NODE_SPACING_Y` | 200px |
| `START_X` | 100px |
| `START_Y` | 100px |

`reset()` is called at the beginning of each `sendChatMessage` turn.

### 6. Chat Assistant Slice (`src/store/slice/chatAssistantSlice.js`)

Zustand slice managing:

| State | Type | Purpose |
|-------|------|---------|
| `chatMessages` | `Message[]` | Full OpenAI-compatible conversation history |
| `chatDisplayMessages` | `DisplayMessage[]` | UI-friendly messages with timestamps, statuses |
| `isProcessing` | boolean | Lock to prevent concurrent sends |
| `pendingConfirmations` | `Confirmation[]` | Queued destructive actions awaiting user approval |
| `chatModel` | string | Current model ID (default: `claude-sonnet-4-6`) |
| `chatProvider` | string | Provider key (default: `openai`) |
| `autoConfirm` | boolean | Skip confirmation prompts when true |
| `pendingUploadStateId` | string | Triggers file picker in UI |

### 7. UI (`src/tabs/AIAssistantTab.jsx`)

React component with:
- **Header** — title, settings toggle, clear history button
- **Settings panel** — model selector (fetched from `/assistant/models`), auto-confirm toggle
- **Context indicator** — project ID, node/edge counts, selected node
- **Message list** — renders `chatDisplayMessages` as bubbles
- **Message types**: user, assistant, tool_call (expandable card), confirmation (approve/reject)
- **Input** — textarea with Enter-to-send, disabled when processing or no project

Tool initialization happens via `import '../tools/index.js'` at the top of the file.

### 8. Backend (`alethic-ism-api/api/assistant.py`)

FastAPI router with two endpoints:

**`GET /assistant/models`** — returns available models based on configured API keys.

**`POST /assistant/chat`** — thin passthrough:
1. Route by model name: `claude*` → Anthropic, else → OpenAI
2. For OpenAI: pass through directly, return `response.model_dump()`
3. For Anthropic: convert OpenAI messages/tools → Anthropic format, call API, convert response back to OpenAI format
4. Anthropic 500s are retried once with a 1-second delay

The backend does **no tool execution** — it only relays the LLM conversation.

---

## Agentic Loop

The core loop lives in `_runAssistantLoop()` in the chat assistant slice. Each user message can trigger up to 10 LLM round-trips:

```
sendChatMessage(text)
  │
  ├─ Append user message to chatMessages + chatDisplayMessages
  ├─ autoLayout.reset()
  │
  └─ _runAssistantLoop()   ← up to MAX_ITERATIONS = 10
       │
       │  ┌──────────────────────────────────────────────────────┐
       │  │  ITERATION START                                     │
       │  │                                                      │
       │  │  1. Pre-fetch: for nodes missing labels, call        │
       │  │     fetchState() or fetchProcessor() (best-effort)   │
       │  │                                                      │
       │  │  2. Seed ID mapping from current context             │
       │  │     (nodes, templates, edges → short IDs)            │
       │  │                                                      │
       │  │  3. Build system prompt with fresh context           │
       │  │                                                      │
       │  │  4. Construct request:                               │
       │  │     - system prompt + chatMessages                   │
       │  │     - adapter.formatTools(registry.getSchemas())     │
       │  │     - model, temperature=0.3, max_tokens=4096        │
       │  │                                                      │
       │  │  5. POST /assistant/chat → backend → LLM             │
       │  │                                                      │
       │  │  6. adapter.parseResponse(data)                      │
       │  │     → { content, toolCalls }                         │
       │  │                                                      │
       │  │  7. If no toolCalls:                                 │
       │  │     → Append assistant text message, RETURN (done)   │
       │  │                                                      │
       │  │  8. If toolCalls present:                            │
       │  │     a. Add assistant message with tool_calls to      │
       │  │        chatMessages (for history continuity)         │
       │  │     b. For each tool call:                           │
       │  │        - If confirm required && !autoConfirm:        │
       │  │          → Queue confirmation, await user response   │
       │  │        - Else: execute via registry.execute()        │
       │  │          (with createStoreProxy for fresh reads)     │
       │  │     c. Format results via adapter.formatToolResults()│
       │  │     d. Append tool result messages to chatMessages   │
       │  │                                                      │
       │  │  9. CONTINUE to next iteration                       │
       │  └──────────────────────────────────────────────────────┘
       │
       └─ If MAX_ITERATIONS reached: append warning message
```

### Confirmation Gate

Tools with `confirm: true` (e.g. `delete_node`, `delete_edge`, `purge_state_data`, `change_processor_status`) pause the loop. A `ConfirmationCard` renders in the UI with Approve/Reject buttons. The loop awaits a Promise that resolves when the user clicks either button.

- **Approve**: executes the tool, resolves with result
- **Reject**: resolves with `{ success: false, error: "User rejected this action." }`

The `autoConfirm` toggle bypasses this gate entirely.

---

## Design Decisions

### Frontend Execution
Tools execute in the browser against the Zustand store, not on the backend. This avoids:
- Duplicating store/API logic on the server
- Auth token management for server-side API calls
- Latency from additional round-trips
- State synchronization issues

### Store Proxy (`createStoreProxy`)
```js
function createStoreProxy(get) {
    return new Proxy({}, {
        get: (_target, prop) => get()[prop],
    });
}
```
Without this, tools would receive a stale snapshot from the moment `get()` was called. The Proxy ensures every property access reads **fresh** state — critical when `create_pipeline` creates 3+ nodes in sequence and subsequent steps need to `getNode()` for nodes that were just created.

### ID Translation Layer
UUIDs are long and error-prone for LLMs. Short IDs (`s1`, `p1`, `t1`, `e1`) are:
- Easier for the LLM to reference correctly
- Cheaper in token count
- Automatically managed — `seedFromContext` on every iteration ensures new entities get IDs

The translation is **transparent** to tool implementations — they always work with real UUIDs.

### Bounded Loop (10 iterations)
The `MAX_ITERATIONS = 10` cap prevents runaway tool-calling loops. This is sufficient for complex workflows (a pipeline with templates is typically 3-5 iterations) while protecting against infinite loops from confused LLMs.

### Confirmation Gate
Destructive operations (`delete_node`, `delete_edge`, `purge_state_data`) and status changes (`change_processor_status`) require user approval. This prevents the LLM from accidentally deleting work. The `autoConfirm` toggle exists for power users who want faster iteration.

### OpenAI as Canonical Format
All internal message handling uses OpenAI's format (`tool_calls[]`, `role: "tool"`, etc.). The backend converts Anthropic responses to this format before returning. This means:
- Only one adapter is needed in the frontend
- Adding new providers only requires backend conversion functions
- The conversation history format is consistent regardless of model

### System Prompt Rebuilt Per Iteration
The system prompt is regenerated on **every loop iteration**, not just once per user message. This ensures:
- Newly created nodes appear in the context immediately
- Updated labels from `fetchState`/`fetchProcessor` are reflected
- ID mappings are current
- The LLM always has accurate project state

---

## Execution Model

### Data Flow: Pipeline Execution

When a user says "run the processor", the execution flow is:

```
1. User message → LLM decides to call change_processor_status(p1, "ROUTE")
2. Tool executes → store.changeProcessorStatus(uuid, "ROUTE")
3. Backend API: POST /processor/{id}/status → processor status = ROUTE
4. ISM Engine (via NATS) picks up the route
5. Engine reads INPUT state data
6. Edge functions (if any) run on each row:
   - VALIDATOR: check data, PASS or DROP
   - TRANSFORMER: modify data before processing
7. Processor executes (e.g. OpenAI API call)
8. Output edge functions (if any):
   - CALIBRATOR: check output quality, RETRY with modifications or PASS
   - FILTER: DROP rows that don't meet criteria
9. Results written to OUTPUT state
```

### Data Flow: Input Data Upload

```
1. User: "upload some test data to the input state"
2. LLM calls upload_state_data(s1, [{question: "What is AI?"}])
3. Tool: store.publishQueryState(uuid, row) for each row
4. Backend: POST /template/state/forward/entry/{state_id}
5. Data appears in state, ready for processor consumption
```

### Data Flow: File Upload (browser-based)

```
1. User: "I want to upload a CSV file"
2. LLM calls trigger_file_upload(s1)
3. Tool: store.setPendingUploadStateId(uuid)
4. StateNodeComponent detects pendingUploadStateId, opens file picker
5. User selects file → parsed and published to state
```

---

## Lua Edge Functions

Edge functions are Lua scripts that run on each data row as it flows through an edge (processor-state route). They are configured via the `set_edge_function` tool and managed by the ISM Engine.

### Function Signature

```lua
-- Input parameters (injected by engine):
--   data: table — one row as key/value pairs
--   route_metadata: table — engine metadata (e.g. attempt count)
--
-- Return: action_string, data
--   OR: array of {action, data} tables for multi-action

function process(data, route_metadata)
    -- ... logic ...
    return "PASS", data
end
```

### Actions

| Action | Effect |
|--------|--------|
| `PASS` | Forward the data row to the next stage |
| `RETRY` | Re-process the row with (optionally modified) data |
| `DROP` | Discard the row entirely |

### Multi-Action Return

A single function can return multiple actions — useful for "PASS the original AND RETRY with modifications":

```lua
return {
    {action="PASS", data=original_data},
    {action="RETRY", data=modified_data}
}
```

### Edge Function Types

| Type | Purpose | Typical Use |
|------|---------|-------------|
| `CALIBRATOR` | Retry/quality control | Re-run LLM with different temperature up to `max_attempts` |
| `VALIDATOR` | Input/output validation | DROP rows missing required fields |
| `TRANSFORMER` | Data transformation | Reshape, rename, or compute fields |
| `FILTER` | Conditional filtering | Only PASS rows matching criteria |

### Example: Retry Calibrator

```lua
local attempt = route_metadata and route_metadata["attempt"] or 1
if attempt > 3 then
    return "PASS", data  -- give up after 3 retries
end

-- Check if output meets quality criteria
local response = data["response"] or ""
if #response < 50 then
    -- Too short — retry with higher temperature
    data["temperature"] = 0.9
    return {
        {action="PASS", data=data},      -- keep current result
        {action="RETRY", data=data}       -- also retry
    }
end

return "PASS", data
```

---

## Key Gotchas

### Node Label Resolution
Labels come from multiple sources depending on fetch state:
```
data.config.name → data.name → data.label → node.type
```
`fetchWorkflowNodes()` discards `node_label` from the backend — the actual labels only appear after `fetchState()` or `fetchProcessor()` hydrates node data. The agentic loop pre-fetches labels for unlabeled nodes on each iteration.

### Shared States Are Valid
Multiple processors can share the same input and output states. This is a **common and supported pattern** — `flag_include_provider_info` adds a provider column to distinguish results. The LLM is explicitly told not to suggest separate states unless the user asks.

### Edge ID = Route ID
The workflow edge ID and the processor-state route ID are the **same value**. The `set_edge_function` tool takes a `route_id` parameter which is the edge ID.

### Anthropic Message Alternation
Anthropic requires **strict user/assistant alternation**. The backend merges consecutive same-role messages into one message with multiple content blocks. Tool results (which are `role: "tool"` in OpenAI format) become `role: "user"` messages with `tool_result` content blocks in Anthropic format.

### `isProcessor()` Check
When checking if a node is a processor, you must check **both** prefixes:
```js
node.type?.startsWith('processor') || node.type?.startsWith('function')
```
The `function_datasource_sql` and `function_user_interaction` types use the `function` prefix but are treated as processors.

### `createStoreProxy` Required for Tool Execution
Tools must use the Proxy wrapper around `get()`, not a direct snapshot. Without it, `store.getNode(nodeId)` for a node just created in the same tool call would return `undefined`.

### Auto Layout Reset Per Turn
`autoLayout.reset()` is called at the start of each `sendChatMessage()`, not per iteration. This means positions are tracked across all iterations within one user turn but reset between turns.

### Handle Auto-Detection
Edge handles are picked by comparing source and target positions:
- Horizontal displacement dominates → left-to-right handles (`source-3` / `target-2`)
- Vertical displacement dominates → top-to-bottom handles (`source-4` / `target-1`)

### `@check_null_response` in FastAPI
The ISM backend decorator raises 404 on `None` returns. Always ensure API handler functions have an explicit `return` statement.

---

## Missing Tools (To Implement)

### `execute_route`
Execute a single processor-state route. This would trigger processing on one specific edge without changing the processor's global status.

**Proposed signature:**
```js
{
    name: 'execute_route',
    category: 'workflow',
    confirm: true,
    parameters: {
        route_id: 'string',  // edge ID = route ID
    },
    execute: (params, store) => store.executeProcessorStateRoute(params.route_id)
}
```

### `execute_route_entry`
Push a single data entry through a route (play one row).

**Proposed signature:**
```js
{
    name: 'execute_route_entry',
    category: 'data',
    confirm: false,
    parameters: {
        route_id: 'string',
        data: 'object',  // single row
    },
    execute: (params, store) => store.executeProcessorStateRouteEntry(params.route_id, params.data)
}
```

### `execute_all_routes`
Execute all routes for a processor (equivalent to pressing "play all" in the UI).

**Proposed signature:**
```js
{
    name: 'execute_all_routes',
    category: 'workflow',
    confirm: true,
    parameters: {
        processor_id: 'string',
    },
    execute: (params, store) => store.executeAllProcessorRoutes(params.processor_id)
}
```

---

## Adding a New Tool

1. Choose the appropriate definition file in `src/tools/definitions/`
2. Call `registry.register({...})` with the tool definition
3. The tool is automatically available — no additional wiring needed
4. Use `store.authPost()`/`store.authGet()` for API calls
5. Return `{ success: true/false, ...data }` — the ID mapping layer translates UUIDs automatically
6. Set `confirm: true` for destructive operations
7. The system prompt in `systemPrompt.js` should mention the tool if users need to understand when to use it

## Adding a New Provider Adapter

1. Create a new file in `src/tools/providers/` extending `BaseProviderAdapter`
2. Implement the 4 required methods: `formatTools`, `parseResponse`, `formatToolResults`, `formatAssistantToolCallMessage`
3. Add the adapter to the `adapters` map in `chatAssistantSlice.js`
4. Add backend conversion functions in `assistant.py` if the provider's API format differs
