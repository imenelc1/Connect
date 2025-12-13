import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token not found");
  return { Authorization: `Bearer ${token}` };
};

// Récupérer la progression de tous les cours
export const getCoursesProgress = async () => {
  const res = await api.get("courses/cours/progress/", { headers: getAuthHeader() });
  return res.data;
};

// Compléter une leçon
export const completeLesson = async (lessonId) => {
  const res = await api.post(
    `dashboard/complete-lecon/${lessonId}/`,
    {},
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Nombre de cours actifs
export const getActiveCoursesCount = async () => {
  const res = await api.get("dashboard/active/count/", { headers: getAuthHeader() });
  return res.data.active_courses;
};

// Ajouter une session
export const addSession = async (duration) => {
  if (duration <= 0) throw new Error("Invalid duration");
  const res = await api.post(
    "dashboard/add-session/",
    { duration },
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Temps moyen passé
export const getAverageTime = async () => {
  const res = await api.get("dashboard/average-time/", { headers: getAuthHeader() });
  return res.data.average_duration; 
};

export const getGlobalProgress = async () => {
  const res = await api.get("dashboard/global-progress/", { headers: getAuthHeader() });

  console.log("API response:", res.data);
  return res.data.global_progress; 
};


export default {
  getCoursesProgress,
  completeLesson,
  getActiveCoursesCount,
  addSession,
  getAverageTime,
  getGlobalProgress
};
