import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [authHeader, setAuthHeader] = useState(
    () => localStorage.getItem("auth")
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authHeader) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:8080/api/profile/me",
          {
            headers: {
              Authorization: authHeader,
            },
          }
        );
        setUser(res.data);
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [authHeader]);

  const login = (email, password) => {
    const header = "Basic " + btoa(`${email}:${password}`);
    localStorage.setItem("auth", header);
    setAuthHeader(header);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuthHeader(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        authHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
