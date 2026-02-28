import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

const Root = () => {
  return (
      <div style={{ minHeight: '100vh' }}>  {/* NO background */}
        <Navbar />
        <Outlet />
      </div>

    
  )
}

export default Root
