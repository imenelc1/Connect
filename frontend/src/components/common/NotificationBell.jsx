// src/components/common/NotificationBell.jsx
import React, { useState } from 'react';
import { Bell, Loader, Check, MessageSquare, BookOpen, Award, TrendingUp } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { 
    notifications, 
    loading, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'récemment';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours} h`;
    if (diffDays < 7) return `il y a ${diffDays} j`;
    return date.toLocaleDateString();
  };

  const getIconByModule = (moduleSource) => {
    switch(moduleSource) {
      case 'forum':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'cours':
        return <BookOpen size={16} className="text-green-500" />;
      case 'exercice':
        return <Award size={16} className="text-purple-500" />;
      case 'classement':
        return <TrendingUp size={16} className="text-yellow-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };
const handleNotificationNavigation = (notif) => {
  switch (notif.module_source) {

    case 'forum': {
      const forumId = notif.forum_id || notif.object_data?.forum_id;
      if (forumId) {
        window.location.href = `/community#forum-${forumId}`;
      } else {
        window.location.href = '/community';
      }
      break;
    }

    case 'cours': {
      const coursId = notif.object_data?.cours_id;
      if (coursId) {
        window.location.href = `/cours/${coursId}`;
      } else {
        window.location.href = '/cours';
      }
      break;
    }

    case 'exercice': {
      const exerciceId = notif.object_data?.exercice_id;
      if (exerciceId) {
        window.location.href = `/exercices/${exerciceId}`;
      } else {
        window.location.href = '/exercices';
      }
      break;
    }

    case 'classement': {
      window.location.href = '/classement';
      break;
    }

    default: {
      // Fallback si module inconnu
      window.location.href = '/notifications';
    }
  }
};

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) {
            fetchNotifications();
          }
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} non lues)` : ''}`}
      >
        <Bell size={22} className="text-gray-700 dark:text-gray-300" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse border-2 border-white dark:border-gray-800">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Tout marquer comme lu"
                >
                  <Check size={14} />
                  Tout lire
                </button>
              )}
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Rafraîchir"
              >
                {loading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <span className="text-lg">↻</span>
                )}
              </button>
            </div>
          </div>
          
          {/* Liste des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Loader className="animate-spin mx-auto h-8 w-8 text-blue-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Chargement des notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Aucune notification
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Vous serez notifié ici des nouvelles activités
                </p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id_notif}
                  className={`p-4 border-b dark:border-gray-700 cursor-pointer transition-colors group ${
                    notif.is_read 
                      ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750' 
                      : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }`}
                  onClick={() => {
                    if (!notif.is_read) {
                          markAsRead(notif.id_notif);
                        }

                        handleNotificationNavigation(notif);
                        setShowDropdown(false);
                      }}

                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      notif.is_read 
                        ? 'bg-gray-100 dark:bg-gray-700' 
                        : 'bg-blue-100 dark:bg-blue-800'
                    }`}>
                      {getIconByModule(notif.module_source || 'forum')}
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {notif.message_notif}
                      </p>
                      
                      {/* Infos envoyeur */}
                      {notif.envoyeur_prenom && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          De: {notif.envoyeur_prenom} {notif.envoyeur_nom}
                        </p>
                      )}
                      
                      {/* Métadonnées */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notif.date_envoie)}
                          </span>
                          
                          {/* Badge type */}
                          {notif.module_source && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded capitalize">
                              {notif.module_source}
                            </span>
                          )}
                        </div>
                        
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
              <button
                onClick={() => {
                  // Redirection vers page de toutes les notifications
                  window.location.href = '/notifications';
                }}
                className="text-sm text-blue-500 hover:text-blue-700 w-full text-center py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;