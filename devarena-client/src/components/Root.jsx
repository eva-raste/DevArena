import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

const Root = () => {
  return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="pt-16">
          <Outlet />
        </main>
      </div>

    
  )
}

export default Root
