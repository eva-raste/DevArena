import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/profile/me");
        setUser(res.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const token = res.data.accessToken;

    localStorage.setItem("token", token);
    setToken(token);
    setUser(res.data.user);
    console.log("token set");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
