export const useProjectSlice = (set, get) => ({

    // projects list
    projects: [],
    selectedProjectId: null,
    setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),

    upsertProject: async(project) => {
        set((state) => ({
            projects: [project, ...state.projects],
        }));
    },
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
    newProject: async (name) => {
        return {
            "user_id": get().userId,
            "project_name": name
        }
    },
    updateProject: async (project) => {
        if (!project?.project_id) return; // ensure project_id is valid

        // immutability
        set(state => ({
            projects: state.projects.map(p =>
                p.project.project_id === project.project_id
                    ? { ...p, project: { ...p.project, ...project } } // Update matching project
                    : p // Keep other projects unchanged
            )
        }));
    },
    saveProject: async (project) => {
        try {
            const isNew = project?.project_id === undefined || project?.project_id === null

            // invoke the new project api
            const response = await fetch(`${get().ISM_API_BASE_URL}/project/create`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project),
            });

            // ensure the response is ok 20x
            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }

            // update the projects state values
            project = await response.json()
            if (isNew) {
                await get().upsertProject(project)
            }
            else {
                await get().updateProject(project)
            }
            return true;
        } catch (error) {
            console.error('Failed to add project:', error);
            return false;
        }
    },

});

export default useProjectSlice

