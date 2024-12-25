export const createProcessorStateSlice = (set, get) => ({
    // TODO combine these two methods (above), maybe the processor states can be derived from all the associated states or vice versa
    processorStates: {},
    setProcessorStates: (processor_states) => set({ processorStates: processor_states }),

    deleteProcessorState: async (routeId) => {
        try {
            const response = await fetch(`${get().ISM_API_BASE_URL}/processor/state/route/${routeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error(`Failed to delete state node configuration definition key  with id ${routeId}: `, error);
        }
    },

    // createProcessorState: async (id, processorId, stateId, direction) => {
    createProcessorState: async (processorState) => {

        const response = await fetch(`${get().ISM_API_BASE_URL}/processor/state/route`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processorState),
        });

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response was not ok');
        }

        // set only if the processor state is ok
        if (response.ok) {
            const processorId = processorState.processor_id
            let processorData = get().getNodeData(processorId)
            let associatedStates = processorData.associated_states || []

            // append the newly created processor state, this will provide an updated list of ids if any
            let associatedStateResponse = await response.json();
            associatedStates = [...associatedStates, associatedStateResponse]
            get().setNodeData(processorId, {
                ...processorData,
                'associated_states': associatedStates
            })
        }
    },


    // TODO combine these two methods (below), maybe the processor states can be derived from all the associated states or vice versa
    fetchProcessorStates: async (processorId) => {
        try {
            const response = await fetch(`${get().ISM_API_BASE_URL}/processor/${processorId}/states`);

            if (response.ok) {
                const processor_states = await response.json();
                get().setNodeData(processorId, {
                    ...get().getNodeData(processorId),
                    associated_states: processor_states
                })
            }
        } catch (error) {
            console.error('Failed to fetch processor states:', error);
        }
    },

    fetchProjectProcessorStates: async (projectId) => {

        // set the project id if not set
        projectId = projectId || get().selectedProjectId
        const response = await fetch(`${get().ISM_API_BASE_URL}/project/${projectId}/processor/states`)

        // validate
        if (response.status === 404) {
            get().setProcessorStates({})
        } else if (!response.ok) {
            // TODO proper error handling -- throw new Error('error fetching processor states by project')
        }

        // parse the data
        let processor_state_map = {}
        const processor_states = await response.json();
        if (processor_states)
            processor_state_map = processor_states.reduce((map, obj) => {

                if (obj.direction === "INPUT") {
                    map[`${obj.state_id}:${obj.processor_id}`] = obj;
                } else if (obj.direction === "OUTPUT") {
                    map[`${obj.processor_id}:${obj.state_id}`] = obj;
                }

                return map;
            }, {});

        get().setProcessorStates(processor_state_map)
    },

    executeProcessorStateRoute: async(route_id) => {
        try {

            // const response = await fetch(`${get().ISM_API_BASE_URL}/route/${stateId}/${processorId}/forward/complete`, {
            const response = await fetch(`${get().ISM_API_BASE_URL}/processor/state/route/${route_id}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                // body: JSON.stringify(queryState),
                // body: queryState,
            });

            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response error when trying to submit test query state for routing');
            }

            return true
        } catch (error) {
            console.error('Failed to add project:', error)
            return false
        } finally {

        }
    },

});

export default createProcessorStateSlice