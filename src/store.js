// store.js
import {create} from 'zustand';
import {persist} from "zustand/middleware";
import {useNavigate} from "react-router-dom";
import themes from "./themes";
import extendTheme from "./themes/extendedTheme";
// import { useNavigate } from 'react-router-dom';
// import useStore from './path-to-your-store';  // Import your Zustand store
//
// const authRequest = async (url, options = {}) => {
//     const navigate = useNavigate();  // Initialize the navigate function
//
//     try {
//         // Retrieve the JWT directly from Zustand store
//         const jwtToken = useStore.getState().jwtToken;  // Get the JWT from Zustand
//
//         // Add Authorization header with the JWT
//         options.headers = {
//             ...options.headers,
//             'Authorization': `Bearer ${jwtToken}`,
//             'Content-Type': 'application/json', // Ensure content type is JSON
//         };
//
//         // Ensure credentials are included if needed
//         options.credentials = options.credentials || 'include';
//
//         const response = await fetch(url, options);
//
//         // Handle non-OK responses
//         if (!response.ok) {
//             if (response.status === 401) {
//                 // Unauthorized, navigate to the login page
//                 navigate('/login');
//             } else if (response.status === 403) {
//                 // Forbidden, navigate to an error page
//                 navigate('/forbidden');
//             } else if (response.status === 404) {
//                 // Not found, navigate to a 404 page
//                 navigate('/not-found');
//             } else {
//                 // Generic error handling, navigate to a generic error page
//                 navigate('/error');
//             }
//             return null;  // Return null or an appropriate value for failed requests
//         }
//
//         return response.json();  // Return the parsed JSON response for successful requests
//     } catch (error) {
//         console.error('Network or other error:', error);
//         // Navigate to an error page if a network error occurs
//         navigate('/error');
//         throw error;  // Re-throw the error so that it can be handled elsewhere if needed
//     }
// };

