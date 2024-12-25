import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useStore} from "./store";

const withAuth = (Component) => {
    return (props) => {
        const navigate = useNavigate();
        const userId = useStore((state) => state.userId);

        useEffect(() => {
            if (!userId) {
                navigate('/signup'); // Redirect to login if userId is not set
            }
        }, [userId, navigate]);

        return userId ? <Component {...props} /> : null; // Render component if userId is set
    };
};

export default withAuth;