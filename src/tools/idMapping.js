/**
 * ID Mapping — translates between short LLM-friendly IDs and real UUIDs.
 *
 * Short ID format:
 *   s1, s2, s3 — state nodes
 *   p1, p2, p3 — processor/function nodes
 *   t1, t2, t3 — templates
 *   e1, e2, e3 — edges
 *
 * The LLM sees and uses short IDs. The tool layer translates to/from UUIDs
 * transparently before execution and after results.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Map from result field names to the entity type they represent.
 * Used to auto-register new UUIDs returned by tools.
 */
const FIELD_TO_TYPE = {
    input_state_id: 'state',
    output_state_id: 'state',
    state_id: 'state',
    processor_id: 'processor',
    template_id: 'template',
    user_template_id: 'template',
    system_template_id: 'template',
};

class IdMapping {
    constructor() {
        this._shortToUuid = new Map();
        this._uuidToShort = new Map();
        this._counters = { s: 0, p: 0, t: 0, e: 0 };
    }

    /** Reset all mappings (call on chat clear). */
    reset() {
        this._shortToUuid.clear();
        this._uuidToShort.clear();
        this._counters = { s: 0, p: 0, t: 0, e: 0 };
    }

    /**
     * Register a UUID and return its short ID.
     * If already registered, returns the existing short ID.
     *
     * @param {string} uuid
     * @param {'state'|'processor'|'template'|'edge'} entityType
     * @returns {string|null} short ID or null if uuid is falsy
     */
    register(uuid, entityType) {
        if (!uuid) return null;
        if (this._uuidToShort.has(uuid)) return this._uuidToShort.get(uuid);

        const prefix = entityType === 'state' ? 's'
            : (entityType === 'processor' || entityType === 'function') ? 'p'
            : entityType === 'template' ? 't'
            : entityType === 'edge' ? 'e'
            : 's';

        this._counters[prefix] = (this._counters[prefix] || 0) + 1;
        const shortId = `${prefix}${this._counters[prefix]}`;

        this._shortToUuid.set(shortId, uuid);
        this._uuidToShort.set(uuid, shortId);
        return shortId;
    }

    /** Translate a short ID to its UUID. Returns the input unchanged if not found. */
    toUuid(value) {
        if (!value || typeof value !== 'string') return value;
        return this._shortToUuid.get(value) || value;
    }

    /** Translate a UUID to its short ID. Returns the input unchanged if not found. */
    toShort(value) {
        if (!value || typeof value !== 'string') return value;
        return this._uuidToShort.get(value) || value;
    }

    /**
     * Seed the mapping from existing project context.
     * Call at the start of each assistant turn.
     */
    seedFromContext({ nodes = [], templates = [], edges = [] } = {}) {
        for (const n of nodes) {
            const type = n.type === 'state' ? 'state' : 'processor';
            this.register(n.id, type);
        }
        for (const t of templates) {
            if (t.template_id) this.register(t.template_id, 'template');
        }
        for (const e of edges) {
            if (e.id) this.register(e.id, 'edge');
        }
    }

    /**
     * Translate all string values in a params object: short ID → UUID.
     * Handles nested objects and arrays.
     */
    translateParams(params) {
        if (!params || typeof params !== 'object') return params;
        if (Array.isArray(params)) return params.map(v => this._translateValue(v, 'toUuid'));

        const translated = {};
        for (const [key, value] of Object.entries(params)) {
            translated[key] = this._translateValue(value, 'toUuid');
        }
        return translated;
    }

    /**
     * Auto-register any new UUIDs in a tool result, then translate UUID → short ID.
     */
    translateResult(result) {
        if (!result || typeof result !== 'object') return result;

        // First pass: register any new UUIDs
        this._registerFromResult(result);

        // Second pass: translate UUID → short
        return this._translateObj(result, 'toShort');
    }

    /**
     * Get a summary string for the system prompt showing the mapping.
     * e.g. "s1 = Input Questions State, p1 = OpenAI Processor, ..."
     */
    getSummary(nodes = [], templates = []) {
        const parts = [];
        for (const n of nodes) {
            const shortId = this._uuidToShort.get(n.id);
            if (shortId) {
                const label = n.data?.config?.name || n.data?.name || n.data?.label || n.type;
                parts.push(`${shortId} = "${label}" (${n.type})`);
            }
        }
        for (const t of templates) {
            const shortId = this._uuidToShort.get(t.template_id);
            if (shortId) {
                parts.push(`${shortId} = "${t.template_path || t.template_id}" (template)`);
            }
        }
        return parts.join('\n  ');
    }

    // ─── Internal helpers ───────────────────────────────────────────────

    _translateValue(value, direction) {
        if (typeof value === 'string') {
            return this[direction](value);
        }
        if (Array.isArray(value)) {
            return value.map(v => this._translateValue(v, direction));
        }
        if (typeof value === 'object' && value !== null) {
            return this._translateObj(value, direction);
        }
        return value;
    }

    _translateObj(obj, direction) {
        if (Array.isArray(obj)) return obj.map(v => this._translateValue(v, direction));
        const translated = {};
        for (const [key, value] of Object.entries(obj)) {
            translated[key] = this._translateValue(value, direction);
        }
        return translated;
    }

    /**
     * Scan a tool result for UUID values and register them.
     * Uses field name heuristics to determine entity type.
     */
    _registerFromResult(result, parentKey = '') {
        if (!result || typeof result !== 'object') return;
        if (Array.isArray(result)) {
            result.forEach(v => this._registerFromResult(v));
            return;
        }

        // Check for node_id + node_type pattern
        if (result.node_id && UUID_RE.test(result.node_id)) {
            const type = result.node_type === 'state' ? 'state' : 'processor';
            this.register(result.node_id, type);
        }

        // Check known ID fields
        for (const [field, entityType] of Object.entries(FIELD_TO_TYPE)) {
            const value = result[field];
            if (value && typeof value === 'string' && UUID_RE.test(value)) {
                this.register(value, entityType);
            }
        }

        // Recurse into nested objects
        for (const value of Object.values(result)) {
            if (typeof value === 'object' && value !== null) {
                this._registerFromResult(value);
            }
        }
    }
}

const idMapping = new IdMapping();
export default idMapping;
