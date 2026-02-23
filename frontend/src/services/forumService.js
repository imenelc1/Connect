// src/services/forumService.js

// ✅ Configuration simplifiée et robuste
const BASE_API_URL = import.meta.env.VITE_API_URL || "https://connect-1-t976.onrender.com";
const API_URL = `${BASE_API_URL}/api`;

// ============================================
// FONCTIONS POUR LES FORUMS
// ============================================

export const fetchForums = async (token) => {
  console.log("📥 Fetching forums from:", API_URL);
  
  const response = await fetch(`${API_URL}/forums/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur ${response.status}: ${errorText}`);
  }

  return await response.json();
};

export const createForum = async (token, forumData) => {
  const response = await fetch(`${API_URL}/forums/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(forumData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData));
  }

  return await response.json();
};

export const updateForum = async (token, forumId, forumData) => {
  const response = await fetch(`${API_URL}/admin/forums/${forumId}/`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(forumData)
  });

  if (!response.ok) throw new Error("Erreur mise à jour");
  return await response.json();
};

export const deleteForum = async (token, forumId) => {
  const response = await fetch(`${API_URL}/forums/${forumId}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error("Erreur suppression");
  return true;
};

// ============================================
// FONCTIONS POUR LES MESSAGES
// ============================================

export const fetchForumMessages = async (token, forumId) => {
  const response = await fetch(`${API_URL}/forums/${forumId}/messages/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error("Erreur messages");
  return await response.json();
};

export const createMessage = async (token, forumId, messageData) => {
  const response = await fetch(`${API_URL}/forums/${forumId}/messages/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ ...messageData, forum_id: forumId })
  });
  if (!response.ok) throw new Error("Erreur création message");
  return await response.json();
};

export const deleteMessage = async (token, messageId) => {
  const response = await fetch(`${API_URL}/messages/${messageId}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.ok;
};

// ============================================
// FONCTIONS POUR LES COMMENTAIRES ET LIKES
// ============================================

export const createComment = async (token, messageId, commentData) => {
  const response = await fetch(`${API_URL}/messages/${messageId}/comments/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commentData)
  });
  return await response.json();
};

export const deleteComment = async (token, commentId) => {
  const response = await fetch(`${API_URL}/comments/${commentId}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.ok;
};

export const likeForum = async (token, forumId) => {
  const response = await fetch(`${API_URL}/forums/${forumId}/like/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

export const likeMessage = async (token, messageId) => {
  const response = await fetch(`${API_URL}/messages/${messageId}/like/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

export const testAPIConnection = async (token) => {
  try {
    const response = await fetch(`${API_URL}/forums/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return { connected: response.ok, status: response.status };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};