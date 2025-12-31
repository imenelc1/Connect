import React, { useState, useEffect } from 'react';
import {
  Bell,
  Loader,
  Check,
  MessageSquare,
  BookOpen,
  Award,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTranslation } from "react-i18next";

const NotificationBell = () => {
  const { t } = useTranslation("notifications");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refreshAfterMarkRead
  } = useNotifications();

  // Vérifie si l'utilisateur est connecté
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token") ||
        localStorage.getItem("access") ||
        localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Charger le compteur uniquement si connecté
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount, isAuthenticated]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return t("recently");

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t("justNow");
      if (diffMins < 60) return t("minutesAgo", { count: diffMins });
      if (diffHours < 24) return t("hoursAgo", { count: diffHours });
      if (diffDays < 7) return t("daysAgo", { count: diffDays });
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    } catch (e) {
      return 'récemment';
    }
  };

  const getIconByModule = (moduleSource) => {
    switch (moduleSource?.toLowerCase()) {
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

  const handleNotificationClick = (notif) => {
    // Marquer comme lu si ce n'est pas déjà fait
    if (!notif.is_read) {
      markAsRead(notif.id_notif);
    }

    // Naviguer vers la destination
    handleNotificationNavigation(notif);
    setShowDropdown(false);
  };

  const handleNotificationNavigation = (notif) => {
    let url = '/notifications';

    // Analyser extra_data si c'est une chaîne JSON
    let extraData = notif.extra_data;
    if (typeof extraData === 'string') {
      try {
        extraData = JSON.parse(extraData);
      } catch (e) {
        console.warn('Erreur parsing extra_data:', e);
        extraData = {};
      }
    }

    switch (notif.module_source?.toLowerCase()) {
      case 'forum': {
        const forumId = extraData?.forum_id || notif.extra_data?.forum_id;
        url = forumId ? `/community#forum-${forumId}` : '/community';
        break;
      }
      case 'cours': {
        const coursId = extraData?.cours_id || notif.extra_data?.cours_id;
        url = coursId ? `/cours/${coursId}` : '/cours';
        break;
      }
      case 'exercice': {
        const exerciceId = extraData?.exercice_id || notif.extra_data?.exercice_id;
        url = exerciceId ? `/exercices/${exerciceId}` : '/exercices';
        break;
      }
      case 'classement':
        url = '/classement';
        break;
      default:
        url = '/notifications';
    }

    window.location.href = url;
  };

  const handleRefresh = () => {
    fetchNotifications();
    refreshAfterMarkRead();
  };

  // Si non connecté, ne pas afficher la cloche
  if (!isAuthenticated) {
    return null;
  }

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
        aria-label={t("aria", { count: unreadCount })}
      >
        <Bell size={22} className="text-gray-700 dark:text-gray-300" />

        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse px-1 border-2 border-white dark:border-gray-800"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Overlay pour fermer en cliquant à l'extérieur */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{t("title")}</h3>
                {unreadCount > 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                   {unreadCount > 0 ? t("unread", { count: unreadCount }) : t("empty")}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                   {t("allRead")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title= {t("markAllRead")}
                    disabled={loading}
                  >
                    <Check size={14} />
                     {t("markAllRead")}
                  </button>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                   title={t("refresh")}
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {error ? (
                <div className="p-6 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    {/* Erreur de chargement */}
                    {t("errorLoading")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {error}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="mt-3 text-sm text-blue-500 hover:text-blue-700"
                  >
                    {/* Réessayer */}
                    {t("tryAgain")}
                  </button>
                </div>
              ) : loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Loader className="animate-spin mx-auto h-8 w-8 text-blue-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {/* Chargement des notifications... */}
                    {t("loading")}
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                   {t("empty")}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    {/* Vous serez notifié ici des nouvelles activités */}
                    {t("emptyHint")}
                  </p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id_notif}
                    className={`p-4 border-b dark:border-gray-700 cursor-pointer transition-colors group ${notif.is_read
                        ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                        : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.is_read
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'bg-blue-100 dark:bg-blue-800'
                        }`}>
                        {getIconByModule(notif.module_source)}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                          {notif.message_notif}
                        </p>

                        {/* Infos envoyeur */}
                        {(notif.envoyeur_prenom || notif.envoyeur_nom) && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {t("from")} {notif.envoyeur_prenom} {notif.envoyeur_nom}
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
                              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full capitalize">
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
                    window.location.href = '/notifications';
                    setShowDropdown(false);
                  }}
                  className="text-sm text-blue-500 hover:text-blue-700 w-full text-center py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {/* Voir toutes les notifications */}
                  {t("viewAll")}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
