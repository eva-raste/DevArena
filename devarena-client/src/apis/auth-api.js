import api from "./axios";

export const loginApi = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  } catch (err) {
    throw new Error("Invalid credentials");
  }
};


export const signupApi = async (userData) => {
  try {
    const res = await api.post("/auth/register", userData);
    return res.data;
  } catch (err) {
    console.error("signupApi error:", err);
    throw new Error(
      err.response?.data?.message || "Signup failed"
    );
  }
};


export const fetchProfileApi = async () => {
  try {
    const res = await api.get("/profile/me");
    console.log(res.data);
    return res.data;
  } catch (err) {
    throw new Error("Failed to fetch user profile");
  }
};