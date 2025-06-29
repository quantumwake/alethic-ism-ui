export const useFilterSlice = (set, get) => ({
    // Create or update a filter
    createOrUpdateFilter: async (filter) => {
        try {
            const response = await get().authPost('/filter', filter);
            
            if (!response?.ok) {
                const error = await response.text();
                console.error('Failed to create/update filter:', error);
                return null;
            }
            
            const savedFilter = await response.json();
            return savedFilter;
        } catch (error) {
            console.error('Error creating/updating filter:', error);
            return null;
        }
    },

    // Fetch a single filter by ID
    fetchFilter: async (filterId) => {
        try {
            const response = await get().authGet(`/filter/${filterId}`);
            
            if (!response?.ok) {
                return null;
            }
            
            const filter = await response.json();
            return filter;
        } catch (error) {
            console.error('Error fetching filter:', error);
            return null;
        }
    },

    // Fetch all filters for the current user
    fetchUserFilters: async () => {
        try {
            const response = await get().authGet('/filter/user');
            
            if (!response?.ok) {
                return [];
            }
            
            const filters = await response.json();
            return filters;
        } catch (error) {
            console.error('Error fetching user filters:', error);
            return [];
        }
    },

    // Delete a filter
    deleteFilter: async (filterId) => {
        try {
            const response = await get().authDelete(`/filter/${filterId}`);
            
            if (!response?.ok) {
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting filter:', error);
            return false;
        }
    },

    // Apply a filter to data
    applyFilter: async (filterId, data) => {
        try {
            const response = await get().authPut(`/filter/apply?filter_id=${filterId}`, data);
            
            if (!response?.ok) {
                return false;
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error applying filter:', error);
            return false;
        }
    }
});