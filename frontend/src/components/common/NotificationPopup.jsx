// components/common/NotificationPopup.jsx
import React from "react";
import { 
  X, 
  ExternalLink, 
  Clock, 
  User, 
  Calendar,
  ArrowRight,
  BookOpen,
  Target,
  Trophy,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationPopup = ({ notification, isOpen, onClose, onMarkAsRead }) => {
  const navigate = useNavigate();

  if (!notification || !isOpen) return null;

  // Fonction pour obtenir l'icône
  const getIcon = () => {
    const iconProps = { size: 24 };
    
    switch(notification.module_source) {
      case 'courses':
        return <BookOpen {...iconProps} className="text-blue-500" />;
      case 'exercices':
        return <Target {...iconProps} className="text-green-500" />;
      case 'quiz':
        return <CheckCircle {...iconProps} className="text-purple-500" />;
      case 'badges':
        return <Trophy {...iconProps} className="text-yellow-500" />;
      case 'feedback':
        return <MessageSquare {...iconProps} className="text-indigo-500" />;
      default:
        return <BookOpen {...iconProps} className="text-gray-500" />;
    }
  };

  // Fonction pour formater la date complète
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour naviguer vers le contenu
  const navigateToContent = () => {
    if (notification.content_object) {
      switch(notification.module_source) {
        case 'courses':
          navigate(`/courses/${notification.content_object.id}`);
          break;
        case 'exercices':
          navigate(`/exercises/${notification.content_object.id}`);
          break;
        case 'quiz':
          navigate(`/quiz/${notification.content_object.id}`);
          break;
        default:
          navigate('/notifications');
      }
    }
    onClose();
  };

  // Actions disponibles selon le type
  const getActions = () => {
    const actions = [];
    
    if (notification.content_object) {
      actions.push({
        label: 'Voir le contenu',
        icon: <ExternalLink size={16} />,
        onClick: navigateToContent,
        primary: true
      });
    }
    
    if (!notification.is_read) {
      actions.push({
        label: 'Marquer comme lu',
        icon: <CheckCircle size={16} />,
        onClick: onMarkAsRead
      });
    }
    
    actions.push({
      label: 'Fermer',
      icon: <X size={16} />,
      onClick: onClose
    });
    
    return actions;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
        
        {/* En-tête */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                {notification.module_source === 'courses' ? 'Cours' : 
                 notification.module_source === 'exercices' ? 'Exercice' :
                 notification.module_source === 'quiz' ? 'Quiz' :
                 notification.module_source === 'badges' ? 'Badge' : 'Notification'}
              </h3>
              <p className="text-xs text-gray-500 capitalize">
                {notification.action_type?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Message */}
          <div className="mb-6">
            <p className="text-lg text-gray-800 leading-relaxed">
              {notification.message_notif}
            </p>
          </div>

          {/* Métadonnées */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} />
              <span>{formatFullDate(notification.date_envoie)}</span>
            </div>
            
            {notification.envoyeur_nom && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={14} />
                <span>
                  De : {notification.envoyeur_prenom} {notification.envoyeur_nom}
                </span>
              </div>
            )}
            
            {notification.extra_data && Object.keys(notification.extra_data).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-700 mb-2">Détails</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(notification.extra_data).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-500 capitalize">{key}: </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            {getActions().map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`
                  flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                  ${action.primary 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  ${!action.primary && !notification.is_read ? 'border border-blue-200' : ''}
                `}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Indicateur de statut */}
        {!notification.is_read && (
          <div className="px-6 py-3 bg-blue-50 border-t flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-600">Nouvelle notification</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;
