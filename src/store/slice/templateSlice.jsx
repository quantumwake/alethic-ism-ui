export const createTemplateSlice = (set, get) => ({
    templates: [],
    getTemplate: (templateId) => {
        const { templates } = get(); // Get the current state of workflowNodes
        return templates.find(t => t.template_id === templateId); // This will be the node map if found, or undefined if not
    },
    setTemplates: (instructions) => set({ templates: instructions }),

    insertOrUpdateTemplate: async (instructionTemplate) => {
        set((state) => {
            // Check if the template already exists in the state store
            const existingIndex = state.templates.findIndex(template => template.template_id === instructionTemplate.template_id);

            if (existingIndex !== -1) {
                // Update the existing template
                const updatedTemplates = state.templates.map((template, index) =>
                    index === existingIndex ? instructionTemplate : template
                );
                return { templates: updatedTemplates };
            } else {
                // Insert the new template
                return { templates: [...state.templates, instructionTemplate] };
            }
        });
    },

    // manage templates (e.g. language templates, code templates, other types of templates used for instruction execution)
    createTemplate: async (instructionTemplate) => {
        try {
            // invoke the new project api
            const response = await fetch(`${get().ISM_API_BASE_URL}/template/create`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(instructionTemplate),
            });

            // ensure the response is ok 20x
            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }

            // update the project state
            const newInstructionTemplate = await response.json()
            await get().insertOrUpdateTemplate(newInstructionTemplate)
            return true;
        } catch (error) {
            console.error('Failed to add project:', error);
            return false;
        }
    },

    fetchTemplates: async (projectId) => {
        try {
            set({ setTemplates: []});

            const response = await fetch(`${get().ISM_API_BASE_URL}/project/${projectId}/templates`);
            const templates = await response.json();
            if (response.ok) {
                set({templates});
            } else {
                set((state) => ({
                    templates: []
                }));
            }
            return templates
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    },
});

export default createTemplateSlice

