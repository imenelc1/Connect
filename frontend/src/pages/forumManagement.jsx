import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Input from "../components/common/Input";
import {
  createForum,
  updateForum,
  deleteForum,
  fetchForums,
  createMessage,
  fetchForumMessages,
  deleteMessage,
  createComment,
  deleteComment,
  likeMessage
} from "../services/forumService";
import {
  MessageSquare,
  TrendingUp,
  User,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Users,
  GraduationCap,
  Search,
  Clock,
  AlertCircle,
  Heart,
  Send,
  MessageCircle,
  X,
  MoreVertical
} from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";

// =========================
// MODAL DE VISUALISATION DU FORUM
// =========================
const ForumViewModal = ({
  isOpen,
  onClose,
  forum,
  messages,
  onPostMessage,
  onPostComment,
  onLikeMessage,
  onDeleteMessage,
  onDeleteComment
}) => {
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
      setNewComment(prev => ({ ...prev, [messageId]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-800/20">
        {/* Header du modal */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-gray-800/20">
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
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${forum.cible === "etudiants"
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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${message.administrateur || message.auteur_type === 'admin'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'bg-gradient-to-br from-blue-500 to-teal-400'
                        }`}>
                        {message.administrateur || message.auteur_type === 'admin'
                          ? '👑'
                          : (message.utilisateur_nom?.[0] || message.utilisateur?.nom?.[0] || 'U').toUpperCase()
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-muted">
                            {message.auteur_nom || (message.utilisateur_nom ? `${message.utilisateur_nom} ${message.utilisateur_prenom}` : 'Utilisateur')}
                          </h4>
                          {message.administrateur || message.auteur_type === 'admin' ? (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                              Admin
                            </span>
                          ) : null}
                        </div>
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${message.user_has_liked
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
                      onClick={() => setNewComment(prev => ({
                        ...prev,
                        [message.id_message]: prev[message.id_message] || ""
                      }))}
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
                          onChange={(e) => setNewComment(prev => ({
                            ...prev,
                            [message.id_message]: e.target.value
                          }))}
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
                              setNewComment(prev => {
                                const updated = { ...prev };
                                delete updated[message.id_message];
                                return updated;
                              });
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
// MODAL DE CRÉATION/MODIFICATION
// =========================
const ForumModal = ({ isOpen, onClose, onSubmit, editingForum }) => {
  const { t } = useTranslation("ForumManagement");
  const [formData, setFormData] = useState({
    titre_forum: "",
    contenu_forum: "",
    cible: "etudiants"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingForum) {
      setFormData({
        titre_forum: editingForum.title || "",
        contenu_forum: editingForum.originalData?.contenu_forum || "",
        cible: editingForum.originalData?.cible || "etudiants"
      });
    } else {
      setFormData({
        titre_forum: "",
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
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md border border-gray-800/20">
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
            <Input
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
              Description *
            </label>
            <textarea
              required
              value={formData.contenu_forum}
              onChange={(e) =>
                setFormData({ ...formData, contenu_forum: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-surface text-muted min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Décrivez le sujet de ce forum..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray mb-2">
              Public cible *
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, cible: "etudiants" })}
                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${formData.cible === "etudiants"
                  ? "border-muted bg-muted/10 text-muted shadow-sm"
                  : "border-gray-800/20 bg-surface text-gray hover:border-primary/30"
                  }`}
              >
                <GraduationCap size={24} />
                <span className="font-medium">Étudiants</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, cible: "enseignants" })}
                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${formData.cible === "enseignants"
                  ? "border-muted bg-muted/10 text-muted shadow-sm"
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
// MODAL DE CONFIRMATION SUPPRESSION
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
// COMPOSANT PRINCIPAL - FORUM MANAGEMENT
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

  const [activeFilter, setActiveFilter] = useState("all");

  // Données utilisateur
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
        toast.error("Admin non authentifié");
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
        toast.error(text || "Erreur serveur");
        throw new Error(text || "Erreur serveur");
      }

      const data = await res.json();

      const formattedForums = data.map((forum) => ({
        id: forum.id_forum,
        title: forum.titre_forum,
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
      toast.error("Impossible de charger les forums");
    } finally {
      setLoading(false);
    }
  };
  

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);


  useEffect(() => {
    fetchForums();
  }, []);

  // =========================
  // RESPONSIVE EFFECTS
  // =========================
  // Effet pour la responsivité
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
  
      // Gestion de la sidebar
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

    if (!token) {
      toast.error("Token manquant. Veuillez vous reconnecter.");
      return;
    }

    try {
      // FORMAT EXACT pour Django
      const forumData = {
        titre_forum: formData.titre_forum.trim(),
        contenu_forum: formData.contenu_forum.trim(),
        cible: formData.cible,
        type: formData.cible === "etudiants"
          ? "admin_student_forum"
          : "admin_teacher_forum"
      };

      console.log("📤 Sending forum data to Django:", forumData);

      if (editingForum) {
        // MODIFICATION - Utilise l'URL admin
        const updatedForum = await updateForum(token, editingForum.id, forumData);

        // Mettre à jour l'état local
        setForums(prevForums => prevForums.map(f =>
          f.id === editingForum.id
            ? {
              ...f,
              title: updatedForum.titre_forum,
              cible: updatedForum.cible,
              originalData: updatedForum
            }
            : f
        ));

        toast.success("✅ Forum modifié avec succès !");
      } else {
        // CRÉATION - Utilise l'URL standard
        const newForum = await createForum(token, forumData);

        console.log("✅ Response from Django:", newForum);

        // Vérifiez la réponse
        if (!newForum.id_forum) {
          console.error("❌ Invalid response from server:", newForum);
          toast.error("Réponse invalide du serveur: id_forum manquant");
          throw new Error("Réponse invalide du serveur: id_forum manquant");
        }

        // Formater pour l'affichage
        const formattedForum = {
          id: newForum.id_forum,
          title: newForum.titre_forum,
          threads: newForum.nombre_messages || 0,
          posts: newForum.nombre_likes || 0,
          members: newForum.nombre_likes || 0,
          userHasLiked: newForum.user_has_liked || false,
          cible: newForum.cible,
          utilisateur: newForum.administrateur
            ? "Administrateur"
            : `${newForum.utilisateur_nom || ''} ${newForum.utilisateur_prenom || ''}`.trim(),
          date_creation: newForum.date_creation
            ? new Date(newForum.date_creation).toLocaleDateString("fr-FR", {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
            : new Date().toLocaleDateString("fr-FR"),
          originalData: newForum,
        };

        console.log("✅ Formatted forum for display:", formattedForum);

        setForums(prevForums => [formattedForum, ...prevForums]);
        toast.success("✅ Forum créé avec succès !");
      }

      // Fermer le modal
      setIsModalOpen(false);
      setEditingForum(null);

    } catch (err) {
      console.error("❌ Detailed error:", err);

      // Messages d'erreur plus clairs
      let userMessage = err.message;

      if (err.message.includes("400")) {
        userMessage = "Données invalides. Vérifiez que tous les champs sont correctement remplis.";
      } else if (err.message.includes("403")) {
        userMessage = "Accès interdit. Vous n'avez pas les permissions nécessaires.";
      } else if (err.message.includes("401")) {
        userMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (err.message.includes("500")) {
        userMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      } else if (err.message.includes("NetworkError")) {
        userMessage = "Erreur réseau. Vérifiez votre connexion internet.";
      }

      toast.error(`❌ ${userMessage}`);
    }
  };

  const handleDeleteForum = async () => {
    if (!forumToDelete) return;

    const token = localStorage.getItem("admin_token");

    if (!token) {
      toast.error("Token manquant. Veuillez vous reconnecter.");
      return;
    }

    try {
      await deleteForum(token, forumToDelete.id);

      // Mettre à jour l'état local
      setForums(prevForums => prevForums.filter(f => f.id !== forumToDelete.id));

      // Fermer les modals si nécessaire
      if (selectedForum && selectedForum.id === forumToDelete.id) {
        setIsViewModalOpen(false);
        setSelectedForum(null);
        setForumMessages([]);
      }

      setIsDeleteModalOpen(false);
      setForumToDelete(null);

      toast.success("✅ Forum supprimé avec succès !");

    } catch (err) {
      console.error("❌ Erreur lors de la suppression:", err);
      toast.error(`❌ Erreur: ${err.message}`);
    }
  };

  // =========================
  // HANDLER LIKE FORUM
  // =========================
  const handleLikeForum = async (forumId) => {
    try {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        toast.error("Vous devez être connecté pour aimer un forum");
        return;
      }

      const res = await fetch(`http://localhost:8000/api/forums/${forumId}/like/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();

        // Mettre à jour l'état local
        setForums(prevForums => prevForums.map(forum => {
          if (forum.id === forumId) {
            const newLikeStatus = data.liked !== undefined ? data.liked : !forum.userHasLiked;
            const newLikeCount = data.nombre_likes !== undefined ? data.nombre_likes :
              (newLikeStatus ? (forum.posts || 0) + 1 : Math.max(0, (forum.posts || 0) - 1));

            return {
              ...forum,
              userHasLiked: newLikeStatus,
              posts: newLikeCount,
              originalData: {
                ...forum.originalData,
                user_has_liked: newLikeStatus,
                nombre_likes: newLikeCount
              }
            };
          }
          return forum;
        }));

        // Message de succès
        toast.success(data.liked ? "❤️" : "💔", {
          position: "bottom-right",
          autoClose: 1000,
        });

      } else {
        const errorText = await res.text();
        toast.error(`❌ ${errorText}`);
      }
    } catch (err) {
      console.error("Erreur lors du like:", err);
      toast.error("❌ Erreur réseau");
    }
  };

  // =========================
  // HANDLERS VIEW MODAL
  // =========================
  const handleViewForum = async (forum) => {
    setSelectedForum(forum);

    // ⛔ empêche le rechargement si déjà chargé
    if (forumMessages.length > 0 && selectedForum?.id === forum.id) {
      setIsViewModalOpen(true);
      return;
    }
    console.log("👁️ handleViewForum appelé pour le forum:", forum);

    try {
      setSelectedForum(forum);

      const token = localStorage.getItem("admin_token");
      console.log("🔑 Token:", token ? "Présent" : "Absent");

      // ESSAYEZ CES DEUX URLs (l'une peut être la bonne)
      const url = `http://localhost:8000/api/forums/${forum.id}/messages/`;
      console.log("🌐 Tentative avec URL:", url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Statut de la réponse:", res.status);
      console.log("📡 OK ?:", res.ok);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Erreur du serveur:", errorText);

        // ESSAYEZ L'AUTRE URL
        console.log("🔄 Essai avec une autre URL...");
        const alternativeUrl = `http://localhost:8000/api/forums/${forum.id}/messages`;
        console.log("🌐 Essai avec URL:", alternativeUrl);

        const res2 = await fetch(alternativeUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res2.ok) {
          const messagesData = await res2.json();
          console.log("✅ Messages chargés (alternative):", messagesData.length, "messages");
          setForumMessages(messagesData);
          setIsViewModalOpen(true);
        } else {
          const errorText2 = await res2.text();
          console.error("❌ Deuxième erreur:", errorText2);
          toast.error("Impossible de charger les messages");
        }
      } else {
        const messagesData = await res.json();
        console.log("✅ Messages chargés:", messagesData.length, "messages");
        setForumMessages(messagesData);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      console.error("❌ Erreur:", err);
      console.error("❌ Stack:", err.stack);
      toast.error("Erreur lors du chargement du forum");
    }
  };

  // =========================
  // HANDLERS MESSAGES
  // =========================
  const handlePostMessage = useCallback(async (messageContent) => {
    if (!selectedForum) {
      toast.error("❌ Aucun forum sélectionné !");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.warning("⚠️ Vous devez être connecté !");
        return;
      }

      const url = `http://localhost:8000/api/forums/${selectedForum.id}/messages/create/`;

      const payload = {
        contenu_message: messageContent.trim(),
        forum_id: selectedForum.id,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();

      if (!res.ok) {
        let errorMessage = `Erreur ${res.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.detail || errorData.message || responseText;
        } catch {
          errorMessage = responseText || "Erreur inconnue";
        }

        toast.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }

      let newMessage;
      try {
        newMessage = JSON.parse(responseText);
      } catch {
        toast.error("❌ Réponse invalide du serveur");
        throw new Error("Réponse invalide du serveur");
      }

      const enrichedMessage = {
        ...newMessage,
        id_message: newMessage.id_message || newMessage.id,
        contenu_message: newMessage.contenu_message || messageContent,
        utilisateur_nom: newMessage.utilisateur_nom || "Administrateur",
        utilisateur_prenom: newMessage.utilisateur_prenom || "",
        date_publication: newMessage.date_publication || new Date().toISOString(),
        nombre_likes: newMessage.nombre_likes || 0,
        user_has_liked: newMessage.user_has_liked || false,
        commentaires: newMessage.commentaires || [],
      };

      setForumMessages(prev => [enrichedMessage, ...prev]);

      setForums(prevForums => prevForums.map(f =>
        f.id === selectedForum.id
          ? { ...f, threads: (f.threads || 0) + 1 }
          : f
      ));

      toast.success("✅ Message envoyé avec succès !");
      return enrichedMessage;

    } catch (err) {
      if (err.message.includes("403")) {
        toast.error("❌ Accès interdit. Vérifiez vos permissions.");
      } else if (err.message.includes("404")) {
        toast.error("❌ Endpoint non trouvé. Vérifiez l'URL de l'API.");
      } else if (err.message.includes("500")) {
        toast.error("❌ Erreur serveur. Vérifiez les logs Django.");
      } else {
        toast.error(`❌ Erreur: ${err.message}`);
      }

      throw err;
    }
  }, [selectedForum]);

  const handlePostComment = useCallback(async (messageId, commentContent) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`http://localhost:8000/api/messages/${messageId}/comments/create/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contenu_comm: commentContent })
      });

      if (res.ok) {
        const newComment = await res.json();
        setForumMessages(prevMessages => prevMessages.map(msg =>
          msg.id_message === messageId
            ? {
              ...msg,
              commentaires: [...(msg.commentaires || []), newComment]
            }
            : msg
        ));
        toast.success("✅");
      } else {
        const errorText = await res.text();
        toast.error(`❌ ${errorText}`);
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("❌ Erreur");
    }
  }, []);

  const handleLikeMessage = useCallback(async (messageId) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`http://localhost:8000/api/messages/${messageId}/like/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setForumMessages(prevMessages => prevMessages.map(msg =>
          msg.id_message === messageId
            ? {
              ...msg,
              user_has_liked: !msg.user_has_liked,
              nombre_likes: msg.user_has_liked
                ? (msg.nombre_likes || 0) - 1
                : (msg.nombre_likes || 0) + 1
            }
            : msg
        ));
      } else {
        toast.error("❌");
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("❌");
    }
  }, []);

  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`http://localhost:8000/api/messages/${messageId}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setForumMessages(prevMessages => prevMessages.filter(msg => msg.id_message !== messageId));
        if (selectedForum) {
          setForums(prevForums => prevForums.map(f =>
            f.id === selectedForum.id
              ? { ...f, threads: Math.max(0, f.threads - 1) }
              : f
          ));
        }
        toast.success("✅");
      } else {
        const errorText = await res.text();
        toast.error(`❌ ${errorText}`);
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("❌");
    }
  }, [selectedForum]);

  const handleDeleteComment = useCallback(async (commentId, messageId) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`http://localhost:8000/api/comments/${commentId}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setForumMessages(prevMessages => prevMessages.map(msg =>
          msg.id_message === messageId
            ? {
              ...msg,
              commentaires: msg.commentaires?.filter(comment =>
                comment.id_commentaire !== commentId
              ) || []
            }
            : msg
        ));
        toast.success("✅");
      } else {
        const errorText = await res.text();
        toast.error(`❌ ${errorText}`);
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("❌");
    }
  }, []);

  // =========================
  // CALCULS MÉMORISÉS
  // =========================
  const stats = useMemo(() => [
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
  ], [forums]);

  const filterTabs = useMemo(() => [
    { id: "all", label: "Tous les forums" },
    { id: "etudiants", label: "Pour étudiants" },
    { id: "enseignants", label: "Pour enseignants" },
  ], []);

  const filteredForums = useMemo(() => {
    return forums.filter(forum => {
      const matchesSearch = forum.title.toLowerCase().includes(search.toLowerCase()) ||
        (forum.originalData?.contenu_forum || "").toLowerCase().includes(search.toLowerCase());

      const matchesFilter = activeFilter === "all" || forum.cible === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [forums, search, activeFilter]);

  // =========================
  // RENDER
  // =========================
   return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      {/* Main Content */}
      <main className={`
        flex-1 p-4 sm:p-6 pt-6 sm:pt-10 space-y-5 transition-all duration-300 overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
        
       {/* Header */}
<div className="flex flex-row justify-between items-center gap-4 mb-6">
  <div className="flex-1">
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-muted">
      {t("ForumManagement.forumM") || "Gestion des Forums"}
    </h1>
    <p className="text-gray text-sm sm:text-base">
      {t("ForumManagement.Managediscussion") || "Gérez et modérez les forums de discussion"}
    </p>
  </div>

  <div className="flex items-center gap-3">
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


        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition flex justify-between items-center bg-gradient-to-br ${stat.bg} min-w-0`}
            >
              <div className="min-w-0">
                <p className="text-gray text-sm sm:text-base truncate">{stat.title}</p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-muted truncate">
                  {stat.value}
                </h2>
              </div>
              <div className="opacity-80 flex-shrink-0 ml-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                  {React.cloneElement(stat.icon, {
                    size: isMobile ? 24 : 40
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* GRID: FORUMS ONLY */}
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg sm:text-xl font-semibold text-muted mb-4">Forums de discussion</h2>

          {/* TABS - Version mobile améliorée */}
         <div className="flex overflow-x-auto gap-1 sm:gap-2 mb-3 sm:mb-4 pb-1 sm:pb-2 -mx-4 sm:mx-0 px-2 sm:px-3 ">

           <div className="flex gap-1 sm:gap-2 bg-grad-1 p-1 sm:p-2 rounded-full min-w-max">

              {filterTabs.map((tab) => (
               <button
  key={tab.id}
  onClick={() => setActiveFilter(tab.id)}
  className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full
    transition-all duration-300
    text-[10px] sm:text-xs
px-2 py-0.5

    font-semibold whitespace-nowrap
    ${activeFilter === tab.id
      ? "bg-primary shadow-sm"
      : "text-primary/70"
    }`}
>

                  {tab.label} {tab.id !== "all" && `(${forums.filter(f => f.cible === tab.id).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* BARRE DE RECHERCHE ET BOUTON CRÉER */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <div className="relative flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un forum..."
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-surface border border-gray-800/20 rounded-xl text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
            </div>

            <Button
              text={
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Plus size={16} className="sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">{t("ForumManagement.createF") || "Créer un forum"}</span>
                </span>
              }
              variant="primary"
              className="!w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow whitespace-nowrap"
              onClick={() => {
                setEditingForum(null);
                setIsModalOpen(true);
              }}
            />
          </div>

          {/* États de chargement/erreur */}
          {loading && (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary mb-3 sm:mb-4"></div>
              <p className="text-gray text-sm sm:text-base">Chargement des forums...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 sm:p-6 text-center mb-6">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-red-500 mb-3 text-sm sm:text-base">{error}</p>
              <Button
                variant="secondary"
                onClick={fetchForums}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base"
              >
                Réessayer
              </Button>
            </div>
          )}

          {/* Liste des forums - VERSION MOBILE CORRIGÉE */}
          {!loading && !error && (
            <div className="space-y-4 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-4">
              {filteredForums.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-muted mb-2 px-4">
                    Aucun forum trouvé
                  </h3>
                  <p className="text-gray mb-4 sm:mb-6 px-4 mx-auto text-sm sm:text-base max-w-md">
                    {search ? "Aucun forum ne correspond à votre recherche." : "Commencez par créer votre premier forum."}
                  </p>
                  {!search && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditingForum(null);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                    >
                      <Plus size={16} className="mr-1.5 sm:mr-2" />
                      Créer un forum
                    </Button>
                  )}
                </div>
              ) : (
                filteredForums.map((forum) => (
                  <div
                    key={forum.id}
                    className="bg-grad-5 rounded-2xl p-4 sm:p-5 border border-gray-800/20 hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* MOBILE LAYOUT */}
                    <div className="sm:hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${forum.cible === "etudiants"
                            ? "bg-grad-4"
                            : "bg-grad-2"
                            }`}>
                            {forum.cible === "etudiants" ? (
                              <GraduationCap className="w-5 h-5 text-white" />
                            ) : (
                              <Users className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1">
                              <h3 className="text-base font-semibold text-muted truncate">
                                {forum.title}
                              </h3>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full mt-1 ${forum.cible === "etudiants"
                              ? "bg-muted/20 text-muted"
                              : "bg-pink/20 text-pink"
                              }`}>
                              {forum.cible === "etudiants" ? "Étudiants" : "Enseignants"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description mobile */}
                      <p className="text-gray text-sm mb-3 line-clamp-2">
                        {forum.originalData?.contenu_forum || "Pas de description"}
                      </p>

                      {/* Stats mobile compact */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray">
                          <MessageSquare size={14} />
                          <span>{forum.threads} discussions</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray">
                          <TrendingUp size={14} />
                          <span>{forum.posts} likes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray truncate">
                          <User size={14} />
                          <span className="truncate">Créé par {forum.utilisateur.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray">
                          <Clock size={14} />
                          <span>{forum.date_creation}</span>
                        </div>
                      </div>

                      {/* Actions mobile */}
                      <div className="flex gap-2 pt-3 border-t border-gray-800/20">
                        <Button
                          variant="manage"
                          onClick={() => handleViewForum(forum)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs"
                        >
                          <Eye size={14} />
                          Voir
                        </Button>
                        <Button
                          variant="manage"
                          onClick={() => {
                            setEditingForum(forum);
                            setIsModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs"
                        >
                          <Edit2 size={14} />
                          Modifier
                        </Button>
                        <Button
                          variant="manage"
                          onClick={() => handleLikeForum(forum.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs ${forum.userHasLiked
                            ? "bg-red-500/10 text-red-500"
                            : ""
                            }`}
                        >
                          <Heart size={14} fill={forum.userHasLiked ? "currentColor" : "none"} />
                          <span>{forum.posts || 0}</span>
                        </Button>
                        <Button
                          variant="manage"
                          onClick={() => {
                            setForumToDelete(forum);
                            setIsDeleteModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs bg-red-500/10 text-red-500"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* DESKTOP LAYOUT */}
                    <div className="hidden sm:flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-5">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${forum.cible === "etudiants"
                          ? "bg-grad-4"
                          : "bg-grad-2"
                          }`}>
                          {forum.cible === "etudiants" ? (
                            <GraduationCap className="w-6 h-6 text-white" />
                          ) : (
                            <Users className="w-6 h-6 text-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-muted truncate">
                              {forum.title}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${forum.cible === "etudiants"
                              ? "bg-muted/20 text-muted"
                              : "bg-pink/20 text-pink"
                              }`}>
                              {forum.cible === "etudiants" ? "Pour étudiants" : "Pour enseignants"}
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

                      <div className="flex lg:flex-col gap-2 lg:border-l lg:pl-5 border-gray-800/20">
                        <Button
                          variant="manage"
                          onClick={() => handleViewForum(forum)}
                          className="flex items-center gap-2 px-3 py-2"
                        >
                          <Eye size={16} />
                          Voir
                        </Button>
                        <Button
                          variant="manage"
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
                          variant="manage"
                          onClick={() => handleLikeForum(forum.id)}
                          className={`flex items-center gap-2 px-3 py-2 ${forum.userHasLiked
                            ? "bg-red-500/10 text-red-500"
                            : ""
                            }`}
                        >
                          <Heart size={16} fill={forum.userHasLiked ? "currentColor" : "none"} />
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${forum.userHasLiked
                            ? "bg-red-500/20"
                            : "bg-primary/20"
                            }`}>
                            {forum.posts || 0}
                          </span>
                        </Button>
                        <Button
                          variant="manage"
                          onClick={() => {
                            setForumToDelete(forum);
                            setIsDeleteModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500"
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
      </main>

       {/* ========================= */}
      {/* MODALS */}
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
        onPostMessage={handlePostMessage}
        onPostComment={handlePostComment}
        onLikeMessage={handleLikeMessage}
        onDeleteMessage={handleDeleteMessage}
        onDeleteComment={handleDeleteComment}
      />
    </div>
    
  );
}