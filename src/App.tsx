import React, {useEffect} from "react";
import {createBrowserRouter, RouterProvider, useLocation, useNavigationType} from "react-router-dom";
import {ReactFlowProvider} from "@xyflow/react";
import RootLayout from "./RootLayout";
import Login from "./Login";
import Signup from "./Signup";
import Layout from "./Layout";
import {useStore} from "./store";
import CustomStudio from "./CustomStudio";
import SignupBasic from "./SignupBasic";
import LayoutBasic from "./LayoutBasic";

const RouteLogger = () => {
    const navigationType = useNavigationType();
    const location = useLocation();

    useEffect(() => {
        console.log('Route changed:', location.pathname);
        console.log('Navigation type:', navigationType);
    }, [location, navigationType]);

    return null; // This component doesn't render anything
};

const BASE_PATH = process.env.REACT_APP_BASE_PATH || "/";

const router = createBrowserRouter(
    [{
        path: "/",
        element: (
            <>
                <RouteLogger/>
                <RootLayout/>
                {/*<RootLayout>*/}
                {/*    <Outlet />*/}
                {/*</RootLayout>*/}
            </>
        ),
        children: [
            {
                path: "home",
                element:
                    <ReactFlowProvider>
                        <Layout/>
                    </ReactFlowProvider>
            },
            {
                path: "login",
                element: <Login/>
            },
            {
                path: "signup",
                element: <LayoutBasic/>,
                children: [
                    {
                        path: "google",
                        element: <Signup/>
                    },
                    {
                        path: "basic",
                        index: true, // This makes it the default child route
                        element: <SignupBasic/>
                    }
                ]
            },
            {
                path: "test",
                element: <CustomStudio/>
            },
        ]
    }],
    // Pass the dynamic basename here.
    { basename: BASE_PATH }
);

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