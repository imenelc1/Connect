import axios from "axios";

const api = axios.create({
  baseURL: "https://connect-1-t976.onrender.com/api/spaces/",
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

// Supprimer un étudiant d’un espace
export const removeStudent = async (studentId, spaceId) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  // Ici on suppose que ton API attend DELETE /spaces/remove_student/:studentId/?space_id=xxx
  const res = await api.delete(`remove_student/${studentId}/`, {
    headers,
    params: { space_id: spaceId },
  });
  return res.data;
};

export default { createStudent, getSpacesStudents };

