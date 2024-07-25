// App.js
import React, {useEffect} from "react";
import {
    createBrowserRouter,
    RouterProvider, useLocation, useNavigationType,
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

// const App = () => {
//     return (
//         <React.StrictMode>
//             <RouterProvider router={router} />
//         </React.StrictMode>
//     )
// }

const App = () => {
    const navigationType = useNavigationType();
    const location = useLocation();

    useEffect(() => {
        console.log('Route changed:', location.pathname);
        console.log('Navigation type:', navigationType);
    }, [location, navigationType]);

    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
}

export default App