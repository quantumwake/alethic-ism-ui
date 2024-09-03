// App.js
import React, {useEffect} from "react";
import {
    createBrowserRouter, Outlet, Route,
    RouterProvider, useLocation, useNavigationType,
} from "react-router-dom";
import {ReactFlowProvider} from "reactflow";
import RootLayout from "./RootLayout";
import Login from "./Login";
import Signup from "./Signup";
import DiscourseChannel from "./DiscourseChannel";
import WebSocketMessageDisplay from "./WebSocketMessageDisplay";
import useStore from "./store";
import Studio from "./Studio";


const RouteLogger = () => {
    const navigationType = useNavigationType();
    const location = useLocation();

    useEffect(() => {
        console.log('Route changed:', location.pathname);
        console.log('Navigation type:', navigationType);
    }, [location, navigationType]);

    return null; // This component doesn't render anything
};

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <>
                <RouteLogger />
                <RootLayout/>
                {/*<RootLayout>*/}
                {/*    <Outlet />*/}
                {/*</RootLayout>*/}
            </>
        ),
        // element: <RootLayout/>,
        // loader: () => ({}),
        children: [
            {
                path: "/studio",
                element:
                    <ReactFlowProvider>
                        <Studio/>
                    </ReactFlowProvider>
            },
            {
                path: "/login",
                element: <Login/>
            },
            {
                path: "/signup",
                element: <Signup />
            },
            // {
                // path: "/discourse/:isid/:osid/:sid/:uid",
                // element: <DiscourseChannel />
            // },
            // {
            //     path: "/stream/analyzer",
            //     element: <WebSocketMessageDisplay />
            // },
            // {
            //     path: "/filter",
            //     element: <StateDataFilterDialog />
            // }
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
    const setJwtToken = useStore(state => state.setJwtToken);

    useEffect(() => {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            setJwtToken(jwtToken);
        }
    }, [setJwtToken]);

    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
}

export default App