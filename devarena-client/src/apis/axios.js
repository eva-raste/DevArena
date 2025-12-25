import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response?.status;
//     const url = error.config?.url || "";

//     // logout ONLY if auth endpoint fails
//     if (status === 401 && url.startsWith("/auth")) {
//       localStorage.removeItem("auth");
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   }
// );



export default api;