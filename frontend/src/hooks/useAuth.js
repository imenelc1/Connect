import { jwtDecode } from "jwt-decode"; // Librairie pour décoder le token JWT

// 🔹 Récupère l'ID de l'utilisateur courant à partir du JWT stocké
export function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token"); // Récupération du token depuis le localStorage
    if (!token) return null; // Si aucun token, retourne null

    const payload = jwtDecode(token); // Décodage du JWT pour récupérer les données
    return payload.user_id; // Retourne l'ID utilisateur du token
  } catch (e) {
    return null; // En cas d'erreur (token invalide), retourne null
  }
}

// 🔹 Récupère le rôle de l'utilisateur courant à partir du JWT
export function getCurrentUserRole() {
  try {
    const token = localStorage.getItem("token"); // Récupération du token depuis le localStorage
    if (!token) return null; // Si aucun token, retourne null

    const payload = jwtDecode(token); // Décodage du JWT
    return payload.role; // Retourne le rôle de l'utilisateur
  } catch (e) {
    return null; // En cas d'erreur (token invalide), retourne null
  }
}
