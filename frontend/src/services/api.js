import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api/users/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

/**
 * 🛡️ ROUTES PUBLIQUES (AUCUN TOKEN)
 * Ce sont les routes d'inscription et de connexion.
 */
const PUBLIC_ROUTES = ["register", "login"];

/**
 * 🎯 Interceptor PRO :
 * N'ajoute un token que si :
 *   - il existe,
 *   - la route n'est pas publique.
 */
api.interceptors.request.use((config) => {
  const isPublic = PUBLIC_ROUTES.some((route) =>
    config.url.includes(route)
  );

  if (!isPublic) {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    // 🔥 On supprime toute trace de token si route publique
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
