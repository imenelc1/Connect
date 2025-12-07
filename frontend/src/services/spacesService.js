import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Ajoute le token automatiquement à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createSpace = async (data) => {
  const res = await api.post("spaces/create/", data);
  return res.data;
};

export const getSpaces = async () => {
  const res = await api.get("spaces/");
  return res.data;
};

export const updateSpace = async (id, data) => {
  const res = await api.put(`spaces/${id}/`, data);
  return res.data;
};

export const deleteSpace = async (id) => {
  const res = await api.delete(`spaces/${id}/`);
  return res.data;
};

export default { createSpace, getSpaces, updateSpace, deleteSpace };
// export default