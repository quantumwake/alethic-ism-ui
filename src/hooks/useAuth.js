import {useCallback} from "react";
import {useStore} from "@/store";

export const useAuth = () => {
    const store = useStore();

    const login = useCallback(async (credentials) => {
        // Centralized login logic
    }, []);

    const logout = useCallback(() => {
        store.clearJwtToken();
        // Clear all auth state
    }, []);

    return { login, logout, user: store.userProfile };
}
