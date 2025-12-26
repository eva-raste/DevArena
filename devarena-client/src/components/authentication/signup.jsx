import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { signupApi } from "../../apis/auth-api";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await signupApi({
        email,
        displayName,
        password,
      });

      setSuccess("Account created successfully. You can now log in.");
      setEmail("");
      setDisplayName("");
      setPassword("");
      navigate("/login");

    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", system-ui, sans-serif;
        }

        body {
          margin: 0;
        }

        .container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
        }

        .card {
          background: #ffffff;
          width: 380px;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        }

        h2 {
          text-align: center;
          margin: 0;
          color: #1e293b;
        }

        .subtitle {
          text-align: center;
          font-size: 14px;
          color: #64748b;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
        }

        label {
          font-size: 14px;
          margin-bottom: 6px;
          color: #334155;
        }

        input {
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
        }

        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
        }

        button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: #3b82f6;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        button:hover {
          background: #2563eb;
        }

        button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .error {
          margin-top: 12px;
          color: #dc2626;
          font-size: 14px;
          text-align: center;
        }

        .success {
          margin-top: 12px;
          color: #16a34a;
          font-size: 14px;
          text-align: center;
        }
      `}</style>

      <div className="container">
        <div className="card">
          <h2>Create Account</h2>
          <p className="subtitle">Join DevArena and start coding</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="hi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Johna Doe samory"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
            <p className="mt-4 text-center text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:underline">
                Login
              </Link>
            </p>

          </form>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      </div>
    </>
  );
};

export default Signup;
