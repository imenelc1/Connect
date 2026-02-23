// src/contexts/NotificationContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé dans NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isMounted = useRef(true);
  const isFetching = useRef(false);
  
  // Récupère le token depuis localStorage
  const getToken = () => {
    return localStorage.getItem('access') || localStorage.getItem('token');
  };
  
  const API_URL = window.location.hostname === 'localhost' 
    ? '${import.meta.env.VITE_API_BASE}/api' 
    : '/api';

  // Fonction pour fetch les notifications
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token || isFetching.current) {
      return;
    }

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🌐 Fetch notifications globales...');
      const res = await fetch(`${API_URL}/notifications/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('✅ Notifications reçues:', data.length);
      
      if (isMounted.current) {
        setNotifications(data);
        // Calcule le nombre de notifications non lues
        const unread = data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('❌ Erreur notifications:', err);
      if (isMounted.current) {
        setError(err.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [API_URL]);

  // Fonction pour fetch uniquement le compteur non lu
  const fetchUnreadCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/unread-count/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (isMounted.current) {
          setUnreadCount(data.unread_count || 0);
        }
      }
    } catch (err) {
      console.error('❌ Erreur comptage non lus:', err);
    }
  }, [API_URL]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notifId) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/${notifId}/mark-read/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        // Met à jour l'état local immédiatement
        setNotifications(prev =>
          prev.map(n =>
            n.id_notif === notifId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log(`✅ Notification ${notifId} marquée comme lue`);
      }
    } catch (err) {
      console.error('❌ Erreur marquage lu:', err);
    }
  }, [API_URL]);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id_notif);
    if (unreadIds.length === 0) return;

    // Met à jour l'UI immédiatement
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);

    // Envoie les requêtes au backend
    const token = getToken();
    if (!token) return;

    unreadIds.forEach(async (id) => {
      try {
        await fetch(`${API_URL}/notifications/${id}/mark-read/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error(`❌ Erreur marquage ${id}:`, error);
      }
    });
  }, [notifications, API_URL]);

  // Écouteur d'événements personnalisé pour les nouvelles notifications
  const setupEventListeners = useCallback(() => {
    // Écouter l'événement personnalisé 'new-notification'
    const handleNewNotification = () => {
      console.log('📢 Événement new-notification reçu, rafraîchissement...');
      fetchUnreadCount();
    };

    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, [fetchUnreadCount]);

  // Chargement initial
  useEffect(() => {
    isMounted.current = true;
    
    // Charge immédiatement si utilisateur connecté
    if (getToken()) {
      fetchNotifications();
      setupEventListeners();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchNotifications, setupEventListeners]);


// Supprimer une notification
const deleteNotification = useCallback(async (notifId) => {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/notifications/${notifId}/`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` }
});


    if (res.ok) {
      setNotifications(prev => prev.filter(n => n.id_notif !== notifId));
      console.log(`❌ Notification ${notifId} supprimée`);
    }
  } catch (err) {
    console.error('Erreur suppression notification:', err);
  }
}, [API_URL]);


// Supprimer toutes les notifications
const deleteAllNotifications = useCallback(async () => {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/notifications/delete-all/`, { // <-- ici
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setNotifications([]);
      setUnreadCount(0);
      console.log('Toutes les notifications ont été supprimées');
    }
  } catch (err) {
    console.error('Erreur suppression toutes notifications:', err);
  }
}, [API_URL]);



  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    if (!getToken()) return;

    const interval = setInterval(() => {
      if (isMounted.current && !isFetching.current) {
        fetchUnreadCount(); // Juste le compteur, plus léger
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        unreadCount,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};