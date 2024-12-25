// manage provider processors (e.g. openai, anthropic, python, etc..)
export const createProcessorProviderSlice = (set, get) => ({
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
});

export default createProcessorProviderSlice

