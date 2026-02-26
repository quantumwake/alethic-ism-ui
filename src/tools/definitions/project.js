import registry from '../registry.js';
import { CLASS_NAME_TO_STATE_CONFIG } from '../systemPrompt.js';

/**
 * Project-level tools — summary, list processors, list states, list providers.
 */
export function registerProjectTools() {

    // ─── Get Project Summary ───────────────────────────────────────────
    registry.register({
        name: 'get_project_summary',
        description: 'Get an overview of the current project including node count, edge count, and key details.',
        category: 'project',
        confirm: false,
        parameters: { type: 'object', properties: {}, required: [] },
        execute: async (_params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const nodes = store.workflowNodes || [];
            const edges = store.workflowEdges || [];
            const templates = store.templates || [];

            const stateNodes = nodes.filter(n => n.type === 'state');
            const processorNodes = nodes.filter(n => n.type?.startsWith('processor') || n.type?.startsWith('function'));

            return {
                success: true,
                project_id: projectId,
                total_nodes: nodes.length,
                state_nodes: stateNodes.length,
                processor_nodes: processorNodes.length,
                total_edges: edges.length,
                total_templates: templates.length,
                nodes: nodes.map(n => ({
                    id: n.id,
                    type: n.type,
                    label: n.data?.name || n.data?.label || n.type,
                })),
            };
        },
    });

    // ─── List Processors ───────────────────────────────────────────────
    registry.register({
        name: 'list_processors',
        description: 'List all processors in the current project with their status.',
        category: 'project',
        confirm: false,
        parameters: { type: 'object', properties: {}, required: [] },
        execute: async (_params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const response = await store.authGet(`/project/${projectId}/processors`);
            if (!response.ok) return { success: false, error: `Failed to list processors: ${response.status}` };

            const processors = await response.json();
            return {
                success: true,
                count: processors.length,
                processors: processors.map(p => ({
                    id: p.id,
                    name: p.name,
                    status: p.status,
                    provider_id: p.provider_id,
                    class_name: p.class_name,
                })),
            };
        },
    });

    // ─── List States ───────────────────────────────────────────────────
    registry.register({
        name: 'list_states',
        description: 'List all states in the current project with their config types.',
        category: 'project',
        confirm: false,
        parameters: { type: 'object', properties: {}, required: [] },
        execute: async (_params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const response = await store.authGet(`/project/${projectId}/states`);
            if (!response.ok) return { success: false, error: `Failed to list states: ${response.status}` };

            const states = await response.json();
            return {
                success: true,
                count: states.length,
                states: states.map(s => ({
                    id: s.state_id || s.id,
                    state_type: s.state_type,
                    config: s.config,
                })),
            };
        },
    });
    // ─── List Providers ──────────────────────────────────────────────────
    registry.register({
        name: 'list_providers',
        description: 'List all available runtime providers. Providers are API key configurations (e.g. OpenAI, Anthropic) that processors use. Each provider has an id, name, version, and class_name. Use the provider id with set_processor_provider to assign one to a processor.',
        category: 'project',
        confirm: false,
        parameters: { type: 'object', properties: {}, required: [] },
        execute: async (_params, store) => {
            // Fetch fresh providers if needed
            let providers = store.providers || [];
            if (providers.length === 0) {
                providers = await store.fetchProviders();
            }

            return {
                success: true,
                count: providers?.length || 0,
                providers: (providers || []).map(p => ({
                    id: p.id,
                    name: p.name,
                    version: p.version,
                    class_name: p.class_name,
                    state_config_type: CLASS_NAME_TO_STATE_CONFIG[p.class_name] || 'StateConfig',
                })),
            };
        },
    });

    // ─── Create Project ─────────────────────────────────────────────────
    registry.register({
        name: 'create_project',
        description: 'Create a new project, save it, and auto-select it. Returns the new project ID.',
        category: 'project',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                project_name: { type: 'string', description: 'Name for the new project' },
            },
            required: ['project_name'],
        },
        execute: async (params, store) => {
            const project = await store.newProject(params.project_name);
            const saved = await store.saveProject(project);
            if (!saved) {
                return { success: false, error: 'Failed to save project' };
            }

            // The saved project is now at the top of the projects list
            const projects = store.projects || [];
            const created = projects[0];
            if (!created?.project_id) {
                return { success: false, error: 'Project created but could not retrieve project ID' };
            }

            // Auto-select the new project and load its (empty) workflow
            store.setSelectedProjectId(created.project_id);
            await store.fetchWorkflowNodes(created.project_id);
            await store.fetchWorkflowEdges(created.project_id);
            store.setCurrentWorkspace('bench');

            return {
                success: true,
                project_id: created.project_id,
                project_name: created.project_name,
            };
        },
    });

    // ─── List Projects ──────────────────────────────────────────────────
    registry.register({
        name: 'list_projects',
        description: 'List all projects for the current user.',
        category: 'project',
        confirm: false,
        parameters: { type: 'object', properties: {}, required: [] },
        execute: async (_params, store) => {
            // Fetch fresh list
            const userId = store.userId;
            if (!userId) return { success: false, error: 'No user logged in' };

            const projects = await store.fetchProjects(userId);
            return {
                success: true,
                count: (projects || []).length,
                projects: (projects || []).map(p => ({
                    project_id: p.project_id,
                    project_name: p.project_name,
                    created_date: p.created_date,
                })),
            };
        },
    });

    // ─── Open Project ───────────────────────────────────────────────────
    registry.register({
        name: 'open_project',
        description: 'Open an existing project by its ID — loads nodes, edges, templates, providers and switches to the bench workspace.',
        category: 'project',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                project_id: { type: 'string', description: 'The project ID to open' },
            },
            required: ['project_id'],
        },
        execute: async (params, store) => {
            const projectId = params.project_id;

            // Load project data
            await store.fetchWorkflowNodes(projectId);
            await store.fetchWorkflowEdges(projectId);
            await store.fetchTemplates(projectId);
            await store.fetchProviders();
            store.setSelectedProjectId(projectId);
            store.setCurrentWorkspace('bench');

            const nodes = store.workflowNodes || [];
            const edges = store.workflowEdges || [];

            // Find project name from the projects list
            const projects = store.projects || [];
            const project = projects.find(p => p.project_id === projectId);

            return {
                success: true,
                project_id: projectId,
                project_name: project?.project_name || '(unknown)',
                node_count: nodes.length,
                edge_count: edges.length,
            };
        },
    });
}

export default registerProjectTools;
