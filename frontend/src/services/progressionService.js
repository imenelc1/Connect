import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token not found");
  return { Authorization: `Bearer ${token}` };
};
const getAuthHeaderWithToken = (token) => {
  if (!token) throw new Error("Admin token not provided");
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

const API_URL = "http://127.0.0.1:8000/api/dashboard/";

const getDailyTime = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_URL + "daily-time/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getSuccessRate = async () => {
  const res = await api.get("dashboard/success-rate/", { headers: getAuthHeader() });
  return res.data.success_rate;
};

export const getSubmittedExercises = async (studentId) => {
  if (!studentId) throw new Error("User id not provided");

  const res = await api.get(`dashboard/student-total-tentatives/${studentId}/`, { headers: getAuthHeader() });
  return res.data;
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


// Récupérer l’historique global des étudiants pour le prof (7 derniers jours)
export const getGlobalProgressStudents= async () => {
    const res = await api.get("dashboard/global-progress/students/",{ headers: getAuthHeader() });
    return res.data;
  };


export const getCurrentProgressStudents = async () => {
  const res = await api.get("dashboard/current-progress/students/", { headers: getAuthHeader() });
  return res.data;
};


// Récupérer toutes les tentatives de l'utilisateur
export const getTentatives = async () => {
  const res = await api.get("dashboard/tentatives/", { headers: getAuthHeader() });
  return res.data; // renvoie un tableau de tentatives
};

// Créer ou sauvegarder une tentative (brouillon ou soumise)
export const createTentative = async ({ exercice_id, reponse, etat = "brouillon", score = null, feedback = null, temps_passe = 0, output = "" }) => {
  const payload = { exercice_id, reponse, etat, score, feedback, temps_passe, output };
  const res = await api.post("dashboard/tentatives/create/", payload, { headers: getAuthHeader() });
  return res.data;
};

// Sauvegarder un brouillon
export const saveDraftTentative = async ({ exercice_id, reponse, output = "" }) => {
  return createTentative({
    exercice_id,
    reponse,
    output,
    etat: "brouillon",
  });
};



// Soumettre une tentative
export const submitTentative = async ({ exercice_id, reponse, output = "", temps_passe = null }) => {
  return createTentative({
    exercice_id,
    reponse,
    output,
    etat: "soumis",
    temps_passe,
  });
};

export const getTentativeById = async (tentativeId) => {
  const res = await api.get(
    `dashboard/tentatives/id/${tentativeId}/`,
    { headers: getAuthHeader() }
  );
  return res.data;
};

// 🔹 Récupérer la dernière tentative de l'utilisateur connecté
export const getMyLastTentative = async (studentId, exerciceId) => {
  if (!studentId || !exerciceId) {
    console.warn("studentId ou exerciceId manquant");
    return null;
  }

  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/dashboard/tentatives/my-last/${exerciceId}/`,
      { params: { studentId } }
    );
    return response.data;
  } catch (err) {
    console.error("Erreur récupération tentative", err);
    return null; // fallback sur null si erreur serveur
  }
};


// Récupérer la progression actuelle des étudiants (admin)
export const getCurrentProgressStudentsAdmin = async (admin_token) => {
  const res = await api.get(
    "dashboard/current-progress/students/",
    { headers: getAuthHeaderWithToken(admin_token) }
  );
  return res.data;
};

// Récupérer l’historique global des étudiants (admin)
export const getGlobalProgressStudentsAdmin = async (admin_token) => {
  const res = await api.get(
    "dashboard/global-progress/students/",
    { headers: getAuthHeaderWithToken(admin_token) }
  );
  return res.data;
};


 export default {
  getCoursesProgress,
  completeLesson,
  completeLessonsBulk,
  getActiveCoursesCount,
  addSession,
  getDailyTime,
  getSuccessRate,
  getGlobalProgress,
  updateLastLesson,
  resetCourseProgress,
  getGlobalProgressHistory,
  getTentatives,
  createTentative,
  saveDraftTentative,
  submitTentative,
  getTentativeById,
  // Prof
  getActiveCoursesCountProf,
  addSessionProf,
  getAverageTimeProf,
  getGlobalProgressStudents,
  getCurrentProgressStudents,
  getMyLastTentative,
  getGlobalProgressStudentsAdmin,
  getCurrentProgressStudentsAdmin, // <-- ajouter ici
};

