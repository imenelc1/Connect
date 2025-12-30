// api.js
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api/`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const PUBLIC_ROUTES = ["users/register", "users/login"];
  const path = config.url.replace(/^\//, "").replace(/\/$/, "");
  if (!PUBLIC_ROUTES.includes(path)) {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default api;