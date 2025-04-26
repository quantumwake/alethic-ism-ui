import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import {TerminalButton} from "./components/common";
import {signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import {auth} from "./firebase/firebase";
import {useStore} from "./store";

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notice, setNotice] = useState("");
    const provider = new GoogleAuthProvider();
    const theme = useStore(state => state.getCurrentTheme());

    const {createUserProfileGoogle} = useStore()

    const signupWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const token = await user.getIdToken();
            const userDetails = { token: token, user: user };

            // Send the user details to the backend and get the JWT
            await createUserProfileGoogle(userDetails);

            navigate('/home');
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.font} flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${theme.effects.enableCrt ? theme.effects.crtClass : ''}`}>
            <div className={`${theme.effects.enableScanlines ? theme.effects.scanlineClass : ''} w-full h-full`}>
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className={`mt-6 text-center text-3xl font-extrabold ${theme.textAccent}`}>
                        Welcome
                    </h2>
                    <p className={`mt-2 text-center text-sm ${theme.textMuted}`}>
                        Sign in or create an account to get started
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className={`${theme.card.base} py-8 px-4 sm:px-10`}>
                        {notice && (
                            <div className="mb-4 p-4 bg-amber-950 text-amber-300 rounded" role="alert">
                                {notice}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <TerminalButton
                                    variant="primary"
                                    value="Sign in with Google"
                                    icon="fa-google"
                                    onClick={signupWithGoogle}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium"
                                />
                            </div>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className={`w-full border-t ${theme.border}`}></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                    <span className={`px-2 ${theme.bg} ${theme.text}`}>
                                        Why use Google Sign-In?
                                    </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`mt-6 text-center text-sm ${theme.text}`}>
                                <ul className="list-disc list-inside">
                                    <li>Quick and easy access</li>
                                    <li>No need to remember another password</li>
                                    <li>Secure authentication process</li>
                                    <li>Access to Google-connected features</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`mt-8 text-center text-sm ${theme.textMuted}`}>
                    By signing in, you agree to our{' '}
                    <a href="/terms" className={`font-medium ${theme.textAccent} ${theme.hover}`}>
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className={`font-medium ${theme.textAccent} ${theme.hover}`}>
                        Privacy Policy
                    </a>
                    .
                </div>
            </div>
        </div>
    )
}

export default Signup