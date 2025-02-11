import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import {TerminalButton} from "./components/common";
import {createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import {auth} from "./firebase/firebase";
import {useStore} from "./store";

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notice, setNotice] = useState("");
    const provider = new GoogleAuthProvider();

    const createUserProfile = useStore(state => state.createUserProfile)

    const signupWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const token = await user.getIdToken();
            const userDetails = { token: token, user: user };

            // Send the user details to the backend and get the JWT
            const response = await createUserProfile(userDetails);

            // Store the JWT from the response header
            const jwtToken = response.headers.get('Authorization').split(' ')[1];

            // Save JWT in localStorage
            localStorage.setItem('jwtToken', jwtToken);

            // Save JWT in Zustand store
            useStore.setState({ jwtToken });

            navigate('/home');
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };


    const signupWithUsernameAndPassword = async (e) => {
        if (password !== confirmPassword) {
            setNotice("Passwords don't match. Please try again.");
        }

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

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
            navigate('/home')
        } catch {
            setNotice("Sorry, something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in or create an account to get started
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {notice && (
                        <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded" role="alert">
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
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Why use Google Sign-In?
                  </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center text-sm text-gray-500">
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

            <div className="mt-8 text-center text-sm text-gray-500">
                By signing in, you agree to our{' '}
                <a href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                    Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                    Privacy Policy
                </a>
                .
            </div>
        </div>
    )
}

export default Signup