// Home.jsx - Your updated home page
import { Link } from "react-router-dom";
import { FileQuestion, Trophy, Code2 } from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      
      {/* Hero Section */}
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Build. Compete.{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">
              Excel.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Create coding challenges, host contests, and sharpen your programming skills in a competitive environment.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <FileQuestion className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Create Questions
              </h3>
              <p className="text-gray-400">
                Design challenging problems to test programming skills
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all duration-300 hover:transform hover:scale-105">
              <Trophy className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Host Contests
              </h3>
              <p className="text-gray-400">
                Organize competitive coding events and track performance
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-green-500 transition-all duration-300 hover:transform hover:scale-105">
              <Code2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Browse Questions
              </h3>
              <p className="text-gray-400">
                Explore a vast collection of coding challenges
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/create-question"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold text-white transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
            >
              Create Question
            </Link>
            <Link
              to="/show-all-questions"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl text-lg font-semibold text-white transition-all duration-200 hover:transform hover:scale-105"
            >
              Browse Questions
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">500+</div>
              <div className="text-gray-400">Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-500 mb-2">100+</div>
              <div className="text-gray-400">Contests</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500 mb-2">1K+</div>
              <div className="text-gray-400">Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;