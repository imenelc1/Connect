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

// Compléter plusieurs leçons en bulk avec durée
export const completeLessonsBulk = async (lessonIds, options = {}) => {
  if (!Array.isArray(lessonIds) || lessonIds.length === 0) return { course_progress: 0 };

  const payload = { lesson_ids: lessonIds };
  if (options.duration && options.duration > 0) {
    payload.duration = options.duration;  // ajouter le temps passé
  }

  const res = await api.post(
    "dashboard/complete-lessons-bulk/",
    payload,
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

// Marquer la dernière leçon vue
export const updateLastLesson = async (lessonId) => {
  const res = await api.post(
    `dashboard/update-last-lesson/${lessonId}/`,
    {},
    { headers: getAuthHeader() }
  );
  return res.data;
};

export const resetCourseProgress = async (courseId) => {
  const res = await api.post(
    `dashboard/reset-progress/${courseId}/`,
    {},
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Historique progression globale pour le graphe
export const getGlobalProgressHistory = async () => {
  const res = await api.get("dashboard/history/", { headers: getAuthHeader() });
  return res.data; // [{ date: "2025-12-16 14:30", progression: 45 }, ...]
};
// === Professeur ===
export const getActiveCoursesCountProf = async () => {
  const res = await api.get("dashboard/prof/active/count/", { headers: getAuthHeader() });
  return res.data.active_courses; // nombre de cours qu’il a créés
};

export const addSessionProf = async (duration) => {
  if (duration <= 0) throw new Error("Invalid duration");
  const res = await api.post(
    "dashboard/prof/add-session/",
    { duration },
    { headers: getAuthHeader() }
  );
  return res.data;
};

export const getAverageTimeProf = async () => {
  const res = await api.get("dashboard/prof/average-time/", { headers: getAuthHeader() });
  return res.data.average_duration; 
};

export const getGlobalProgressProf = async () => {
  const res = await api.get("dashboard/global-progress/students/", { headers: getAuthHeader() });
  return res.data; 
};


export default {
  getCoursesProgress,
  completeLesson,
  completeLessonsBulk,
  getActiveCoursesCount,
  addSession,
  getAverageTime,
  getGlobalProgress,
  updateLastLesson,
  resetCourseProgress,
  getGlobalProgressHistory,
  // Prof
  getActiveCoursesCountProf,
  addSessionProf,
  getAverageTimeProf,
  getGlobalProgressProf,

};