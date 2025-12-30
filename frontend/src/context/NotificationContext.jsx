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
  const getToken = useCallback(() => {
    const token = localStorage.getItem("admin_token") || 
                  localStorage.getItem("access") || 
                  localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ Pas de token JWT trouvé dans le localStorage !");
      return null;
    }
    return token;
  }, []);

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api' 
    : '/api';

  // Fonction pour fetch les notifications complètes
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
  }, [API_URL, getToken]);

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
  }, [API_URL, getToken]);

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
  }, [API_URL, getToken]);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id_notif);
    if (unreadIds.length === 0) return;

    // Met à jour l'UI immédiatement
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);

    try {
      // Utilisez une requête batch si votre API le supporte
      // Sinon, envoyez les requêtes en parallèle
      const promises = unreadIds.map(id =>
        fetch(`${API_URL}/notifications/${id}/mark-read/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      );
      
      await Promise.all(promises);
      console.log(`✅ ${unreadIds.length} notifications marquées comme lues`);
    } catch (error) {
      console.error('❌ Erreur marquage multiple:', error);
    }
  }, [notifications, API_URL, getToken]);

  // Rafraîchir les notifications après marquage comme lu
  const refreshAfterMarkRead = useCallback(() => {
    if (isMounted.current && !isFetching.current) {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

  // Écouteur d'événements personnalisé pour les nouvelles notifications
  const setupEventListeners = useCallback(() => {
    const handleNewNotification = () => {
      console.log('📢 Événement new-notification reçu');
      refreshAfterMarkRead();
    };

    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, [refreshAfterMarkRead]);

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
      window.removeEventListener('new-notification', setupEventListeners);
    };
  }, [fetchNotifications, setupEventListeners, getToken]);

  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    if (!getToken()) return;

    const interval = setInterval(() => {
      if (isMounted.current && !isFetching.current) {
        fetchUnreadCount();
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [fetchUnreadCount, getToken]);

  // Nettoyer à la déconnexion
  useEffect(() => {
    const handleStorageChange = () => {
      if (!getToken()) {
        // Utilisateur déconnecté, nettoyer les notifications
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [getToken]);

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
        refreshAfterMarkRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};