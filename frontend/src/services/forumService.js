// src/services/forumService.js
const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost:8000/api" 
  : "/api";

export const createForum = async (token, forumData) => {
  console.log("Creating forum with data:", forumData);
  
  const response = await fetch(`${API_URL}/forums/create/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(forumData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Create forum error response:", errorText);
    
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
};

export const updateForum = async (token, forumId, forumData) => {
  console.log("Updating forum:", forumId, forumData);
  
  const response = await fetch(`${API_URL}/admin/forums/${forumId}/`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(forumData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
};

export const deleteForum = async (token, forumId) => {
  console.log("Deleting forum:", forumId);
  
  const response = await fetch(`${API_URL}/admin/forums/${forumId}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  return true;
};

export const fetchForums = async (token) => {
  const response = await fetch(`${API_URL}/forums/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
};