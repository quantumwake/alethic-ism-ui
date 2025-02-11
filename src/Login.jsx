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
        <div className="container mx-auto">
            <div className="flex justify-center">
                <form className="w-full max-w-md mt-6 p-6 bg-white shadow-md rounded">
                    {notice && (
                        <div className="alert alert-warning mb-4 p-4 bg-yellow-100 text-yellow-700 rounded"
                             role="alert">
                            {notice}
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email
                            address</label>
                        <input
                            type="email"
                            id="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password"
                               className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={loginWithUsernameAndPassword}
                        >
                            Submit
                        </button>
                    </div>
                    <div className="mt-4 text-center">
                        <span>
                            Need to sign up for an account? <Link to="/signup"
                                                                  className="text-blue-500 hover:text-blue-700">Click here.</Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login