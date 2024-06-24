// App.js
import React from "react";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Designer from "./Designer";
import {ReactFlowProvider} from "reactflow";
import RootLayout from "./RootLayout";
import Login from "./Login";
import Signup from "./Signup";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout/>,
        // loader: () => ({}),
        children: [
            {
                path: "/designer",
                element:
                    <ReactFlowProvider>
                        <Designer/>
                    </ReactFlowProvider>
            },
            {
                path: "/login",
                element: <Login/>
            },
            {
                path: "/signup",
                element: <Signup />
            }
        ]
    }
]);

const App = () => {
    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    )
}

export default App