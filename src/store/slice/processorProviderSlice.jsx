// manage provider processors (e.g. openai, anthropic, python, etc..)
export const useProcessorProviderSlice = (set, get) => ({
    providers: [],
    fetchProviders: async () => {
        // const projectId = get().selectedProjectId
        // const userId = get().selectedProjectId

        const response = await get().authGet('/provider/list')
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
    getProvidersByClass: (className) => {
        if (!className) {
            return []
        }
        const { providers } = get()
        return providers.filter(provider => provider.class_name.toLowerCase() === className.toLowerCase())
    },
    getProviderById: (id) => {
        const { providers } = get()
        return providers.find(provider => provider.id === id)
    },
});

export default useProcessorProviderSlice

