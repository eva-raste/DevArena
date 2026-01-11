"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X, Code2, Moon, Sun } from "lucide-react"
import { useAuth } from "./authentication/AuthContext"
import { useThemeStore } from "@/store/useThemeStore"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const isDark = useThemeStore((state) => state.isDark)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  // ensure html sync on refresh
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])


return (
  <nav className="bg-background border-b border-border fixed top-0 w-full h-16 z-50 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="p-1.5 bg-primary rounded-lg">
            <Code2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            DevArena
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-muted-foreground hover:text-primary font-medium">
            Home
          </Link>
          <Link to="/create-question" className="text-muted-foreground hover:text-primary font-medium">
            Create Question
          </Link>
          <Link to="/show-all-questions" className="text-muted-foreground hover:text-primary font-medium">
            All Questions
          </Link>

          <Button asChild>
            <Link to="/create-contest">Create Contest</Link>
          </Button>

          <Button asChild>
            <Link to="/my-contests">My Contests</Link>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 pl-4 border-l border-border">
              <span className="text-sm text-muted-foreground">
                Hello,{" "}
                <span className="font-semibold text-primary">
                  {user.displayName}
                </span>
              </span>

              <Button variant="destructive" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-4 border-l border-border">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>

    {/* Mobile Menu */}
    {isOpen && (
      <div className="md:hidden bg-background border-t border-border">
        <div className="px-4 py-4 space-y-2">
          <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-muted-foreground hover:text-primary">
            Home
          </Link>
          <Link to="/create-question" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-muted-foreground hover:text-primary">
            Create Question
          </Link>
          <Link to="/show-all-questions" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-muted-foreground hover:text-primary">
            All Questions
          </Link>

          <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
            <Link to="/create-contest">Create Contest</Link>
          </Button>

          {isAuthenticated ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="w-full">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    )}
  </nav>
)


}

export default Navbar
