/**
 * Base provider adapter interface.
 *
 * Subclasses convert between the neutral tool schema format used by the
 * ToolRegistry and the specific format expected by an LLM provider (OpenAI,
 * Anthropic, etc.).
 */

export class BaseProviderAdapter {
    /**
     * Convert neutral tool schemas to provider-specific tool definitions
     * that get sent in the API request.
     * @param {Array<{name, description, parameters}>} schemas
     * @returns {Array<object>}
     */
    formatTools(schemas) {
        throw new Error('formatTools() not implemented');
    }

    /**
     * Parse the provider response and extract tool calls in a common shape:
     *   [{ id, name, arguments }]
     * @param {object} response — raw provider response
     * @returns {{ content: string|null, toolCalls: Array<{id, name, arguments}> }}
     */
    parseResponse(response) {
        throw new Error('parseResponse() not implemented');
    }

    /**
     * Build the messages array entry for tool results that get sent back to the
     * LLM so it can incorporate the execution output.
     * @param {Array<{id, name, result}>} toolResults
     * @returns {Array<object>} messages to append
     */
    formatToolResults(toolResults) {
        throw new Error('formatToolResults() not implemented');
    }

    /**
     * Build the assistant message entry that contains tool calls (for conversation
     * history continuity).
     * @param {string|null} content
     * @param {Array<{id, name, arguments}>} toolCalls
     * @returns {object}
     */
    formatAssistantToolCallMessage(content, toolCalls) {
        throw new Error('formatAssistantToolCallMessage() not implemented');
    }
}

export default BaseProviderAdapter;
