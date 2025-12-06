// services/studentService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

const token = localStorage.getItem("access_token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};

export const createStudent = async (data) => {
  const res = await api.post("spaces/add_student/", data, { headers });
  return res.data;
};

export const getSpacesStudents = async () => {
  const res = await api.get("spaces/students/", { headers });
  return res.data;
};

export default { createStudent, getSpacesStudents };
