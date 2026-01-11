/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";
import styles from "./css/login.module.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

 const { login } = useAuth();

 const handleSubmit = async (e) => {
   e.preventDefault();
   setLoading(true);
   setError("");

   try {
     await login(email, password);
     navigate("/");
   } catch (err) {
     setError("Invalid email or password");
   } finally {
     setLoading(false);
   }
 };


return (
  <div className={styles.container}>
    <div className={styles.card}>
      <h2 className={styles.title}>Welcome Back</h2>
      <p className={styles.subtitle}>
        Log in to continue to DevArena
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            placeholder="hi@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <p className="mt-4 text-center text-gray-400">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-blue-400 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  </div>
);

};

export default Login;
