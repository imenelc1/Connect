import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/spaces/",
});

// Ajouter un étudiant à un espace
export const createStudent = async (data) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await api.post("add_student/", data, { headers });
  return res.data;
};

// Récupérer tous les étudiants par espace
export const getSpacesStudents = async () => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await api.get("students/", { headers });
  return res.data;
};

export default { createStudent, getSpacesStudents };
