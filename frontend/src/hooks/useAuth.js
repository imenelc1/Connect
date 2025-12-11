import { jwtDecode } from "jwt-decode";

export function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = jwtDecode(token);
    return payload.user_id; // ou payload.user_id selon ton JWT
  } catch (e) {
    return null;
  }
}

export function getCurrentUserRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = jwtDecode(token);
    return payload.role;
  } catch (e) {
    return null;
  }
}