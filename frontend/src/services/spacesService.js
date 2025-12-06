import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Token JWT
const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};

export const createSpace = async (data) => {
  const res = await api.post("spaces/create/", data, { headers });
  return res.data;
};

export const getSpaces = async () => {
  const res = await api.get("spaces/", { headers });
  return res.data;
};

export const updateSpace = async (id, data) => {
  const res = await api.put(`spaces/${id}/`, data, { headers });
  return res.data;
};

export const deleteSpace = async (id) => {
  const res = await api.delete(`spaces/${id}/`, { headers });
  return res.data;
};

export default { createSpace, getSpaces, updateSpace, deleteSpace };
