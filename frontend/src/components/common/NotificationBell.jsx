import React, { useState, useEffect } from 'react';
import { Bell, Loader, Check, MessageSquare, BookOpen, Award, TrendingUp, Filter } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from './NotificationPanel';

const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const { notifications, loading, unreadCount, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    fetchUnreadCount(); // récupère le compteur initial
  }, [fetchUnreadCount]);

  const getIconByModule = (moduleSource) => {
    switch (moduleSource?.toLowerCase()) {
      case 'forum': return <MessageSquare size={16} className="text-blue-500" />;
      case 'cours': return <BookOpen size={16} className="text-green-500" />;
      case 'exercice': return <Award size={16} className="text-purple-500" />;
      case 'classement': return <TrendingUp size={16} className="text-yellow-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const handleNotificationNavigation = (notif) => {
    const objectId = notif.object_data?.id || notif.object_data?.cours_id || notif.object_data?.exercice_id || notif.object_data?.forum_id;
    switch (notif.module_source?.toLowerCase()) {
      case 'forum': window.location.href = objectId ? `/community#forum-${objectId}` : '/community'; break;
      case 'cours': window.location.href = objectId ? `/cours/${objectId}` : '/cours'; break;
      case 'exercice': window.location.href = objectId ? `/exercices/${objectId}` : '/exercices'; break;
      case 'classement': window.location.href = '/classement'; break;
      default: window.location.href = '/notifications';
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => {
            setShowDropdown(!showDropdown);
            if (!showDropdown) fetchNotifications();
          }}
          className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} non lues)` : ''}`}
        >
          <Bell size={22} className="text-gray-700 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#ff0000] text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse px-1"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  <Check size={14} /> Tout lire
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader className="animate-spin mx-auto h-8 w-8 text-blue-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Chargement des notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <p className="p-4 text-center text-gray-500 dark:text-gray-400">Aucune notification</p>
              ) : (
                notifications.slice(0, 5).map(notif => (
                  <div
                    key={notif.id_notif}
                    onClick={() => {
                      if (!notif.is_read) markAsRead(notif.id_notif);
                      handleNotificationNavigation(notif);
                      setShowDropdown(false);
                    }}
                    className={`p-4 border-b dark:border-gray-700 cursor-pointer transition-colors ${notif.is_read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        {getIconByModule(notif.module_source)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message_notif}</p>
                        {(notif.envoyeur_prenom || notif.envoyeur_nom) && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            De: {notif.envoyeur_prenom} {notif.envoyeur_nom}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                <button
                  onClick={() => { setShowPanel(true); setShowDropdown(false); }}
                  className="text-sm text-blue-500 hover:text-blue-700 w-full text-center py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Voir toutes les notifications ({notifications.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <NotificationPanel isOpen={showPanel} onClose={() => setShowPanel(false)} />
    </>
  );
};

export default NotificationBell;
