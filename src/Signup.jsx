import React, { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import { auth } from "./firebase";

import {createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import CustomButton from "./CustomButton";
import useStore from "./store";

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
            navigate('/designer')
        } catch (error) {
            // Handle Errors here.
            console.error('Error signing in with Google:', error);
            const errorCode = error.code;
            const errorMessage = error.message;

            // The email of the user's account used.
            const email = error.customData?.email;

            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
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
            navigate('/designer')
        } catch {
            setNotice("Sorry, something went wrong. Please try again.");
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-center">
                <form className="w-full max-w-md mt-6 p-6 bg-white shadow-md rounded">
                    {notice && (
                        <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded" role="alert">
                            {notice}
                        </div>
                    )}

                    <div className="mb-4">
                        <CustomButton value="Google" icon="fa-google" onClick={signupWithGoogle} />
                    </div>



                    <div className="mb-4">
                        <label htmlFor="signupEmail" className="block text-gray-700 text-sm font-bold mb-2">Enter an
                            email address for your username</label>
                        <input
                            id="signupEmail"
                            type="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            aria-describedby="emailHelp"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="signupPassword"
                               className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            id="signupPassword"
                            type="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm
                            Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={signupWithUsernameAndPassword}
                        >
                            Signup
                        </button>
                    </div>
                    <div className="mt-4 text-center">
                <span>
                    Go back to login? <Link to="/" className="text-blue-500 hover:text-blue-700">Click here.</Link>
                </span>
                    </div>
                </form>
            </div>
        </div>

    )
}

export default Signup