const authFetch = (set, get) => async (url, options = {}) => {
    const { jwtToken } = get();
    // const navigate = useNavigate();

    // Inject the JWT token into the request headers
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${jwtToken}`,
    };

    try {
        // const response = await fetch(url, options);
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            // Handle 401 Unauthorized
            set({ jwtToken: null });
            localStorage.removeItem('jwtToken');

            // Handle 401 Unauthorized
            // navigate('/signup');
            window.location.href = '/signup';
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};


const useStore = create(
    persist
    (
        (set, get) => ({
            arrayToMap: (array) => {
                return array.reduce((map, obj) => {
                    map[obj.name] = obj;
                    return map;
                }, {});
            },
            mapToArray: (map) => {
                return Object.values(map);
            },


            // Authenticated fetch function
            authenticatedFetch: authFetch(set, get),

            ENVIRONMENT: window.env.REACT_APP_ENVIRONMENT,
            ISM_API_BASE_URL: window.env.REACT_APP_ISM_API_BASE_URL,

            // channel selectors
            channelInputId: null,
            setChannelInputId: (channelInputId) => set({channelInputId: channelInputId}),

            channelOutputId: null,
            setChannelOutputId: (channelOutputId) => set({channelOutputId: channelOutputId}),

            channelSubscriberId: null,
            setChannelSubscriberId: (channelSubscriberId) => set({channelSubscriberId: channelSubscriberId}),

            jwtToken: null,

            // Set JWT token
            setJwtToken: (token) => {
                set({ jwtToken: token});
                localStorage.setItem('jwtToken', token);

                // localStorage.setItem('jwtToken', "testtoken");   // TODO NOTE: login bypass
            },

            // Clear JWT token (for logout)
            clearJwtToken: () => {
                set({ jwtToken: null});
                localStorage.removeItem('jwtToken');
            },

            // user profile (create account, fetch user id by auth)
            userId: null,
            // userId: "77c17315-3013-5bb8-8c42-32c28618101f",  // TODO NOTE: login bypass
            userProfile: null,
            setUserId: (userId) => set({ userId: userId }),

            selectedEdgeId: null,
            setSelectedEdgeId: (selectedEdgeId) => set({ selectedEdgeId: selectedEdgeId }),

            // selectedNodeId: null,
            // selectedNodeType: null,
            // setSelectedNode: async (type, id) => {
            //     set( { selectedNodeId: id })
            //     set( { selectedNodeType: type })
            // },

            // usage reports
            userUsageReport: {},
            setUserUsageReport: (userUsageReport) => set({ userUsageReport: userUsageReport }),

            // usage reports
            chartsUsageReport: [],
            setChartsUsageReport: (chartsUsageReport) => set({ chartsUsageReport: chartsUsageReport }),

            projectUsageReport: {},
            setProjectUsageReport: (projectUsageReport) => set({ projectUsageReport: projectUsageReport }),

            // Theme management
            activeTheme: 'matrix',  // default theme
            setActiveTheme: (activeTheme) => set({ activeTheme: activeTheme }),
            getCurrentTheme: () => extendTheme(get().activeTheme),

            // create user profile
            createUserProfile: async(userDetails) => {

                const response = await fetch(`${get().ISM_API_BASE_URL}/user`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userDetails),
                    redirect: 'follow', // Explicitly follow redirects
                });

                if (!response.ok) {
                    // TODO proper error handling -- throw new Error('Network response error when trying create or update user profile');
                }

                const data = await response.json();

                // assign the new user id
                get().setUserId(data['user_id'])
                return response
            },

            // fetch user
            fetchUserProfile: async () => {
                const { authenticatedFetch } = get();
                const response = await authenticatedFetch(`${get().ISM_API_BASE_URL}/user`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${get().jwtToken}`,
                    },
                });

                if (response.ok) {
                    const userProfile = await response.json();
                    set({userProfile: userProfile})
                    return userProfile
                }

                if (response.status === 404) {
                    set({userProfile: null});
                    return
                }

                // TODO proper error handling -- throw new Error('Network response was not ok');
            },

            // create a new session used to hold relevant information (mainly for chat dialogue)
            createSession: async() => {
                const { authenticatedFetch } = get();
                const response = await authenticatedFetch(`${get().ISM_API_BASE_URL}/session/create`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    redirect: 'follow', // Explicitly follow redirects
                });

                if (!response.ok) {
                    // TODO proper error handling -- throw new Error('network response error when trying create new session');
                }

                const data = await response.json();
                return data['session_id']
            },

            publishQueryState: async(stateId, queryState) => {
                const response = await fetch(`${get().ISM_API_BASE_URL}/state/${stateId}/forward/entry`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // body: JSON.stringify(queryState),
                    body: JSON.stringify(queryState),
                });

                if (!response.ok) {
                    // TODO proper error handling -- throw new Error('Network response error when trying to submit test query state for routing');
                }
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

            fetchMonitorLogEvents: async(projectId) => {
                if (!projectId)
                    projectId = get().selectedProjectId

                const response = await fetch(`${get().ISM_API_BASE_URL}/monitor/project/${projectId}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${get().jwtToken}`,
                    },
                });

                // TODO check to make sure it is a not found error
                if (response.status === 404) {
                    return []
                } else if (!response.ok) {
                    // TODO proper error handling -- throw new Error('Network response error when trying to fetch monitor log events')
                }

                return response.json()
            },

            fetchUsageReportGroupByUser: async() => {
                const user_id = get().userId
                const { authenticatedFetch } = get();
                const response = await authenticatedFetch(`${get().ISM_API_BASE_URL}/usage/user/${user_id}`);
                let usage = []

                // TODO check to make sure it is a not found error
                if (!response.ok) {
                    console.error('Network response error when trying to fetch usage report')
                } else {
                    usage = await response.json()
                }

                get().setUserUsageReport(usage[0])
                return usage[0]
            },

            fetchUsageReportGroupForCharts: async() => {
                const user_id = get().userId
                const response = await fetch(`${get().ISM_API_BASE_URL}/usage/user/${user_id}/charts`);
                let usage = []
                // TODO check to make sure it is a not found error
                if (!response.ok) {
                    console.error('Network response error when trying to fetch usage report')
                } else {
                    usage = await response.json()
                }

                get().setChartsUsageReport(usage)
                return usage
            },

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
            templates: [],
            getTemplate: (templateId) => {
                const { templates } = get(); // Get the current state of workflowNodes
                return templates.find(t => t.template_id === templateId); // This will be the node map if found, or undefined if not
            },
            setTemplates: (instructions) => set({ templates: instructions }),
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
                } catch (error) {
                    console.error('Failed to fetch projects:', error);
                }
            },

            // manage provider processors (e.g. openai, anthropic, python, etc..)
            providers: [],
            fetchProviders: async () => {
                // const projectId = get().selectedProjectId
                // const userId = get().selectedProjectId

                const url = `${get().ISM_API_BASE_URL}/provider/list`
                const response = await fetch(url)
                const providers = await response.json();
                set({providers});
                return providers
            },
            getProviderByNameAndClass: (providerName, className) => {
                const { providers } = get()
                return providers.filter(provider =>
                    provider.name.toLowerCase() === providerName.toLowerCase() &&
                    provider.class_name.toLowerCase() === className.toLowerCase()
                )
            },
            getProviderById: (id) => {
                const { providers } = get()
                return providers.find(provider => provider.id === id)
            },
            createProcessor: async (nodeId) => {
                if (!nodeId) {
                    console.log('warning: no node data found')
                }

                const node = get().getNode(nodeId)
                const projectId = get().selectedProjectId
                let processorData = get().getNodeData(nodeId)
                const processorObject =
                    {
                        "id": node.id,
                        "provider_id": processorData.provider_id,
                        "status": "CREATED",
                        "project_id": projectId
                    }

                const response = await fetch(`${get().ISM_API_BASE_URL}/processor/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(processorObject),
                });

                if (!response.ok) {
                    // TODO proper error handling -- throw new Error('Network response was not ok');
                }

                // reassign the new state data returned, this will provide an updated list of ids if any
                processorData = await response.json();
                get().setNodeData(nodeId, processorData)
            },

            fetchProcessor: async (processorId, set_data = true) => {
                if (!processorId) {
                    return
                }

                try {
                    const response = await fetch(`${get().ISM_API_BASE_URL}/processor/${processorId}`)
                    const processorData = await response.json();
                    if (set_data) {
                        get().setNodeData(processorId, processorData)
                    }
                    return processorData
                } catch (error) {
                    console.warn(`Warning, unable to fetch data for processor id: ${processorId} with error`, error);
                }
            },
            changeProcessorStatus: async (processorId, statusCode) => {
                const response = await fetch(`${get().ISM_API_BASE_URL}/processor/${processorId}/status/${statusCode}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // body: {},
                });

                if (!response.ok) {
                    // TODO proper error handling -- throw new Error('Network response was not ok');
                }

                const changed = await response.json();
                await get().fetchProcessor(processorId, true)
                return changed
            },
            fetchProcessors: async (project_id) => {
                try {
                    const response = await fetch(`${get().ISM_API_BASE_URL}/project/${project_id}/processors`);
                    const processors = await response.json();
                    set({ processors });
                } catch (error) {
                    console.error('Failed to fetch projects:', error);
                }
            },
            deleteProcessor: async (processorId) => {
                const response = await fetch(`${get().ISM_API_BASE_URL}/processor/${processorId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    // TODO proper error handling -- throw new Error('Network response was not ok');
                }

                // TODO delete the exact nodes and edges instead of doing a full refresh.
                const projectId = get().selectedProjectId
                await get().fetchWorkflowNodes(projectId);
                await get().fetchWorkflowEdges(projectId);
            },
            deleteProcessorStateWithWorkflowEdge: async(id) => {
                return await get().deleteWorkflowEdge(id).then(() => {
                    get().deleteProcessorState(id).then(() => {
                        const {workflowEdges} = get(); // Get the current state of workflowNodes
                        const updatedEdges = workflowEdges.filter(edge => edge.id !== id);

                        set((state) => ({
                            workflowEdges: updatedEdges,
                        }));
                    })
                })
            },
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

            // TODO combine these two methods (above), maybe the processor states can be derived from all the associated states or vice versa
            processorStates: {},
            setProcessorStates: (processor_states) => set({ processorStates: processor_states }),
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

            // projects list
            projects: [],
            selectedProjectId: null,
            setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
            fetchProjects: async (userId) => {
                // const response = await fetch(`${get().ISM_API_BASE_URL}/user/${userId}/projects`, {
                // const response = await fetch(`${get().ISM_API_BASE_URL}/monitor/project/${projectId}`, {
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
                    return
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

            // workflow node management
            // node properties
            selectedNode: null,
            setSelectedNode: (node) => set({ selectedNode: node }),

            workflowNodes: [],
            fetchWorkflowNodes: async (projectId) => {
                try {
                    set({ workflowNodes: []});

                    const response = await fetch(`${get().ISM_API_BASE_URL}/project/${projectId}/workflow/nodes`);
                    const nodes = await response.json();

                    // remap the api data structure to the internal reactflow data structure
                    const updatedNodes = nodes.map(node => ({
                        id: node.node_id,
                        type: node.node_type,
                        position: {
                            x: node.position_x,
                            y: node.position_y
                        },
                        data: {
                            id: node.node_id
                            // width: node.width,
                            // height: node.height,
                        }
                    }));

                    set({ workflowNodes: updatedNodes });
                } catch (error) {
                    console.error('Failed to fetch  nodes:', error);
                }
            },
            // Use .find() to search for the node with the matching ID
            getNode: (nodeId) => {
                const { workflowNodes } = get(); // Get the current state of workflowNodes
                return workflowNodes.find(node => node.id === nodeId); // This will be the node map if found, or undefined if not
            },
            // Use .find() to search for the node with the matching ID
            getNodeData: (nodeId) => {
                return get().getNode(nodeId)?.data
            },

            getNodeDataStateConfig: (nodeId) => {
                const node = get().getNode(nodeId)
                if (!node) {
                    console.error(`no node found by id ${nodeId}`)
                    return null
                }

                const nodeData = get().getNodeData(nodeId)

                //
                if (!nodeData?.config) {
                    nodeData.config = {
                        name: node?.node_label,
                        primary_key: [],
                        query_state_inheritance: [],
                        remap_query_state_columns: [],
                        template_columns: [],
                    }
                }

                return nodeData.config
            },

            getNodeDataColumns: (nodeId) => {
                const nodeData = get().getNodeData(nodeId)

                if (!nodeData?.columns) {
                    return []
                    // nodeData.columns = {}
                    // get().setNodeData(nodeId, nodeData)
                }

                return get().mapToArray(nodeData.columns)
            },

            setNodeDataColumns: (nodeId, columnsArray) => {
                const state = get().getNodeData(nodeId)
                state.columns = get().arrayToMap(columnsArray)
                get().setNodeData(nodeId, state)
            },

             deleteNodeDataStateConfigKeyDefinition: async (nodeId, definition_type, id) => {
                try {
                    const response = await fetch(`${get().ISM_API_BASE_URL}/state/${nodeId}/config/${definition_type}/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (!response.ok) {
                        // TODO proper error handling -- throw new Error('Network response was not ok');
                    }
                } catch (error) {
                    console.error(`Failed to delete state node configuration definition key ${definition_type} with id ${id}: `, error);
                }
            },

            getNodeDataStateConfigKeyDefinition: (nodeId, definition_name) => {
                const config = get().getNodeDataStateConfig(nodeId)
                if (!config) {
                    return null
                }
                return config[definition_name]
            },

            getNodeDataStateConfigActions: (nodeId) => {
                const config = get().getNodeDataStateConfig(nodeId)
                if (!config) {
                    return null
                }
                return config["actions"]
            },

            purgeStateData: async (stateId) => {
                if (!stateId) {
                    return
                }

                const response = await fetch(`${get().ISM_API_BASE_URL}/state/${stateId}/data`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    // TODO proper error handling -- throw new Error('Network response was not ok');
                }
            },

            // State Object Updates, Deletes, ...
            deleteState: async (stateId) => {
                if (!stateId) {
                    return {}
                }

                const response = await fetch(`${get().ISM_API_BASE_URL}/state/${stateId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${get().jwtToken}`,
                    }
                });

                if (!response.ok) {
                    // TODO proper error handling -- throw new Error('Network response was not ok');
                    return {}
                }

                // TODO delete the exact nodes and edges instead of doing a full refresh.
                const projectId = get().selectedProjectId
                await get().fetchWorkflowNodes(projectId);
                await get().fetchWorkflowEdges(projectId);
            },
            fetchState: async (stateId, load_state = false, setNodeData = true) => {
                if (!stateId) {
                    return
                }

                try {
                    const response = await fetch(`${get().ISM_API_BASE_URL}/state/${stateId}?load_data=${load_state}`)
                    let stateData = {
                        id: stateId
                    }

                    if (response.ok) {
                        stateData = await response.json();
                    }

                    // return quickly if state data is not found
                    if (setNodeData) {
                        get().setNodeData(stateId, stateData)
                    }

                    return stateData
                } catch (error) {
                    console.warn(`Warning, unable to fetch data for state id: ${stateId} with error`, error);
                }
            },

            createState: async (nodeId) => {
                if (!nodeId) {
                    console.log('warning: no node data found')
                }

                const node = get().getNode(nodeId)
                let stateData = get().getNodeData(nodeId)
                const stateObject =
                    {
                        "id": node.id,
                        "state_type": stateData.state_type || 'StateConfig',
                        "project_id": get().selectedProjectId,
                        "columns": stateData.columns || {},
                        "config": {
                            ...stateData.config, // append existing nodeData.config to the new object
                            "storage_class": "database",
                        }
                    }

                const response = await fetch(`${get().ISM_API_BASE_URL}/state/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(stateObject),
                });

                if (!response.ok) {
                    // TODO proper error handling -- throw new Error('Network response was not ok');
                }

                // reassign the new state data returned, this will provide an updated list of ids if any
                stateData = await response.json();
                get().setNodeData(nodeId, stateData)
                return stateData
            },

            uploadState: async (stateId, file) => {
                if (!stateId) {
                    // TODO proper error handling -- throw new Error('warning: no state id specified')
                }

                // const node = get().getNode(nodeId);
                // const nodeData = get().getNodeData(nodeId);
                const formData = new FormData();
                formData.append("file", file);

                try {
                    const response = await fetch(`${get().ISM_API_BASE_URL}/state/${stateId}/data/upload`, {
                        method: "POST",
                        body: formData,
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log(data);
                    } else {
                        // TODO proper error handling -- throw new Error("Upload of state dataset failed");
                    }
                } catch (error) {
                    console.error(error);
                }
            },

            // Function to update a node's data by ID
            setNodeData: (nodeId, newData) => {
                set(store => ({
                    // iterate each workflow node within the store
                    workflowNodes: store.workflowNodes.map(node => {
                            // if the node id ! does not match then return immediate
                            if (node.id !== nodeId) {
                                return node
                            }

                            // otherwise update the node data by appending to it
                            return { ...node,
                                data: {
                                    ...node.data, ...newData
                                }
                            }
                        }
                    )
                }));
            },
            deleteNode: async (nodeId) => {
                try {
                    const response = await fetch(`${get().ISM_API_BASE_URL}/workflow/node/${nodeId}/delete`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (!response.ok) {
                        // TODO proper error handling -- throw new Error('Network response was not ok');
                    }
                } catch (error) {
                    console.error('Failed to delete node:', error);
                }
            },
            updateNode: async (nodeId) => {
                try {
                    const node = get().getNode(nodeId)

                    const updatedNode = {
                        node_id: nodeId,
                        node_type: node.type,
                        node_label: node.data.label,
                        project_id: get().selectedProjectId,
                        object_id: node.data.objectId,
                        position_x: node.position.x,
                        position_y: node.position.y,
                        width: node.data.width,
                        height: node.data.height,
                    };

                    const response = await fetch(`${get().ISM_API_BASE_URL}/workflow/node/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedNode),
                    });

                    if (!response.ok) {
                        // TODO proper error handling -- throw new Error('Network response was not ok');
                    }
                } catch (error) {
                    console.error('Failed to create new node:', error);
                }
            },
            createNewNode: async (newNode) => {
                try {
                    // Assuming `newNode` is an object that matches the backend's expected request body
                    const response = await fetch(`${get().ISM_API_BASE_URL}/workflow/node/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newNode),
                    });

                    if (!response.ok) {
                        // TODO proper error handling -- throw new Error('Network response was not ok');
                    }

                    const createdNode = await response.json();

                    // Assuming the response contains the full node data in the expected format
                    const updatedNode = {
                        // this is primarily used for the workflow nodes, it holds general inforamtion about a node, but not its internal data structure
                        id: createdNode.node_id,
                        type: createdNode.node_type,
                        position: {
                            x: createdNode.position_x,
                            y: createdNode.position_y
                        },
                        data: {
                            name: createdNode.node_label,
                            width: createdNode.width,
                            height: createdNode.height,
                            // additional fields are added depending on what type of node type this is
                            // for example, in a state node, a config: {} attribute is added with relevant fields
                        }
                    };

                    // setWorkflowNodes([...workflowNodes, newNode])

                    // Get the current state of workflowNodes and append the new node
                    set((state) => ({
                        workflowNodes: [...state.workflowNodes, updatedNode],
                    }));

                    return updatedNode
                } catch (error) {
                    console.error('Failed to create new node:', error);
                }
            },
            setWorkflowNodes: (nodes) => set({ workflowNodes: nodes }),

            // workflow -> edges
            workflowEdges: [],
            fetchWorkflowEdges: async (projectId) => {
                try {
                    set({ workflowEdges: []});

                    const response = await fetch(`${get().ISM_API_BASE_URL}/project/${projectId}/workflow/edges`);
                    const edges = await response.json();

                    // remap the api data structure to the internal reactflow data structure
                    const updatedEdges = edges.map(edge => ({
                        // ...node, // Spread the original node properties
                        id: edge.source_node_id + ":" + edge.target_node_id,
                        source: edge.source_node_id,
                        target: edge.target_node_id,
                        sourceHandle: edge.source_handle,
                        targetHandle: edge.target_handle,
                        type: edge.type,
                        animated: false
                    }));

                    set({ workflowEdges: updatedEdges });
                } catch (error) {
                    console.error('Failed to fetch  edges:', error);
                }
            },
            findWorkflowEdgeById: (edgeId) => {
                const { workflowEdges } = get(); // Get the current state of workflowNodes
                return workflowEdges.find(edge => edge.id === edgeId);
            },
            deleteWorkflowEdge: async (edgeId) => {
                try {
                    const edge = get().findWorkflowEdgeById(edgeId)

                    const response = await fetch(`${get().ISM_API_BASE_URL}/workflow/edge`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            source_node_id: edge.source,
                            target_node_id: edge.target
                        }),
                    });

                    if (!response.ok) {
                        // TODO proper error handling -- throw new Error('Network response was not ok');
                    }
                } catch (error) {
                    console.error('Failed to delete node:', error);
                }
            },
            createProcessorWithWorkflowNode: async (nodeData) => {
                const newNode = await get().createNewNode(nodeData)
                const newNodeData = await get().createProcessor(newNode.id)

                get().setNodeData(newNodeData)
            },

            createStateWithWorkflowNode: async (nodeData) => {
                const newNode = await get().createNewNode(nodeData)
                const newNodeData = await get().createState(newNode.id)
            },

            createTrainerWithWorkflowNode: async (nodeData) => {
                const newNode = await get().createNewNode(nodeData)
                // const newNodeData = await get().createState(newNode.id)
            },

            createProcessorStateWithWorkflowEdge: async (connection) => {
                // createProcessorState(connection.id, targetNode.id, sourceNode.id, "INPUT")

                const sourceNode = get().getNode(connection.source)
                const targetNode = get().getNode(connection.target)
                const sourceType = sourceNode.type
                const targetType = targetNode.type

                // check to ensure that the source node to the target node is not of same type
                if (sourceType === targetType) {
                    console.error(`unable to connect ${sourceType} to ${targetType}, invalid connection`)
                    return
                }

                // persist the workflow edge configuration
                let newConnection= {
                    source_node_id: connection.source,
                    target_node_id: connection.target,
                    source_handle: connection.sourceHandle,
                    target_handle: connection.targetHandle,
                    type: 'default',
                    edge_label: "", // TODO make it editable?
                    animated: false,
                }

                // if the target node is a processor then the target node id is a processor id
                if (targetNode.type.startsWith('processor')) {
                    newConnection.type = 'state_auto_stream_playable_edge'
                    await get().createNewEdge(newConnection).then((updatedEdge) => {
                        get().createProcessorState(
                            {
                                "id": updatedEdge.id,
                                "processor_id": updatedEdge.target,
                                "state_id": updatedEdge.source,
                                "direction": "INPUT"
                            }
                        )
                    })
                }

                // if the target node is a state then the target node id is a state id
                if (targetNode.type.startsWith('state')) {
                    newConnection.type = 'default'
                    await get().createNewEdge(newConnection).then((updatedEdge) => {
                        get().createProcessorState(
                            {
                                "id": updatedEdge.id,
                                "processor_id": updatedEdge.source,
                                "state_id": updatedEdge.target,
                                "direction": "OUTPUT"
                            }
                        )
                    })
                }
                // get().createNewEdge(edge).then({
                //     get().createProcessorState(connection.id, targetNode.id, sourceNode.id, "INPUT")
                // })
            },
            createNewEdge: async (edge) => {
                const response = await fetch(`${get().ISM_API_BASE_URL}/workflow/edge/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(edge),
                });

                if (!response.ok) {
                    // TODO proper error handling -- throw new Error('Network response was not ok');
                }

                const newEdge = await response.json();

                const updatedEdge = {
                    id: newEdge.source_node_id + ":" + newEdge.target_node_id,
                    source: newEdge.source_node_id,
                    target: newEdge.target_node_id,
                    sourceHandle: newEdge.source_handle,
                    targetHandle: newEdge.target_handle,
                    type: newEdge.type,
                    // edge_label: newEdge
                    animated: false, // or based on the response if your API specifies this
                };

                // Update the local Zustand store
                set((state) => ({
                    workflowEdges: [...state.workflowEdges, updatedEdge],
                }));

                return updatedEdge
            },
            setWorkflowEdges: (edges) => set({ workflowEdges: edges }),
        }),
        {
            name: 'user-id-storage', // unique name for the storage
            getStorage: () => localStorage, // specify localStorage
            partialize: (state) => ({ userId: state.userId }), // only persist the userId field
        }
    )
)

export default useStore;
