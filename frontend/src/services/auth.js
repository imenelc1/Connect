import api, { setAuthToken } from "./api";

export async function registerStudent(payload) {
  // payload doit être mappé aux champs Django (voir plus bas)
  return api.post("register/", payload);
}

export async function loginUser(payload) {
  // backend renvoie token si tu utilises JWT custom ; sinon adapte
  return api.post("login/", payload);
}

export function saveToken(token) {
  localStorage.setItem("token", token);
  setAuthToken(token);
}

export function loadToken() {
  const t = localStorage.getItem("token");
  setAuthToken(t);
  return t;
}

export function logout() {
  localStorage.removeItem("token");
  setAuthToken(null);
}