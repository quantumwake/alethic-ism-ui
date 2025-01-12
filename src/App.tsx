import React, {useEffect} from "react";
import {createBrowserRouter, RouterProvider, useLocation, useNavigationType} from "react-router-dom";
import {ReactFlowProvider} from "@xyflow/react";
import RootLayout from "./RootLayout";
import Login from "./Login";
import Signup from "./Signup";
import Layout from "./Layout";
import {useStore} from "./store";

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
                path: "/home",
                element:
                    <ReactFlowProvider>
                        <Layout/>
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
    const {jwtToken, setJwtToken} = useStore();
    const {userId, fetchUserProfile, setUserProfile} = useStore()

    // TODO NOTE: login bypass: search 'login bypass' in all files (comment out)
    useEffect(() => {
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
            setJwtToken(jwtToken);
        }
    }, [setJwtToken]);

    useEffect(() => {
        // if (!userId) {
        //     setUserProfile(null)
        //     return
        // }
        // fetchUserProfile()
    }, [jwtToken]);

    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
}

export default App