import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  BellOff,
  CheckCircle,
  Trash2,
  Filter,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTranslation } from 'react-i18next';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { t } = useTranslation("notifications");

  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const { deleteAllNotifications } = useNotifications();


  const {
    notifications,
    loading,
    unreadCount,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
    fetchNotifications
  } = useNotifications();

  // Rafraîchir les notifications à l'ouverture
  useEffect(() => {
    if (isOpen) {
      handleRefresh();
    }
  }, [isOpen]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotifications();
    } catch (err) {
      setError(t("error.loadNotifications"));
    }
    finally {
      setRefreshing(false);
    }
  };

  // Grouper les notifications par type pour les filtres
  const notificationsByType = useMemo(() => {
    const groups = {};
    notifications.forEach(notif => {
      const type = notif.module_source || 'other';
      groups[type] = (groups[type] || 0) + 1;
    });
    return groups;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      if (filter === 'unread' && notif.is_read) return false;
      if (filter !== 'all' && filter !== 'unread' && notif.module_source !== filter) return false;
      return true;
    });
  }, [notifications, filter]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };


  const handleDeleteAll = () => {
    deleteAllNotifications();
  };


  // Options de filtrage
  const filterOptions = [
    { id: 'all', label: `${t("filter.all")} (${notifications.length})` },
    { id: 'unread', label: `${t("filter.unread")} (${unreadCount})` },
    ...Object.entries(notificationsByType).map(([type, count]) => ({
      id: type,
      label: `${t(`filter.${type}`)} (${count})`
    }))
  ];

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${isOpen
        ? 'opacity-100 visible bg-black/30 backdrop-blur-sm'
        : 'opacity-0 invisible bg-transparent'
        }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-surface dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-800/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-muted">
                {t("header.title")}
              </h2>
              <p className="text-sm text-gray mt-1">
                {t("header.unread", { count: unreadCount })}{" "}
                {t("header.total", { total: notifications.length })}
              </p>


            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary/10 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X size={24} className="text-gray" />
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex-shrink-0 p-6 border-b border-gray-800/20">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={18} className="text-gray" />
            <span className="text-sm font-medium text-gray">{t("label")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filter === option.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-card text-gray hover:border-primary/30 border border-gray-800/20'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 p-4 border-b border-gray-800/20 bg-card">
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
            >
              <CheckCircle size={16} />
              {t("markAllRead")}
            </button>
            <button
              onClick={deleteAllNotifications}
              disabled={notifications.length === 0 || loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/30 text-sm"
            >
              <Trash2 size={16} />
              {t("actions.deleteAll")}
            </button>
          </div>
        </div>

        {/* Liste des notifications - Conteneur flexible */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading && !refreshing ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray">
                {t("loading")}
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <BellOff className="text-gray mb-4" size={64} />
              <p className="text-lg font-medium text-gray mb-2">
                {filter !== 'all'
                  ? t("emptyF.filtered")
                  : t("emptyF.title")}
              </p>
              <p className="text-sm text-gray text-center">
                {filter !== 'all'
                  ? t("emptyF.filtered_hint")
                  : t("emptyF.subtitle")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/20">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id_notif}
                  className={`p-4 transition-colors hover:bg-card ${!notif.is_read ? 'bg-primary/10 border-l-4 border-primary' : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {!notif.is_read && (
                      <div className="w-2 h-2 mt-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-muted">
                        {notif.message_notif}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2">
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

                        {notif.module_source && (
                          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full capitalize">
                            {notif.module_source}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3">
                        {!notif.is_read && (
                          <button
                            onClick={() => markAsRead(notif.id_notif)}
                            className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                          >
                            {/* Marquer comme lu */}
                            {t("actions.markAsRead")}
                          </button>
                        )}
                        <button

                          onClick={() => deleteNotification(notif.id_notif)}
                          className="text-xs px-3 py-1 bg-red-500 text-blue rounded-lg hover:bg-red-400 transition-colors shadow-sm"
                        >
                          {t("actions.delete")}
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-800/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray">
              {t("footer.count", { count: filteredNotifications.length })}
              {filter !== "all" && ` ${t("footer.filtered")}`}
            </p>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              <span>{t("refresh")}</span>

              {refreshing ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
