import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  BellOff, 
  CheckCircle, 
  Trash2, 
  Filter,
  Calendar,
  User,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Check,
  X as XIcon
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import toast from 'react-hot-toast';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(null);
  
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

  // Effacer les erreurs après un délai
  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => {
        setActionError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setActionError(null);
    try {
      await fetchNotifications();
      toast.success('Notifications rafraîchies avec succès');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Erreur lors du rafraîchissement';
      setActionError(errorMessage);
      toast.error(errorMessage);
    } finally {
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
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays < 7) {
        return `Il y a ${diffDays} jours`;
      }
      
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

  const handleMarkAllAsRead = async () => {
    setActionError(null);
    try {
      await markAllAsRead();
      toast.success('Toutes les notifications marquées comme lues');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Erreur lors du marquage des notifications';
      setActionError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteAll = async () => {
    setActionError(null);
    try {
      await clearAllNotifications();
      setShowDeleteConfirm(false);
      toast.success('Toutes les notifications ont été supprimées');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Erreur lors de la suppression';
      setActionError(errorMessage);
      toast.error(errorMessage);
      setShowDeleteConfirm(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    setActionError(null);
    try {
      await markAsRead(id);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Erreur lors du marquage';
      setActionError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteNotification = async (id) => {
    setActionError(null);
    try {
      await deleteNotification(id);
      setShowSingleDeleteConfirm(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Erreur lors de la suppression';
      setActionError(errorMessage);
      toast.error(errorMessage);
      setShowSingleDeleteConfirm(null);
    }
  };

  // Options de filtrage
  const filterOptions = [
    { id: 'all', label: `Toutes (${notifications.length})` },
    { id: 'unread', label: `Non lues (${unreadCount})` },
    ...Object.entries(notificationsByType).map(([type, count]) => ({
      id: type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} (${count})`
    }))
  ];

  // Modale de confirmation pour suppression multiple
  const DeleteAllConfirmModal = () => {
    if (!showDeleteConfirm) return null;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-surface dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 animate-fadeIn">
          {/* En-tête */}
          <div className="p-6 border-b border-gray-800/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-muted">
                  Supprimer toutes les notifications
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Action irréversible
                </p>
              </div>
            </div>
            
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-500 text-sm font-medium">
                <AlertTriangle className="inline mr-2" size={16} />
                Cette action supprimera définitivement {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Corps */}
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Êtes-vous absolument certain de vouloir supprimer toutes vos notifications ? 
              Cette action ne peut pas être annulée et toutes les données seront perdues.
            </p>

            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Toutes les notifications seront supprimées</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Cette action est définitive et irréversible</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-800/20 flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-6 py-3 bg-card text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-800/20 flex items-center justify-center gap-2"
            >
              <XIcon size={18} />
              Annuler
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              {loading ? 'Suppression...' : 'Supprimer tout'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modale de confirmation pour suppression unique
  const DeleteSingleConfirmModal = () => {
    if (!showSingleDeleteConfirm) return null;
    
    const notification = notifications.find(n => n.id_notif === showSingleDeleteConfirm);
    if (!notification) return null;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-surface dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 animate-fadeIn">
          {/* En-tête */}
          <div className="p-6 border-b border-gray-800/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-muted">
                  Supprimer la notification
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Action définitive
                </p>
              </div>
            </div>
            
            <div className="bg-card border border-gray-800/20 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                {notification.message_notif}
              </p>
              {notification.module_source && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
                    {notification.module_source}
                  </span>
                  {notification.date_envoie && (
                    <span className="text-xs text-gray-600">
                      {formatDate(notification.date_envoie)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Corps */}
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Cette notification sera définitivement supprimée. Vous ne pourrez plus la consulter.
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Cette action ne peut pas être annulée</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-800/20 flex gap-3">
            <button
              onClick={() => setShowSingleDeleteConfirm(null)}
              className="flex-1 px-6 py-3 bg-card text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-800/20 flex items-center justify-center gap-2"
            >
              <XIcon size={18} />
              Annuler
            </button>
            <button
              onClick={() => handleDeleteNotification(notification.id_notif)}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              {loading ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] transition-all duration-300 ${
          isOpen
            ? 'opacity-100 visible bg-black/30 backdrop-blur-sm'
            : 'opacity-0 invisible bg-transparent'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-surface dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 flex flex-col ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-800/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-muted">
                  Toutes les notifications
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} non lue{unreadCount !== 1 ? 's' : ''} sur {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Message d'erreur global */}
          {actionError && (
            <div className="flex-shrink-0 p-4 border-b border-red-500/20 bg-red-500/10">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{actionError}</span>
                <button
                  onClick={() => setActionError(null)}
                  className="ml-auto text-red-500 hover:text-red-600"
                >
                  <XIcon size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="flex-shrink-0 p-6 border-b border-gray-800/20">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Filtrer par :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filter === option.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-card text-gray-600 hover:border-primary/30 border border-gray-800/20'
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
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || loading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
              >
                <CheckCircle size={16} />
                Tout marquer comme lu
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={notifications.length === 0 || loading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
              >
                <Trash2 size={16} />
                Tout supprimer
              </button>
            </div>
          </div>

          {/* Liste des notifications - Conteneur flexible */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading && !refreshing ? (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">
                  Chargement des notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <BellOff className="text-gray-400 mb-4" size={64} />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  {filter !== 'all'
                    ? 'Aucune notification ne correspond aux critères'
                    : 'Aucune notification pour le moment'}
                </p>
                <p className="text-sm text-gray-500 text-center">
                  {filter !== 'all'
                    ? 'Essayez de modifier vos critères de filtrage'
                    : 'Vous serez notifié ici dès qu\'il y aura de nouvelles activités'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/20">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id_notif}
                    className={`p-4 transition-colors hover:bg-card/50 ${
                      !notif.is_read ? 'bg-primary/5 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notif.is_read && (
                        <div className="w-2 h-2 mt-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-muted font-medium">
                          {notif.message_notif}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {notif.date_envoie && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Calendar size={12} />
                              <span>{formatDate(notif.date_envoie)}</span>
                            </div>
                          )}
                          
                          {(notif.envoyeur_prenom || notif.envoyeur_nom) && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <User size={12} />
                              <span>{notif.envoyeur_prenom} {notif.envoyeur_nom}</span>
                            </div>
                          )}
                          
                          {notif.module_source && (
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
                              {notif.module_source}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          {!notif.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id_notif)}
                              className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium"
                            >
                              Marquer comme lu
                            </button>
                          )}
                          <button
                            onClick={() => setShowSingleDeleteConfirm(notif.id_notif)}
                            className="text-xs px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                          >
                            Supprimer
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
          <div className="flex-shrink-0 p-4 border-t border-gray-800/20 bg-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Affichage de {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                {filter !== 'all' && ' (filtrées)'}
              </p>
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Actualiser</span>
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

      {/* Modales de confirmation */}
      <DeleteAllConfirmModal />
      <DeleteSingleConfirmModal />

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default NotificationPanel;