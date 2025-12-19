import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

const feedbackService = {
  createFeedback: async (feedbackData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post('/feedback/', feedbackData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getFeedbacks: async (objectId) => {
    try {
      const response = await api.get(`/feedback/?object_id=${objectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getNotifications: async () => {
    try {
      const response = await api.get('/notifications/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  markNotificationRead: async (notifId) => {
    try {
      const response = await api.post(`/notifications/${notifId}/read/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default feedbackService;
