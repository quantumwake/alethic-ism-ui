import React, { useState } from "react";
import {useNavigate, Link} from "react-router-dom";
import {TerminalButton, TerminalInput} from "./components/common";
import {useStore} from "./store";

const SignupBasic = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notice, setNotice] = useState("");

    const createUserProfileBasic = useStore(state=> state.createUserProfileBasic)

    const signupWithBasic = async () => {
        try {
            // Send the user details to the backend and get the JWT
            const user = await createUserProfileBasic({
                email: email,
                name: fullName,
                credentials: password,
            });

            if (user) {
                navigate('/home');
            } else {
                setNotice("Error creating user profile. Please try again.");
            }
        } catch (error) {
            console.error('Error signing in with local account:', error);
        }
    };

    return (
        <div className="min-h-screen bg-midnight-base flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-midnight-text-primary">
                        Welcome
                    </h2>
                    <p className="mt-2 text-sm text-midnight-text-muted">
                        Sign in or create an account to get started
                    </p>
                </div>

                <div className="bg-midnight-surface border border-midnight-border rounded-lg shadow-midnight-glow p-8">
                    {notice && (
                        <div className="mb-6 p-4 bg-midnight-warning/20 border border-midnight-warning/40 text-midnight-warning-bright rounded-md text-sm">
                            {notice}
                        </div>
                    )}

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-midnight-text-label mb-2">
                                Full Name
                            </label>
                            <TerminalInput
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-midnight-text-label mb-2">
                                Email
                            </label>
                            <TerminalInput
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-midnight-text-label mb-2">
                                Password
                            </label>
                            <TerminalInput
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                            />
                        </div>

                        <TerminalButton
                            variant="primary"
                            onClick={signupWithBasic}
                            className="w-full"
                        >
                            Sign Up
                        </TerminalButton>
                    </form>

                    <div className="mt-6 text-center text-sm text-midnight-text-subdued">
                        By signing up, you agree to our{' '}
                        <Link to="/terms" className="text-midnight-accent-bright hover:text-midnight-accent transition-colors">
                            Terms of Service
                        </Link>{' '}and{' '}
                        <Link to="/privacy" className="text-midnight-accent-bright hover:text-midnight-accent transition-colors">
                            Privacy Policy
                        </Link>
                    </div>

                    <div className="mt-4 text-center text-sm text-midnight-text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="text-midnight-accent-bright hover:text-midnight-accent transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignupBasic
