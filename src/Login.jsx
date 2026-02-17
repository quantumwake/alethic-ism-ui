import { useState } from "react";
import { auth } from "./firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import {useStore} from "./store";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [notice, setNotice] = useState("");
    const createUserProfile = useStore(state => state.createUserProfile)

    const loginWithUsernameAndPassword = async (e) => {
        e.preventDefault();

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);

            // This gives you a Google Access Token used by the API to validate and create the user profile
            // const credential = GoogleAuthProvider.credentialFromResult(result);
            // const token = credential.accessToken
            const user = result.user;

            const token = await user.getIdToken()
            const userDetails = {
                token: token,
                user: user
            };

            await createUserProfile(userDetails)
            navigate("/designer");
        } catch {
            setNotice("You entered a wrong username or password.");
        }
    }

    return (
        <div className="min-h-screen bg-midnight-base flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-midnight-surface border border-midnight-border rounded-lg shadow-midnight-glow">
                <h1 className="text-2xl font-bold text-midnight-text-primary mb-6 text-center">Sign In</h1>

                {notice && (
                    <div className="mb-4 p-4 bg-midnight-warning/20 border border-midnight-warning/40 text-midnight-warning-bright rounded-md text-sm">
                        {notice}
                    </div>
                )}

                <form onSubmit={loginWithUsernameAndPassword}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-midnight-text-label text-sm font-medium mb-2">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 bg-midnight-base border border-midnight-border rounded-md text-midnight-text-body placeholder-midnight-text-disabled focus:outline-none focus:border-midnight-accent focus:ring-1 focus:ring-midnight-accent/50 transition-colors"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-midnight-text-label text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-3 py-2 bg-midnight-base border border-midnight-border rounded-md text-midnight-text-body placeholder-midnight-text-disabled focus:outline-none focus:border-midnight-accent focus:ring-1 focus:ring-midnight-accent/50 transition-colors"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-midnight-info hover:bg-midnight-info-bright text-white font-medium rounded-md shadow-midnight-info transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-midnight-info/50"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-midnight-text-muted">
                    Need to sign up for an account?{' '}
                    <Link to="/signup" className="text-midnight-accent-bright hover:text-midnight-accent transition-colors">
                        Click here.
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login
