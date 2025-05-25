const standardFetch = (set, get) => async (url, options = {}) => {
    try {
        const headers = {
            ...options.headers,
        };
        return await fetch(url, { ...options, headers });
    } catch (error) {
        throw error;
    }
}

export default standardFetch