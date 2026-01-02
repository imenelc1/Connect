import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import { 
  MessageSquare, 
  TrendingUp, 
  User, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye,
  Filter,
  Users,
  GraduationCap,
  Search,
  Clock,
  MoreVertical,
  ChevronDown,
  X,
  Heart,
  Send,
  MessageCircle,
  BookOpen,
  LayoutGrid,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";

// =========================
// MODAL DE VISUALISATION DU FORUM (gardé tel quel)
// =========================
const ForumViewModal = ({ isOpen, onClose, forum, messages, onPostMessage, onPostComment, onLikeMessage, onDeleteMessage, onDeleteComment }) => {
  const [newMessage, setNewMessage] = useState("");
  const [newComment, setNewComment] = useState({});
  const [messageDropdown, setMessageDropdown] = useState(null);
  const [commentDropdown, setCommentDropdown] = useState(null);

  if (!isOpen || !forum) return null;

  const handleSubmitMessage = async () => {
    if (newMessage.trim()) {
      await onPostMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleSubmitComment = async (messageId) => {
    const commentText = newComment[messageId];
    if (commentText?.trim()) {
      await onPostComment(messageId, commentText);
      setNewComment({ ...newComment, [messageId]: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-800/20">
        {/* Header du modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/20">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            >
              <X size={24} className="text-muted" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-muted">
                {forum.title}
              </h2>
              <p className="text-gray">
                Créé par <span className="font-semibold text-primary">{forum.utilisateur}</span> • {forum.date_creation}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              forum.cible === "etudiants"
                ? "bg-grad-4 text-white"
                : "bg-grad-2 text-white"
            }`}>
              {forum.cible === "etudiants" ? (
                <span className="flex items-center gap-1">
                  <GraduationCap size={12} />
                  Pour étudiants
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  Pour enseignants
                </span>
              )}
            </span>
            <span className="text-xs px-3 py-1.5 bg-primary/20 text-primary rounded-full font-medium">
              {forum.type}
            </span>
          </div>
        </div>

        {/* Contenu défilable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description du forum */}
          <div className="mb-6 p-5 bg-card rounded-2xl shadow-sm border border-gray-800/20">
            <h3 className="font-semibold text-muted mb-3 flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              Description du forum
            </h3>
            <p className="text-gray leading-relaxed">
              {forum.originalData?.contenu_forum || "Aucune description fournie."}
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-card p-4 rounded-2xl border border-gray-800/20 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary">{messages.length}</div>
              <div className="text-sm text-gray">Messages</div>
            </div>
            <div className="bg-card p-4 rounded-2xl border border-gray-800/20 text-center shadow-sm">
              <div className="text-2xl font-bold text-pink">
                {messages.reduce((sum, msg) => sum + (msg.nombre_likes || 0), 0)}
              </div>
              <div className="text-sm text-gray">Likes totaux</div>
            </div>
            <div className="bg-card p-4 rounded-2xl border border-gray-800/20 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue">
                {messages.reduce((sum, msg) => sum + (msg.commentaires?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray">Commentaires</div>
            </div>
          </div>

          {/* Formulaire pour poster un message */}
          <div className="mb-6 p-5 bg-card rounded-2xl shadow-sm border border-gray-800/20">
            <h3 className="font-semibold text-muted mb-4 flex items-center gap-2">
              <Send size={18} className="text-primary" />
              Poster un message
            </h3>
            <div className="flex gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Partagez vos pensées, questions ou suggestions..."
                className="flex-1 p-4 border border-gray-800/20 rounded-xl bg-surface text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows="3"
              />
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={handleSubmitMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 h-auto rounded-xl"
                >
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Liste des messages */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-gray-800/20">
                <MessageCircle className="w-16 h-16 text-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted mb-2">Aucun message pour le moment</h3>
                <p className="text-gray max-w-md mx-auto">
                  Soyez le premier à participer à la discussion ! Partagez vos idées et démarrez la conversation.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id_message}
                  className="bg-card rounded-2xl border border-gray-800/20 p-5 hover:border-primary/30 transition-all duration-300 shadow-sm"
                >
                  {/* En-tête du message */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-grad-2 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                        {message.utilisateur_nom?.[0] || message.utilisateur?.nom?.[0] || "U"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-muted">
                          {message.utilisateur_nom || message.utilisateur?.nom || "Utilisateur"} {message.utilisateur_prenom || message.utilisateur?.prenom || ""}
                        </h4>
                        <p className="text-sm text-gray flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(message.date_publication).toLocaleDateString("fr-FR", {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Menu actions */}
                    <div className="relative">
                      <button
                        onClick={() => setMessageDropdown(
                          messageDropdown === message.id_message ? null : message.id_message
                        )}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray" />
                      </button>
                      
                      {messageDropdown === message.id_message && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-gray-800/20 z-10 overflow-hidden">
                          <button
                            onClick={() => {
                              onDeleteMessage(message.id_message);
                              setMessageDropdown(null);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 flex items-center transition-colors"
                          >
                            <Trash2 size={16} className="mr-3" />
                            Supprimer le message
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contenu du message */}
                  <p className="text-gray mb-4 leading-relaxed whitespace-pre-line">
                    {message.contenu_message}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-6 border-t border-gray-800/20 pt-4">
                    <button
                      onClick={() => onLikeMessage(message.id_message)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        message.user_has_liked 
                          ? "bg-red-500/10 text-red-500" 
                          : "hover:bg-primary/10 text-gray"
                      }`}
                    >
                      <Heart 
                        size={18} 
                        fill={message.user_has_liked ? "currentColor" : "none"} 
                        className={message.user_has_liked ? "animate-pulse" : ""}
                      />
                      <span className="font-medium">{message.nombre_likes || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => setNewComment({
                        ...newComment,
                        [message.id_message]: newComment[message.id_message] || ""
                      })}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 text-gray transition-all duration-200"
                    >
                      <MessageCircle size={18} />
                      <span>Répondre</span>
                      {message.commentaires?.length > 0 && (
                        <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                          {message.commentaires.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Formulaire de commentaire */}
                  {newComment[message.id_message] !== undefined && (
                    <div className="mt-4 pl-12">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={newComment[message.id_message] || ""}
                          onChange={(e) => setNewComment({
                            ...newComment,
                            [message.id_message]: e.target.value
                          })}
                          placeholder="Écrivez votre réponse..."
                          className="flex-1 px-4 py-3 border border-gray-800/20 rounded-xl bg-surface text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                          onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment(message.id_message)}
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="primary"
                            onClick={() => handleSubmitComment(message.id_message)}
                            disabled={!newComment[message.id_message]?.trim()}
                            className="px-4 py-3 rounded-xl"
                          >
                            <Send size={16} />
                          </Button>
                          <button
                            onClick={() => {
                              const updated = { ...newComment };
                              delete updated[message.id_message];
                              setNewComment(updated);
                            }}
                            className="px-3 py-2 text-sm text-gray hover:text-muted transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Liste des commentaires */}
                  {message.commentaires && message.commentaires.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="text-sm text-gray font-medium mb-2">
                        Réponses ({message.commentaires.length})
                      </div>
                      {message.commentaires.map((comment) => (
                        <div 
                          key={comment.id_commentaire || comment.id} 
                          className="pl-12 py-3 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-grad-3 rounded-full flex items-center justify-center text-xs text-white font-bold">
                                {comment.utilisateur_nom?.[0] || comment.utilisateur?.nom?.[0] || "U"}
                              </div>
                              <div>
                                <span className="font-medium text-sm text-muted">
                                  {comment.utilisateur_nom || comment.utilisateur?.nom || "Utilisateur"} {comment.utilisateur_prenom || comment.utilisateur?.prenom || ""}
                                </span>
                                <span className="text-xs text-gray ml-2">
                                  {new Date(comment.date_commpub || comment.date_creation).toLocaleTimeString("fr-FR", { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => onDeleteComment(comment.id_commentaire, message.id_message)}
                              className="text-red-500 hover:text-red-400 p-1 transition-colors"
                              title="Supprimer le commentaire"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-sm text-gray ml-10">
                            {comment.contenu_comm || comment.contenu}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer du modal */}
        <div className="border-t border-gray-800/20 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-gray">
              <span className="flex items-center gap-1">
                <MessageSquare size={14} />
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Heart size={14} />
                {messages.reduce((sum, msg) => sum + (msg.nombre_likes || 0), 0)} likes
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} />
                {messages.reduce((sum, msg) => sum + (msg.commentaires?.length || 0), 0)} réponses
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                className="px-6 py-2"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================
// MODAL DE CRÉATION/MODIFICATION (gardé tel quel)
// =========================
const ForumModal = ({ isOpen, onClose, onSubmit, editingForum }) => {
  const { t } = useTranslation("ForumManagement");
  const [formData, setFormData] = useState({
    titre_forum: "",
    type: "",
    contenu_forum: "",
    cible: "etudiants"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingForum) {
      setFormData({
        titre_forum: editingForum.title || "",
        type: editingForum.description || "",
        contenu_forum: editingForum.originalData?.contenu_forum || "",
        cible: editingForum.originalData?.cible || "etudiants"
      });
    } else {
      setFormData({
        titre_forum: "",
        type: "",
        contenu_forum: "",
        cible: "etudiants"
      });
    }
  }, [editingForum, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-md border border-gray-800/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-muted">
            {editingForum ? "Modifier le forum" : t("ForumManagement.createF")}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray hover:text-muted p-1 rounded-full hover:bg-primary/10"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray mb-2">
              Titre du forum *
            </label>
            <input
              type="text"
              required
              value={formData.titre_forum}
              onChange={(e) =>
                setFormData({ ...formData, titre_forum: e.target.value })
              }
              className="w-full p-3 border border-gray-800/20 rounded-lg bg-surface text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Débats sur l'IA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray mb-2">
              Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full p-3 border border-gray-800/20 rounded-lg bg-surface text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner un type</option>
              <option value="Discussion">Discussion</option>
              <option value="Question">Question</option>
              <option value="Débat">Débat</option>
              <option value="Annonce">Annonce</option>
              <option value="Projet">Projet</option>
              <option value="Aide">Aide</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.contenu_forum}
              onChange={(e) =>
                setFormData({ ...formData, contenu_forum: e.target.value })
              }
              className="w-full p-3 border border-gray-800/20 rounded-lg bg-surface text-muted min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Décrivez le sujet de ce forum..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray mb-2">
              Public cible *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, cible: "etudiants" })}
                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                  formData.cible === "etudiants"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-gray-800/20 bg-surface text-gray hover:border-primary/30"
                }`}
              >
                <GraduationCap size={24} />
                <span className="font-medium">Étudiants</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, cible: "enseignants" })}
                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                  formData.cible === "enseignants"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-gray-800/20 bg-surface text-gray hover:border-primary/30"
                }`}
              >
                <Users size={24} />
                <span className="font-medium">Enseignants</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-800/20">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-6"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="px-6"
            >
              {loading ? "En cours..." : editingForum ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================
// MODAL DE CONFIRMATION SUPPRESSION (gardé tel quel)
// =========================
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, forumTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-md border border-gray-800/20">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          
          <h3 className="text-xl font-bold text-muted mb-2">
            Supprimer le forum
          </h3>
          
          <p className="text-gray mb-6">
            Êtes-vous sûr de vouloir supprimer le forum <strong>"{forumTitle}"</strong> ? 
            Cette action supprimera également tous les messages et commentaires associés.
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={onClose}
              className="px-6"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={onConfirm}
              className="px-6 bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================
// COMPOSANT PRINCIPAL - ADAPTÉ AU STYLE DASHBOARDADMIN
// =========================
export default function ForumManagement() {
  const navigate = useNavigate();
  const { t } = useTranslation("ForumManagement");
  const { toggleDarkMode } = useContext(ThemeContext);
  const { fetchUnreadCount } = useNotifications();

  // =========================
  // STATES
  // =========================
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingForum, setEditingForum] = useState(null);
  const [forumToDelete, setForumToDelete] = useState(null);
  const [selectedForum, setSelectedForum] = useState(null);
  const [forumMessages, setForumMessages] = useState([]);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeFilter, setActiveFilter] = useState("pending");

  // Données utilisateur (comme DashboardAdmin)
  const token = localStorage.getItem("access") || localStorage.getItem("admin_token");
  const adminData = JSON.parse(localStorage.getItem("admin")) || {};
  const initials = `${adminData.nom?.[0] || ""}${adminData.prenom?.[0] || ""}`.toUpperCase();

  // =========================
  // FETCH FORUMS
  // =========================
  const fetchForums = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("admin_token");

      if (!token) {
        throw new Error("Admin non authentifié");
      }

      const res = await fetch("http://localhost:8000/api/forums/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur serveur");
      }

      const data = await res.json();

      const formattedForums = data.map((forum) => ({
        id: forum.id_forum,
        title: forum.titre_forum,
        description: forum.type,
        threads: forum.nombre_messages,
        posts: forum.nombre_likes,
        members: forum.nombre_likes,
        userHasLiked: forum.user_has_liked,
        cible: forum.cible,
        utilisateur: forum.utilisateur_nom + " " + forum.utilisateur_prenom,
        date_creation: new Date(forum.date_creation).toLocaleDateString("fr-FR"),
        originalData: forum,
      }));

      setForums(formattedForums);
    } catch (err) {
      console.error("Erreur chargement forums :", err);
      setError("Impossible de charger les forums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForums();
  }, []);

  // =========================
  // RESPONSIVE EFFECTS (comme DashboardAdmin)
  // =========================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);
   
    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  // =========================
  // HANDLERS FORUMS
  // =========================
  const handleCreateForum = async (formData) => {
    const token = localStorage.getItem("admin_token");
    
    const url = editingForum 
      ? `http://localhost:8000/api/forums/${editingForum.id}/` 
      : "http://localhost:8000/api/forums/create/";
    
    const method = editingForum ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Erreur lors de l'opération");
    }

    const newForum = await res.json();
    
    if (editingForum) {
      setForums(forums.map(f => 
        f.id === editingForum.id 
          ? {
              ...f,
              title: newForum.titre_forum,
              description: newForum.type,
              cible: newForum.cible,
              originalData: newForum
            }
          : f
      ));
    } else {
      const formattedForum = {
        id: newForum.id_forum,
        title: newForum.titre_forum,
        description: newForum.type,
        threads: 0,
        posts: 0,
        members: 0,
        userHasLiked: false,
        cible: newForum.cible,
        utilisateur: newForum.utilisateur_nom + " " + newForum.utilisateur_prenom,
        date_creation: new Date(newForum.date_creation).toLocaleDateString("fr-FR"),
        originalData: newForum,
      };
      
      setForums([formattedForum, ...forums]);
    }
    
    setEditingForum(null);
  };

  const handleDeleteForum = async () => {
    if (!forumToDelete) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`http://localhost:8000/api/forums/${forumToDelete.id}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setForums(forums.filter(forum => forum.id !== forumToDelete.id));
      setIsDeleteModalOpen(false);
      setForumToDelete(null);
    } catch (err) {
      alert("Erreur: " + err.message);
      setIsDeleteModalOpen(false);
    }
  };

  // =========================
  // HANDLERS VIEW MODAL
  // =========================
  const handleViewForum = async (forum) => {
    try {
      setSelectedForum(forum);
      
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`http://localhost:8000/api/forums/${forum.id}/messages/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const messagesData = await res.json();
        setForumMessages(messagesData);
        setIsViewModalOpen(true);
      } else {
        alert("Impossible de charger les messages");
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors du chargement du forum");
    }
  };

  // =========================
  // STATISTIQUES (comme DashboardAdmin)
  // =========================
  const stats = [
    { 
      title: "Forums totaux", 
      value: forums.length,
      icon: <MessageSquare className="text-blue" size={40} />,
      bg: "bg-grad-5"
    },
    { 
      title: "Pour étudiants", 
      value: forums.filter(f => f.cible === "etudiants").length,
      icon: <GraduationCap className="text-purple" size={40} />,
      bg: "bg-grad-4"
    },
    { 
      title: "Pour enseignants", 
      value: forums.filter(f => f.cible === "enseignants").length,
      icon: <Users className="text-pink" size={40} />,
      bg: "bg-grad-2"
    },
    { 
      title: "Messages totaux", 
      value: forums.reduce((sum, f) => sum + f.threads, 0),
      icon: <TrendingUp className="text-blue" size={40} />,
      bg: "bg-grad-3"
    },
  ];

  // =========================
  // FILTRES EN TABS (comme DashboardAdmin)
  // =========================
  const filterTabs = [
    { id: "all", label: "Tous les forums" },
    { id: "etudiants", label: "Pour étudiants" },
    { id: "enseignants", label: "Pour enseignants" },
  ];

  // =========================
  // FILTRES
  // =========================
  const filteredForums = forums.filter(forum => {
    const matchesSearch = forum.title.toLowerCase().includes(search.toLowerCase()) ||
                         forum.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = activeFilter === "all" || forum.cible === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  // =========================
  // RENDER - ADAPTÉ AU STYLE DASHBOARDADMIN
  // =========================
  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      {/* Main Content - Layout comme DashboardAdmin */}
      <main className={`
        flex-1 p-6 pt-10 space-y-5 transition-all duration-300
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
        {/* Header - Comme DashboardAdmin */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">
              {t("ForumManagement.forumM") || "Gestion des Forums"}
            </h1>
            <p className="text-gray">
              {t("ForumManagement.Managediscussion") || "Gérez et modérez les forums de discussion"}
            </p>
          </div>
          
          <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
            <NotificationBell />
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => {
                const i18n = window.i18n;
                if (i18n?.changeLanguage) i18n.changeLanguage(lang);
              }}
            />
          </div>
        </div>

        {/* STATISTIQUES - Exactement comme DashboardAdmin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={i}
              className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition flex justify-between items-center bg-gradient-to-br ${stat.bg}`}
            >
              <div>
                <p className="text-gray">{stat.title}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-muted">{stat.value}</h2>
              </div>
              <div className="opacity-80">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* GRID: FORUMS + ACTIVITÉ - Comme DashboardAdmin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: Forums List */}
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-muted mb-4">Forums de discussion</h2>

            {/* TABS COMME DASHBOARDADMIN */}
            <div className="flex overflow-x-auto gap-2 bg-primary/50 p-2 font-semibold rounded-full w-max max-w-full shadow-sm mb-4 text-sm">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-1.5 transition-all duration-300 rounded-full text-white font-bold text-sm
                    ${activeFilter === tab.id 
                      ? "text-white bg-primary shadow-md"
                      : "text-primary/70"
                    }`}
                >
                  {tab.label} {tab.id !== "all" && `(${forums.filter(f => f.cible === tab.id).length})`}
                </button>
              ))}
            </div>

            {/* BARRE DE RECHERCHE ET BOUTON CRÉER */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un forum..."
                    className="w-full pl-12 pr-4 py-3 bg-surface border border-gray-800/20 rounded-xl text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <Button
                text={
                  <span className="flex items-center gap-2">
                    <Plus size={18} />
                    {t("ForumManagement.createF") || "Créer un forum"}
                  </span>
                }
                variant="primary"
                className="!w-auto px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                onClick={() => {
                  setEditingForum(null);
                  setIsModalOpen(true);
                }}
              />
            </div>

            {/* États de chargement/erreur */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-gray">Chargement des forums...</p>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center mb-6">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 mb-3">{error}</p>
                <Button
                  variant="secondary"
                  onClick={fetchForums}
                  className="px-4 py-2"
                >
                  Réessayer
                </Button>
              </div>
            )}

            {/* Liste des forums */}
            {!loading && !error && (
              <div className="space-y-4">
                {filteredForums.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-muted mb-2">Aucun forum trouvé</h3>
                    <p className="text-gray mb-6 max-w-md mx-auto">
                      {search ? "Aucun forum ne correspond à votre recherche." : "Commencez par créer votre premier forum."}
                    </p>
                    {!search && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setEditingForum(null);
                          setIsModalOpen(true);
                        }}
                        className="px-6 py-3"
                      >
                        <Plus size={18} className="mr-2" />
                        Créer un forum
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredForums.map((forum) => (
                    <div
                      key={forum.id}
                      className="bg-surface rounded-2xl p-5 border border-gray-800/20 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                        {/* Icône et info de base */}
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            forum.cible === "etudiants" ? "bg-grad-4" : "bg-grad-2"
                          }`}>
                            {forum.cible === "etudiants" ? (
                              <GraduationCap className="w-6 h-6 text-white" />
                            ) : (
                              <Users className="w-6 h-6 text-white" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-muted">
                                {forum.title}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                forum.cible === "etudiants"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-pink/20 text-pink"
                              }`}>
                                {forum.cible === "etudiants" ? "Pour étudiants" : "Pour enseignants"}
                              </span>
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                {forum.type}
                              </span>
                            </div>
                            
                            <p className="text-gray text-sm mb-3 line-clamp-2">
                              {forum.originalData?.contenu_forum || "Pas de description"}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray">
                              <span className="flex items-center gap-1">
                                <MessageSquare size={14} />
                                {forum.threads} discussions
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp size={14} />
                                {forum.posts} likes
                              </span>
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                Créé par {forum.utilisateur}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {forum.date_creation}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Boutons d'action */}
                        <div className="flex lg:flex-col gap-2 lg:border-l lg:pl-5 border-gray-800/20">
                          <Button
                            variant="secondary"
                            onClick={() => handleViewForum(forum)}
                            className="flex items-center gap-2 px-3 py-2"
                          >
                            <Eye size={16} />
                            Voir
                          </Button>
                          
                          <Button
                            variant="manage"
                            onClick={() => navigate(`/forum/${forum.id}/manage`)}
                            className="flex items-center gap-2 px-3 py-2"
                          >
                            <Users size={16} />
                            Gérer
                          </Button>
                          
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setEditingForum(forum);
                              setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2"
                          >
                            <Edit2 size={16} />
                            Modifier
                          </Button>
                          
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setForumToDelete(forum);
                              setIsDeleteModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Activités récentes (mock) - Comme DashboardAdmin */}
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-muted mb-4">Activités récentes</h2>

            <ul className="flex flex-col gap-4">
              {forums.slice(0, 5).map((forum, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-grad-2 text-muted flex items-center justify-center font-bold">
                    {forum.utilisateur?.[0] || "F"}
                  </div>
                  <div className="flex-1">
                    <p className="text-muted font-medium">{forum.utilisateur}</p>
                    <p className="text-gray text-sm">a créé "{forum.title}"</p>
                    <span className="text-gray-400 text-xs">{forum.date_creation}</span>
                  </div>
                </li>
              ))}
              {forums.length === 0 && (
                <li className="text-center py-4">
                  <MessageSquare className="w-12 h-12 text-gray mx-auto mb-2" />
                  <p className="text-gray text-sm">Aucune activité récente</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>

      {/* ========================= */}
      {/* MODALS - GARDÉS TELS QUELS */}
      {/* ========================= */}

      {/* Modal de création/modification */}
      <ForumModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingForum(null);
        }}
        onSubmit={handleCreateForum}
        editingForum={editingForum}
      />
      
      {/* Modal de confirmation suppression */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setForumToDelete(null);
        }}
        onConfirm={handleDeleteForum}
        forumTitle={forumToDelete?.title}
      />
      
      {/* Modal de visualisation */}
      <ForumViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedForum(null);
          setForumMessages([]);
        }}
        forum={selectedForum}
        messages={forumMessages}
        onPostMessage={() => {}}
        onPostComment={() => {}}
        onLikeMessage={() => {}}
        onDeleteMessage={() => {}}
        onDeleteComment={() => {}}
      />
    </div>
  );
}