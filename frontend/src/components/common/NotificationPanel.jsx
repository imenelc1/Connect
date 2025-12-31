import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  BellOff, 
  CheckCircle, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAllAsRead, 
    markAsRead,
    deleteNotification,
    clearAllNotifications,
    fetchNotifications,
    filterByType
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
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
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
      // Filtre par statut
      if (filter === 'unread' && notif.is_read) return false;
      
      // Filtre par type
      if (filter !== 'all' && filter !== 'unread' && notif.module_source !== filter) return false;
      
      // Filtre par recherche
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          notif.message_notif?.toLowerCase().includes(query) ||
          notif.envoyeur_nom?.toLowerCase().includes(query) ||
          notif.envoyeur_prenom?.toLowerCase().includes(query) ||
          notif.module_source?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [notifications, filter, searchQuery]);

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

  const handleDeleteAll = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ? Cette action est irréversible.')) {
      try {
        await clearAllNotifications();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
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

  return (
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
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Toutes les notifications
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {unreadCount} non lue{unreadCount !== 1 ? 's' : ''} sur {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher dans les notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtres */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer par :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === option.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
      <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
  <div className="flex gap-3">
    <button
      onClick={markAllAsRead}
      disabled={unreadCount === 0 || loading}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#10b981] text-white font-medium rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/40"
    >
      <CheckCircle size={18} />
      Tout marquer comme lu
    </button>
    <button
      onClick={handleDeleteAll}
      disabled={notifications.length === 0 || loading}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#ef4444] text-white font-medium rounded-xl hover:bg-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/40"
    >
      <Trash2 size={18} />
      Tout supprimer
    </button>
  </div>
</div>

        {/* Liste des notifications */}
        <div className="h-[calc(100vh-320px)] overflow-y-auto">
          {loading && !refreshing ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Chargement des notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-6">
              <BellOff className="text-gray-300 dark:text-gray-600 mb-4" size={64} />
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                {searchQuery || filter !== 'all'
                  ? 'Aucune notification ne correspond aux critères'
                  : 'Aucune notification pour le moment'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                {searchQuery || filter !== 'all'
                  ? 'Essayez de modifier vos critères de recherche ou de filtrage'
                  : 'Vous serez notifié ici dès qu\'il y aura de nouvelles activités'}
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id_notif}
                  className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    !notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Badge de statut */}
                    {!notif.is_read && (
                      <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                    )}
                    
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 dark:text-gray-200">
                        {notif.message_notif}
                      </p>
                      
                      {/* Métadonnées */}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {/* Date */}
                        {notif.date_envoie && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={12} />
                            <span>{formatDate(notif.date_envoie)}</span>
                          </div>
                        )}
                        
                        {/* Expéditeur */}
                        {(notif.envoyeur_prenom || notif.envoyeur_nom) && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <User size={12} />
                            <span>{notif.envoyeur_prenom} {notif.envoyeur_nom}</span>
                          </div>
                        )}
                        
                        {/* Type */}
                        {notif.module_source && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full capitalize">
                            {notif.module_source}
                          </span>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {!notif.is_read && (
                          <button
                            onClick={() => markAsRead(notif.id_notif)}
                            className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          >
                            Marquer comme lu
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id_notif)}
                          className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
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
        <div className="sticky bottom-0 p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              {filter !== 'all' && ' (filtrées)'}
            </p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
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
  );
};

export default NotificationPanel;