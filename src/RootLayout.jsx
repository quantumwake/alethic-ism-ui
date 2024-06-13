import { Outlet } from "react-router-dom";

const RootLayout = () => {
    return(
        <div className="h-screen w-full border-0">
            <Outlet/>
        </div>
    )
}

export default RootLayout