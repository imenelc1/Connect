import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://connect-1-t976.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE}/api/users/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Routes publiques (pas de token)
const PUBLIC_ROUTES = ["register", "login"];

api.interceptors.request.use((config) => {
  // Nettoyage du chemin → retire / au début et / à la fin
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