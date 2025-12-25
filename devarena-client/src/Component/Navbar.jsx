import { Link } from "react-router-dom";
import { Menu, X, Code2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./authentication/AuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Code2 className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-white">DevArena</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition">
              Home
            </Link>

            <Link
              to="/create-question"
              className="text-gray-300 hover:text-white transition"
            >
              Create Question
            </Link>

            <Link
              to="/show-all-questions"
              className="text-gray-300 hover:text-white transition"
            >
              All Questions
            </Link>

            <Link
              to="/create-contest"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
            >
              Create Contest
            </Link>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4 ml-4">
                <span className="text-gray-300 text-sm">
                  Hello,{" "}
                  <span className="text-white font-semibold">
                    {user.displayName}
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/create-question"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Create Question
            </Link>

            <Link
              to="/show-all-questions"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              All Questions
            </Link>

            <Link
              to="/create-contest"
              className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Create Contest
            </Link>

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-gray-300">
                  Hello,{" "}
                  <span className="text-white font-semibold">
                    {user.username || user.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
