
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
});

export default useTemplateSlice

