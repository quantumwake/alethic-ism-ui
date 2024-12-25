export const createProjectSlice = (set, get) => ({

    // projects list
    projects: [],
    selectedProjectId: null,
    setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),

    fetchProjects: async (userId) => {
        const { authenticatedFetch } = get();
        const response = await authenticatedFetch(`${get().ISM_API_BASE_URL}/user/${userId}/projects`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get().jwtToken}`,
            },
        });

        if (response.ok) {
            const projects = await response.json();
            projects.sort((b, a) => new Date(a['created_date']) - new Date(b['created_date']));
            set({projects});
            return
        }

        if (response.status === 404) {
            set({projects: []});
        }
        // TODO proper error handling -- throw new Error('Network response was not ok');
    },

    addProject: async (userId, projectName) => {
        try {
            // invoke the new project api
            const response = await fetch(`${get().ISM_API_BASE_URL}/project/create`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_name: projectName,
                    user_id: userId
                }),
            });

            // ensure the response is ok 20x
            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }

            // update the project state
            const newProject = await response.json();
            set((state) => ({
                projects: [...state.projects, newProject],
            }));

            return true;
        } catch (error) {
            console.error('Failed to add project:', error);
            return false;
        }
    },

});

export default createProjectSlice

