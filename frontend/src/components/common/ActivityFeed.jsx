// components/common/ActivityFeed.jsx
import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle, 
  BookOpen, 
  Target, 
  Trophy, 
  Clock, 
  AlertCircle,
  MessageSquare,
  ChevronRight,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import axios from "axios";
import api from "../../services/api";
import NotificationPopup from "./NotificationPopup";

const ActivityFeed = ({ isMobile, limit = 5, showTitle = true }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fonction pour récupérer les notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/notifications/user_notifications/");
      const data = response.data;
      
      // Trier par date (les plus récentes en premier)
      const sortedNotifications = data.sort((a, b) => 
        new Date(b.date_envoie) - new Date(a.date_envoie)
      );
      
      setNotifications(sortedNotifications.slice(0, limit));
      
      // Compter les non lues
      const unread = sortedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des notifications:", err);
      setError("Impossible de charger les activités");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/api/notifications/mark_notification_read/${notificationId}/`);
      
      // Mettre à jour localement
      setNotifications(prev => prev.map(notif => 
        notif.id_notif === notificationId 
          ? { ...notif, is_read: true } 
          : notif
      ));
      
      // Mettre à jour le compteur
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur lors du marquage comme lu:", err);
    }
  };

  // Fonction pour marquer toutes comme lues
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id_notif);
      
      // Envoyer les requêtes en parallèle
      await Promise.all(
        unreadIds.map(id => 
          api.post(`/api/notifications/mark_notification_read/${id}/`)
        )
      );
      
      // Mettre à jour localement
      setNotifications(prev => prev.map(notif => ({
        ...notif,
        is_read: true
      })));
      
      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  // Fonction pour obtenir l'icône selon le type
  const getIcon = (type) => {
    const iconProps = { size: 16 };
    
    switch(type) {
      case 'courses':
      case 'lesson_completed':
      case 'course_completed':
        return <BookOpen {...iconProps} className="text-blue-500" />;
      
      case 'exercices':
      case 'exercise_submitted':
      case 'exercise_graded':
        return <Target {...iconProps} className="text-green-500" />;
      
      case 'quiz':
      case 'quiz_completed':
        return <CheckCircle {...iconProps} className="text-purple-500" />;
      
      case 'badges':
      case 'badge_unlocked':
        return <Trophy {...iconProps} className="text-yellow-500" />;
      
      case 'progress':
      case 'streak_achieved':
      case 'time_achievement':
        return <Clock {...iconProps} className="text-orange-500" />;
      
      case 'deadline':
      case 'deadline_approaching':
        return <AlertCircle {...iconProps} className="text-red-500" />;
      
      case 'feedback':
      case 'exercise_feedback':
        return <MessageSquare {...iconProps} className="text-indigo-500" />;
      
      default:
        return <Bell {...iconProps} className="text-gray-500" />;
    }
  };

  // Fonction pour obtenir la couleur de fond
  const getBgColor = (type) => {
    switch(type) {
      case 'courses': return 'bg-blue-50';
      case 'exercices': return 'bg-green-50';
      case 'quiz': return 'bg-purple-50';
      case 'badges': return 'bg-yellow-50';
      case 'progress': return 'bg-orange-50';
      case 'deadline': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} j`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Fonction pour ouvrir la popup de notification
  const openNotificationPopup = (notification) => {
    setSelectedNotification(notification);
    setShowPopup(true);
    
    // Marquer comme lu si ce n'est pas déjà fait
    if (!notification.is_read) {
      markAsRead(notification.id_notif);
    }
  };

  // Charger les notifications au montage
  useEffect(() => {
    fetchNotifications();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Gestionnaire d'événements pour les notifications en temps réel
  useEffect(() => {
    const handleNewNotification = (event) => {
      const newNotification = event.detail;
      setNotifications(prev => [newNotification, ...prev.slice(0, limit - 1)]);
      setUnreadCount(prev => prev + 1);
      
      // Afficher une notification toast
      showToast(newNotification.message_notif);
    };
    
    // Écouter les événements de nouvelles notifications
    window.addEventListener('new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, [limit]);

  // Fonction pour afficher un toast
  const showToast = (message) => {
    // Créer un élément toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-gray-800 text-white p-3 rounded-lg shadow-lg z-50 animate-slide-in';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <Bell size={16} />
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <AlertCircle className="mx-auto text-gray-400 mb-2" size={24} />
        <p className="text-gray-500 text-sm">{error}</p>
        <button 
          onClick={fetchNotifications}
          className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center p-4">
        <Bell className="mx-auto text-gray-300 mb-2" size={32} />
        <p className="text-gray-500 text-sm">Aucune activité récente</p>
        <p className="text-gray-400 text-xs mt-1">
          Complétez des leçons ou soumettez des exercices pour voir vos activités
        </p>
      </div>
    );
  }

  return (
    <>
      {/* En-tête avec compteur */}
      {showTitle && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Activités récentes
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
              </span>
            )}
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <EyeOff size={14} />
              Tout marquer comme lu
            </button>
          )}
        </div>
      )}

      {/* Liste des notifications */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id_notif}
            className={`
              flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
              hover:shadow-md hover:scale-[1.02]
              ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-100'}
              ${getBgColor(notification.module_source)}
            `}
            onClick={() => openNotificationPopup(notification)}
          >
            {/* Icône */}
            <div className={`
              p-2 rounded-full mt-1
              ${notification.is_read ? 'bg-white' : 'bg-white ring-2 ring-blue-200'}
            `}>
              {getIcon(notification.module_source)}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                  {notification.message_notif}
                </p>
                {!notification.is_read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                )}
              </div>
              
              {/* Métadonnées */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatDate(notification.date_envoie)}
                </span>
                
                {/* Type de notification */}
                <span className={`
                  text-xs px-2 py-0.5 rounded-full capitalize
                  ${notification.module_source === 'courses' ? 'bg-blue-100 text-blue-800' : ''}
                  ${notification.module_source === 'exercices' ? 'bg-green-100 text-green-800' : ''}
                  ${notification.module_source === 'quiz' ? 'bg-purple-100 text-purple-800' : ''}
                  ${notification.module_source === 'badges' ? 'bg-yellow-100 text-yellow-800' : ''}
                `}>
                  {notification.module_source}
                </span>
                
                {/* Expéditeur si présent */}
                {notification.envoyeur_nom && (
                  <span className="text-xs text-gray-600">
                    par {notification.envoyeur_prenom} {notification.envoyeur_nom}
                  </span>
                )}
              </div>
            </div>

            {/* Flèche */}
            <ChevronRight size={16} className="text-gray-400 mt-1" />
          </div>
        ))}
      </div>

      {/* Bouton "Voir plus" */}
      {notifications.length >= limit && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/notifications')}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
          >
            Voir toutes les activités
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Popup de notification */}
      <NotificationPopup
        notification={selectedNotification}
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onMarkAsRead={() => selectedNotification && markAsRead(selectedNotification.id_notif)}
      />
    </>
  );
};

export default ActivityFeed;