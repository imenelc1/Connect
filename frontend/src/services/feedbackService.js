import axios from "axios";

const api = axios.create({
  baseURL: "${import.meta.env.VITE_API_URL}/api/",
});

const feedbackService = {
  // Création d'un feedback (requiert authentification)
  createFeedback: async (feedbackData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/feedback/", feedbackData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Récupérer les feedbacks d'un objet (requiert authentification)
  getFeedbacks: async (objectId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/feedback/?object_id=${objectId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Récupérer les notifications (requiert authentification)
  getNotifications: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/notifications/", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Marquer une notification comme lue (requiert authentification)
  markNotificationRead: async (notifId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(`/notifications/${notifId}/read/`, null, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Récupérer le nombre de notifications non lues (requiert authentification)
  getUnreadCount: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/notifications/unread-count/", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default feedbackService;
