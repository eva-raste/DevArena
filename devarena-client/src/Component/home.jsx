import { Link, Navigate } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <h2 className="text-3xl font-semibold mb-6">Hi from Home Page</h2>
      <Link
        to="/create-contest"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-medium transition"
      >
        Create Contest
      </Link>
    </div>
  );
}
export default Home;
