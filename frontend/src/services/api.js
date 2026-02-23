import axios from "axios";

const API_BASE = "https://connect-1-t976.onrender.com";
const api = axios.create({
  baseURL: `${API_BASE}/api/`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // On récupère le token
  const token = localStorage.getItem("token");

  // Détection simplifiée des routes publiques (Login / Register)
  // On vérifie si l'URL contient ces mots clés, peu importe les slashes
  const isPublic = config.url.includes("login") || config.url.includes("register");

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // On nettoie l'en-tête pour les routes publiques
    delete config.headers.Authorization;
  }

  return config;
}, (error) => Promise.reject(error));

export default api;