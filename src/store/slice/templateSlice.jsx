
export const useTemplateSlice = (set, get) => ({
    templates: [],
    getTemplate: (templateId) => {
        const { templates } = get(); // Get the current state of workflowNodes
        return templates.find(t => t.template_id === templateId); // This will be the node map if found, or undefined if not
    },
    setTemplates: (instructions) => set({ templates: instructions }),

    updateTemplate: async (template) => {
        set((state) => {
            // Check if the template already exists in the state store
            const existingIndex = state.templates.findIndex(
                t => t.template_id === template.template_id
            );

            if (existingIndex !== -1) {
                // Update the existing template
                const updatedTemplates = state.templates.map((t, index) =>
                    index === existingIndex ? template : t
                );
                return { templates: updatedTemplates };
            } else {
                // Insert the new template
                return { templates: [...state.templates, template] };
            }
        });
    },

    // manage templates (e.g. language templates, code templates, other types of templates used for instruction execution)
    saveTemplate: async (template) => {
        try {
            // invoke the new project api
            const response = await get().authPost('/template/create', template);

            // ensure the response is ok 20x
            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
                return null;
            }

            // update the project state
            const json = await response.json()
            await get().updateTemplate(json)
            return json; // Return the created template with server-assigned ID
        } catch (error) {
            console.error('Failed to add project:', error);
            return null;
        }
    },
    renameTemplate: async (template, new_name) => {
        try {
            // invoke the new project api
            const response = await get().authPut(`/template/${template.template_id}/rename/${new_name}`, null);

            // ensure the response is ok 20x
            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }

            // update the project state
            const json = await response.json()
            await get().updateTemplate(json)
            return true;
        } catch (error) {
            console.error('Failed to add project:', error);
            return false;
        }
    },
    fetchTemplates: async (projectId) => {
        try {
            set({ setTemplates: []});

            let templates = []
            const response = await get().authGet(`/project/${projectId}/templates`);
            if (response.ok) {
                templates = await response.json();
                set({templates});
            }
            set({templates});
            return templates
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    },

    // Fetch autocompletion data for Monaco editor
    fetchEditorCompletions: async (templateType, projectId) => {
        try {
            const response = await get().authGet(
                `/template/editor/completions/${templateType}/${projectId}`
            );
            if (response.ok) {
                return await response.json();
            }
            console.warn('Failed to fetch editor completions:', response.status);
            return null;
        } catch (error) {
            console.error('Failed to fetch editor completions:', error);
            return null;
        }
    },

    // AI chat completion for template generation
    chatCompletion: async (templateType, userMessage, currentTemplate, stateSamples, model = 'gpt-4o-mini', conversationContext = null) => {
        try {
            // Build the full user message with conversation context
            let fullMessage = userMessage;
            if (conversationContext) {
                fullMessage = `Previous conversation:\n${conversationContext}\n\nCurrent request: ${userMessage}`;
            }

            const response = await get().authPost('/template/chat/completion', {
                template_type: templateType,
                user_message: fullMessage,
                model: model,
                current_template: currentTemplate,
                state_samples: stateSamples
            });
            if (response.ok) {
                return await response.json();
            }
            console.error('Chat completion failed:', response.status);
            return null;
        } catch (error) {
            console.error('Chat completion error:', error);
            return null;
        }
    },

    // Fetch available AI models
    fetchAvailableModels: async () => {
        try {
            const response = await get().authGet('/template/models');
            if (response.ok) {
                return await response.json();
            }
            return ['gpt-4o-mini', 'gpt-4o'];
        } catch (error) {
            console.error('Failed to fetch models:', error);
            return ['gpt-4o-mini', 'gpt-4o'];
        }
    },

    // Fetch sample data from states in a project
    fetchStateSamples: async (projectId, limit = 10) => {
        try {
            const response = await get().authGet(`/template/state/samples/${projectId}?limit=${limit}`);
            if (response.ok) {
                return await response.json();
            }
            console.warn('Failed to fetch state samples:', response.status);
            return null;
        } catch (error) {
            console.error('Failed to fetch state samples:', error);
            return null;
        }
    },

    // Generate template from state data
    generateTemplateFromState: async (stateId, templateType, userInstructions = null, model = 'gpt-4o-mini') => {
        try {
            const response = await get().authPost('/template/generate/from-state', {
                template_type: templateType,
                state_id: stateId,
                user_instructions: userInstructions,
                model: model,
                sample_limit: 10
            });
            if (response.ok) {
                return await response.json();
            }
            console.error('Generate template failed:', response.status);
            return null;
        } catch (error) {
            console.error('Generate template error:', error);
            return null;
        }
    },
});

export default useTemplateSlice

