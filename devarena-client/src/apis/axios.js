import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let setLoadingGlobal = null;

export const attachLoader = (setter) => {
  setLoadingGlobal = setter;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    setLoadingGlobal?.(true);
    return config;
  },
  (error) => {
    setLoadingGlobal?.(false);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    setLoadingGlobal?.(false);
    return response;
  },
  (error) => {
    setLoadingGlobal?.(false);
    return Promise.reject(error);
  }
);

export default api;
