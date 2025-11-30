import { jwtDecode } from "jwt-decode";

export function getCurrentUserId() {
    try {
        const data = localStorage.getItem("user");
        if (!data) return null;

        const { token } = JSON.parse(data);
        if (!token) return null;

        const payload = jwtDecode(token);
        return payload.user_id;
    } catch (e) {
        return null;
    }
}

export function getCurrentUserRole() {
    try {
        const data = localStorage.getItem("user");
        if (!data) return null;

        const { token } = JSON.parse(data);
        if (!token) return null;

        const payload = jwtDecode(token);
        return payload.role;
    } catch (e) {
        return null;
    }
}