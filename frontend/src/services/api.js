import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api/users/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// ★ Fonction nécessaire pour auth.js
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Routes publiques
const PUBLIC_ROUTES = ["register", "login"];

api.interceptors.request.use((config) => {
  const path = config.url.replace(/^\//, "").replace(/\/$/, "");

  const isPublic = PUBLIC_ROUTES.includes(path);

  if (!isPublic) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
