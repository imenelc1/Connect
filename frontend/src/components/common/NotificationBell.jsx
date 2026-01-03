import React, { useState, useEffect } from 'react';
import { Bell, Loader, Check, MessageSquare, BookOpen, Award, TrendingUp, X, Trash2, Filter, Calendar, User, RefreshCw, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from './NotificationPanel';

const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotifications();

  useEffect(() => {
    if (showDropdown) {
      handleRefresh();
    }
  }, [showDropdown]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotifications();
    } catch (err) {
      console.error("Erreur lors du chargement des notifications:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const getIconByModule = (moduleSource) => {
    switch(moduleSource?.toLowerCase()) {
      case 'forum': return <MessageSquare size={18} className="text-blue-500" />;
      case 'cours': return <BookOpen size={18} className="text-green-500" />;
      case 'exercice': return <Award size={18} className="text-purple-500" />;
      case 'classement': return <TrendingUp size={18} className="text-yellow-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => {
            setShowDropdown(!showDropdown);
            if (!showDropdown) handleRefresh();
          }}
          className="relative p-2 rounded-full hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} non lues)` : ''}`}
        >
          <Bell size={22} className="text-gray dark:text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse px-1 shadow-md shadow-red-600/30">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-96 bg-surface dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-800/20 dark:border-gray-700 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-800/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-muted">Notifications</h3>
                  <p className="text-sm text-gray mt-1">
                    {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                    aria-label="Actualiser"
                  >
                    <RefreshCw size={16} className={`text-gray ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                    aria-label="Fermer"
                  >
                    <X size={16} className="text-gray" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            {unreadCount > 0 && (
              <div className="p-3 border-b border-gray-800/20 bg-card">
                <div className="flex gap-2">
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0 || loading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
                  >
                    <CheckCircle size={16} />
                    Tout lire
                  </button>
                  <button
                    onClick={deleteAllNotifications}
                    disabled={notifications.length === 0 || loading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/30 text-sm"
                  >
                    <Trash2 size={16} />
                    Tout supprimer
                  </button>
                </div>
              </div>
            )}

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {loading && !refreshing ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-gray mt-2">Chargement des notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Bell size={48} className="text-gray mb-3" />
                  <p className="text-muted text-center">Aucune notification pour le moment</p>
                  <p className="text-sm text-gray text-center mt-1">
                    Vous serez notifié ici dès qu'il y aura de nouvelles activités
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/20">
                  {notifications.slice(0, 5).map(notif => (
                    <div
                      key={notif.id_notif}
                      onClick={() => {
                        if (!notif.is_read) markAsRead(notif.id_notif);
                        handleNotificationNavigation(notif);
                        setShowDropdown(false);
                      }}
                      className={`p-4 cursor-pointer transition-colors hover:bg-card ${
                        !notif.is_read ? 'bg-primary/10 border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-card">
                          {getIconByModule(notif.module_source)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted">{notif.message_notif}</p>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {notif.date_envoie && (
                              <div className="flex items-center gap-1 text-xs text-gray">
                                <Calendar size={12} />
                                <span>{formatDate(notif.date_envoie)}</span>
                              </div>
                            )}
                            
                            {(notif.envoyeur_prenom || notif.envoyeur_nom) && (
                              <div className="flex items-center gap-1 text-xs text-gray">
                                <User size={12} />
                                <span>{notif.envoyeur_prenom} {notif.envoyeur_nom}</span>
                              </div>
                            )}
                          </div>
                          
                          {notif.module_source && (
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full capitalize">
                                {notif.module_source}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-800/20 bg-card rounded-b-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray">
                    Affichage de {Math.min(notifications.length, 5)} sur {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => { setShowPanel(true); setShowDropdown(false); }}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Voir tout →
                  </button>
                </div>
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