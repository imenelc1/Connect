import axios from "axios";

// URL du backend
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

// Instance Axios configurée
const api = axios.create({
  baseURL: `${API_BASE}/api/users/`, // Toutes les routes commencent ici
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Pour ajouter un token JWT quand l'utilisateur se connecte
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export default api;
