/**
 * Tool Registry — singleton that manages tool definitions for the chat assistant.
 *
 * Each tool has:
 *   name        — unique identifier (e.g. 'create_processor_node')
 *   description — what it does (sent to LLM)
 *   parameters  — JSON Schema for arguments
 *   execute     — async (params, store) => result
 *   confirm     — whether to prompt user before executing
 *   category    — grouping for organization
 *
 * The registry integrates with idMapping to transparently translate
 * short LLM-friendly IDs (s1, p1, t1) to/from real UUIDs.
 */
import idMapping from './idMapping.js';

class ToolRegistry {
    constructor() {
        this._tools = new Map();
    }

    /**
     * Register a tool definition.
     * @param {{ name: string, description: string, parameters: object, execute: Function, confirm?: boolean, category?: string }} tool
     */
    register(tool) {
        if (!tool.name || !tool.execute) {
            throw new Error(`Tool registration requires 'name' and 'execute': ${JSON.stringify(tool.name)}`);
        }
        this._tools.set(tool.name, {
            name: tool.name,
            description: tool.description || '',
            parameters: tool.parameters || { type: 'object', properties: {} },
            execute: tool.execute,
            confirm: tool.confirm ?? false,
            category: tool.category || 'general',
        });
    }

    /**
     * Get a single tool by name.
     */
    getTool(name) {
        return this._tools.get(name) || null;
    }

    /**
     * Get all registered tools.
     */
    getTools() {
        return Array.from(this._tools.values());
    }

    /**
     * Get tools filtered by category.
     */
    getToolsByCategory(category) {
        return this.getTools().filter(t => t.category === category);
    }

    /**
     * Return neutral tool schemas (name + description + parameters) for all registered tools.
     * Provider adapters convert these to provider-specific format.
     */
    getSchemas() {
        return this.getTools().map(t => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
        }));
    }

    /**
     * Execute a tool by name.
     *
     * Translates short IDs → UUIDs in params before execution,
     * then registers new UUIDs and translates UUIDs → short IDs in results.
     *
     * @param {string} name
     * @param {object} params — parsed arguments from the LLM (may contain short IDs)
     * @param {object} store  — Zustand store proxy
     * @returns {Promise<object>} tool result (with short IDs)
     */
    async execute(name, params, store) {
        const tool = this._tools.get(name);
        if (!tool) {
            return { success: false, error: `Unknown tool: ${name}` };
        }
        try {
            // Translate short IDs → UUIDs before execution
            const translatedParams = idMapping.translateParams(params);
            const result = await tool.execute(translatedParams, store);
            // Register new UUIDs and translate UUIDs → short IDs in result
            return idMapping.translateResult(result);
        } catch (err) {
            console.error(`Tool '${name}' execution failed:`, err);
            return { success: false, error: err.message || String(err) };
        }
    }

    /**
     * Check if a tool requires user confirmation.
     */
    requiresConfirmation(name) {
        const tool = this._tools.get(name);
        return tool?.confirm ?? false;
    }

    /**
     * Clear all registered tools (useful for testing).
     */
    clear() {
        this._tools.clear();
    }
}

// Singleton instance
const registry = new ToolRegistry();
export default registry;
