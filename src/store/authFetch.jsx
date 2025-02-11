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
}

export default authFetch