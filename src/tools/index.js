/**
 * Tool bootstrap — registers all tool definitions on import.
 *
 * Import this module at app startup (e.g. in the chat assistant slice or
 * AIAssistantTab) to ensure all tools are available before the first
 * chat message is sent.
 */

import { registerWorkflowTools } from './definitions/workflow.js';
import { registerStateTools } from './definitions/state.js';
import { registerProcessorTools } from './definitions/processor.js';
import { registerTemplateTools } from './definitions/template.js';
import { registerEdgeFunctionTools } from './definitions/edgeFunction.js';
import { registerDataTools } from './definitions/data.js';
import { registerProjectTools } from './definitions/project.js';
import { registerUITools } from './definitions/ui.js';

let _initialized = false;

export function initializeTools() {
    if (_initialized) return;
    _initialized = true;

    registerWorkflowTools();
    registerStateTools();
    registerProcessorTools();
    registerTemplateTools();
    registerEdgeFunctionTools();
    registerDataTools();
    registerProjectTools();
    registerUITools();
}

// Auto-initialize on import
initializeTools();

export { default as registry } from './registry.js';
export { default as autoLayout } from './autoLayout.js';
export { buildSystemPrompt } from './systemPrompt.js';
