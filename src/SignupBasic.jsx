import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import {TerminalButton, TerminalInput} from "./components/common";
import {auth} from "./firebase/firebase";
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
            // const result = await signInWithPopup(auth, provider);
            // const user = result.user;

            // const token = await user.getIdToken();
            // const userDetails = { token: token, user: user };

            // Send the user details to the backend and get the JWT
            const response = await createUserProfileBasic({
                email: email,
                name: fullName,
                credentials: password,
            });

            // Store the JWT from the response header
            const jwtToken = response.headers.get('Authorization').split(' ')[1];
            // const jwtToken = "hello world - jwt"

            // Save JWT in localStorage
            localStorage.setItem('jwtToken', jwtToken);

            // Save JWT in Zustand store
            useStore.setState({ jwtToken });

            navigate('/home');
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    return (
        // <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in or create an account to get started
                </p>
            </div>

            {/*<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">*/}
            {/*    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">*/}
            {/*        {notice && (*/}
            {/*            <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded" role="alert">*/}
            {/*                {notice}*/}
            {/*            </div>*/}
            {/*        )}*/}
            {/*    </div>*/}
            {/*</div>*/}

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                </label>
                <div className="mt-1">
                    <TerminalInput
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <div className="mt-1">
                    <TerminalInput
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <div className="mt-1">
                    <TerminalInput
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <TerminalButton
                    variant="primary"
                    value="Sign up basic"
                    label="Sign up"
                    onClick={signupWithBasic}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >Signup</TerminalButton>
            </div>


            <div className="mt-8 text-center text-sm text-gray-500">
                By signing in, you agree to our{' '}
                <a href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                    Terms of Service
                </a>{' '} and{' '}
                <a href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                    Privacy Policy
                </a>
            </div>
        </div>
    )
}

export default SignupBasic