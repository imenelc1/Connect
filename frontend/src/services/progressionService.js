// progressionService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/", 
});

// Fonction pour récupérer la progression de tous les cours
// progressionService.js
export const getCoursesProgress = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token not found");

  const res = await api.get("courses/cours/progress/", { // <- ici
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// Fonction pour compléter une leçon
export const completeLesson = async (lessonId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token not found");

  const res = await api.post(
    `dashboard/complete-lecon/${lessonId}/`, // <- endpoint pour compléter la leçon
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
};

export default {
  getCoursesProgress,
  completeLesson,
};
