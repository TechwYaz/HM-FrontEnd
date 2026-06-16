import axios from "axios";

const trimSlash = (url) => url.replace(/\/+$/, "");

// 1. Point directly to your Supabase project URL
export const BASE_URL = trimSlash(
  import.meta.env.VITE_SUPABASE_URL || "https://supabase.co"
);

// 2. Point to Supabase Storage if you are using their bucket system
export const STORAGE_URL = trimSlash(
  import.meta.env.VITE_STORAGE_URL || `${BASE_URL}/storage/v1/object/public`
);

const api = axios.create({
  // Supabase REST endpoints always start with /rest/v1
  baseURL: `${BASE_URL}/rest/v1`, 
  headers: {
    Accept: "application/json",
    // Supabase requires your public key sent as an 'apikey' header
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },
});

api.interceptors.request.use((config) => {
  // If a user is logged in via Supabase, pass their JWT token
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Default fallback authorization header required by Supabase
    config.headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
  }

  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default api;

