import axios from "axios";
const url = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL: `${url}/api`,
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
