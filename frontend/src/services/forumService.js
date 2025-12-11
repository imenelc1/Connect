// services/forumService.js
export const createForum = async (token, forumData) => {
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:8000/api" 
    : "/api";

  const response = await fetch(`${API_URL}/forums/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(forumData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur ${response.status}`);
  }

  return await response.json();
};
