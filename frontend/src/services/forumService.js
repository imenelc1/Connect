// src/services/forumService.js
const API_URL = (() => {
  // Vérifier si on est en développement
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';
  
  // Vérifier si une URL API est définie globalement
  const customApiUrl = window.REACT_APP_API_URL || window.API_URL;
  
  if (customApiUrl) {
    return customApiUrl;
  }
  
  return isLocalhost ? "http://localhost:8000/api" : "/api";
})();

// ============================================
// FONCTIONS POUR LES FORUMS
// ============================================

export const fetchForums = async (token) => {
  console.log("📥 Fetching forums...");
  
  const response = await fetch(`${API_URL}/forums/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log("📡 Fetch response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Fetch forums error:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("✅ Forums fetched successfully, count:", result.length);
  return result;
};

export const createForum = async (token, forumData) => {
  console.log("🔄 Creating forum with data:", forumData);
  
  const response = await fetch(`${API_URL}/forums/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(forumData)
  });

  console.log("📡 Response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Create forum error response:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      console.error("❌ Error data:", errorData);
      
      // Gestion des erreurs de validation Django
      if (errorData.non_field_errors) {
        errorMessage = errorData.non_field_errors.join(', ');
      } else if (typeof errorData === 'object') {
        // Rassembler toutes les erreurs de champ
        const fieldErrors = [];
        for (const [field, errors] of Object.entries(errorData)) {
          if (Array.isArray(errors)) {
            fieldErrors.push(`${field}: ${errors.join(', ')}`);
          }
        }
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('; ');
        }
      } else {
        errorMessage = errorData.error || errorData.detail || errorData.message || JSON.stringify(errorData);
      }
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("✅ Forum created successfully:", result);
  return result;
};

export const updateForum = async (token, forumId, forumData) => {
  console.log("🔄 Updating forum:", forumId, forumData);
  
  // URL admin spécifique
  const response = await fetch(`${API_URL}/admin/forums/${forumId}/`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(forumData)
  });

  console.log("📡 Update response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Update forum error:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("✅ Forum updated successfully:", result);
  return result;
};

export const deleteForum = async (token, forumId) => {
  console.log("🗑️ Deleting forum:", forumId);
  
  // URL normale pour la suppression (pas admin spécifique)
  const response = await fetch(`${API_URL}/forums/${forumId}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log("📡 Delete response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Delete forum error:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  console.log("✅ Forum deleted successfully");
  
  // Si la réponse est vide (status 204 No Content), retournez true
  if (response.status === 204) {
    return true;
  }
  
  // Sinon, essayez de parser la réponse JSON
  try {
    const result = await response.json();
    return result;
  } catch (e) {
    return true;
  }
};

// ============================================
// FONCTIONS POUR LES MESSAGES
// ============================================

export const fetchForumMessages = async (token, forumId) => {
  console.log("📥 Fetching messages for forum:", forumId);
  
  const response = await fetch(`${API_URL}/forums/${forumId}/messages/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log("📡 Fetch messages response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Fetch messages error:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("✅ Messages fetched successfully:", result.length);
  return result;
};

export const createMessage = async (token, forumId, messageData) => {
  console.log("📝 Creating message for forum:", forumId);
  
  const response = await fetch(`${API_URL}/forums/${forumId}/messages/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      ...messageData,
      forum_id: forumId
    })
  });

  console.log("📡 Create message response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Create message error:", errorText);
    
    let errorMessage = `Erreur ${response.status}: `;
    
    try {
      const errorData = JSON.parse(errorText);
      
      // Gestion des erreurs de validation Django
      if (errorData.non_field_errors) {
        errorMessage += errorData.non_field_errors.join(', ');
      } else if (typeof errorData === 'object') {
        // Rassembler toutes les erreurs de champ
        const fieldErrors = [];
        for (const [field, errors] of Object.entries(errorData)) {
          if (Array.isArray(errors)) {
            fieldErrors.push(`${field}: ${errors.join(', ')}`);
          }
        }
        if (fieldErrors.length > 0) {
          errorMessage += fieldErrors.join('; ');
        } else {
          errorMessage += JSON.stringify(errorData);
        }
      } else {
        errorMessage += errorData.error || errorData.detail || errorData.message || JSON.stringify(errorData);
      }
    } catch (e) {
      errorMessage += errorText;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("✅ Message created successfully:", result);
  return result;
};

export const deleteMessage = async (token, messageId) => {
  console.log("🗑️ Deleting message:", messageId);
  
  const response = await fetch(`${API_URL}/messages/${messageId}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log("📡 Delete message response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Delete message error:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  console.log("✅ Message deleted successfully");
  return true;
};

// ============================================
// FONCTIONS POUR LES COMMENTAIRES
// ============================================

export const createComment = async (token, messageId, commentData) => {
  console.log("💬 Creating comment for message:", messageId);
  
  const response = await fetch(`${API_URL}/messages/${messageId}/comments/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(commentData)
  });

  console.log("📡 Create comment response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Create comment error:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("✅ Comment created successfully:", result);
  return result;
};

export const deleteComment = async (token, commentId) => {
  console.log("🗑️ Deleting comment:", commentId);
  
  const response = await fetch(`${API_URL}/comments/${commentId}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log("📡 Delete comment response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Delete comment error:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  console.log("✅ Comment deleted successfully");
  return true;
};

// ============================================
// FONCTIONS POUR LES LIKES
// ============================================

export const likeForum = async (token, forumId) => {
  console.log("❤️ Liking forum:", forumId);
  
  const response = await fetch(`${API_URL}/forums/${forumId}/like/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log("📡 Like forum response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Like forum error:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("✅ Forum liked successfully:", result);
  return result;
};

export const likeMessage = async (token, messageId) => {
  console.log("❤️ Liking message:", messageId);
  
  const response = await fetch(`${API_URL}/messages/${messageId}/like/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log("📡 Like message response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Like message error:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("✅ Message liked successfully:", result);
  return result;
};

// ============================================
// FONCTION DE TEST DE CONNEXION
// ============================================

export const testAPIConnection = async (token) => {
  console.log("🔌 Testing API connection...");
  
  try {
    const response = await fetch(`${API_URL}/forums/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("🔌 Test API - Status:", response.status);
    console.log("🔌 Test API - OK?:", response.ok);
    
    return {
      connected: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (err) {
    console.error("❌ Test API - Erreur:", err);
    return {
      connected: false,
      error: err.message
    };
  }
};