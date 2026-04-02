import axios from "axios";

const trimSlash = (url) => url.replace(/\/+$/, "");

export const BASE_URL = trimSlash(
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000",
);
export const STORAGE_URL = trimSlash(
  import.meta.env.VITE_STORAGE_URL || `${BASE_URL}/storage`,
);

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default api;
