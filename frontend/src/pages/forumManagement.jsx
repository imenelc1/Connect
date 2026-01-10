import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import Navbar from "../components/common/Navbar";
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
  const { t } = useTranslation("ForumManagement");
  const [newMessage, setNewMessage] = useState("");
  const [newComment, setNewComment] = useState({});
  const [messageDropdown, setMessageDropdown] = useState(null);

  if (!isOpen || !forum) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="
        relative w-full max-w-6xl h-[92vh]
        bg-surface
        rounded-3xl
        shadow-strong
        border border-gray-800/10 dark:border-white/10
        flex flex-col overflow-hidden
        animate-scaleIn
      ">

        {/* ================= HEADER ================= */}
        <div className="
          sticky top-0 z-20
          bg-surface/90 backdrop-blur
          border-b border-gray-800/10 dark:border-white/10
          px-8 py-6
        ">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-muted">
                {forum.title}
              </h2>
              <p className="text-sm text-gray">
                {t("ForumManagement.createdByFirstName", { user: forum.utilisateur })} · {forum.date_creation}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-3 rounded-xl hover:bg-primary/10 transition"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">

          {/* DESCRIPTION */}
          <div className="
            relative bg-card rounded-2xl p-6
            shadow-card
            border border-gray-800/10 dark:border-white/10
          ">
            <div className="absolute inset-x-0 top-0 h-1 bg-grad-1 rounded-t-2xl" />
            <h3 className="text-lg font-semibold text-muted mb-3">
              {t("ForumManagement.forumDescription")}
            </h3>
            <p className="text-gray leading-relaxed">
              {forum.originalData?.contenu_forum || t("ForumManagement.noDescriptionProvided")}
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-stat-softblue-1 rounded-2xl p-5 text-center shadow-card">
              <div className="text-3xl font-bold text-primary">
                {messages.length}
              </div>
              <div className="text-xs uppercase tracking-wide text-gray mt-1">
                {t("ForumManagement.messages")}
              </div>
            </div>

            <div className="bg-stat-pink-1 rounded-2xl p-5 text-center shadow-card">
              <div className="text-3xl font-bold text-pink">
                {messages.reduce((s, m) => s + (m.nombre_likes || 0), 0)}
              </div>
              <div className="text-xs uppercase tracking-wide text-gray mt-1">
                {t("ForumManagement.totalLikes")}
              </div>
            </div>

            <div className="bg-stat-purple-1 rounded-2xl p-5 text-center shadow-card">
              <div className="text-3xl font-bold text-blue">
                {messages.reduce((s, m) => s + (m.commentaires?.length || 0), 0)}
              </div>
              <div className="text-xs uppercase tracking-wide text-gray mt-1">
                {t("ForumManagement.comments")}
              </div>
            </div>
          </div>

          {/* POST MESSAGE */}
          <div className="
            bg-card rounded-2xl p-6
            shadow-card
            border border-gray-800/10 dark:border-white/10
          ">
            <h3 className="text-lg font-semibold text-muted mb-4">
              {t("ForumManagement.postMessage")}
            </h3>

            <textarea
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("ForumManagement.textareaPlaceholder")}
              className="
                w-full rounded-xl p-4
                bg-[rgb(var(--color-input-bg))]
                text-[rgb(var(--color-input-text))]
                border border-[rgb(var(--color-input-border))]
                placeholder:text-[rgb(var(--color-input-placeholder))]
                focus:ring-2 focus:ring-primary/40
                resize-none transition
              "
            />

            <div className="flex justify-end mt-4">
              <div className="inline-flex">
                <Button
                  variant="primary"
                  disabled={!newMessage.trim()}
                  className="px-10 py-2"
                  onClick={async () => {
                    await onPostMessage(newMessage);
                    setNewMessage("");
                  }}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>


          </div>

          {/* MESSAGES */}
          <div className="space-y-6">
            {messages.map(message => (
              <div
                key={message.id_message}
                className="
                  bg-card rounded-2xl p-6
                  shadow-card
                  border border-gray-800/10 dark:border-white/10
                  hover:shadow-strong transition
                "
              >
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="
                      w-11 h-11 rounded-full
                      bg-grad-7
                      flex items-center justify-center
                      text-white font-bold
                    ">
                      {(message.auteur_nom?.[0] || "U").toUpperCase()}
                    </div>

                    <div>
                      <h4 className="font-semibold text-muted">
                        {message.auteur_nom || "Utilisateur"}
                      </h4>
                      <p className="text-xs text-gray mt-0.5">
                        {new Date(message.date_publication).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setMessageDropdown(
                        messageDropdown === message.id_message ? null : message.id_message
                      )
                    }
                    className="p-2 rounded-xl hover:bg-primary/10 transition"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* CONTENT */}
                <p className="mt-5 text-gray leading-relaxed whitespace-pre-line">
                  {message.contenu_message}
                </p>

                {/* ACTIONS */}
                <div className="
                  mt-6 flex gap-6 pt-4
                  border-t border-gray-800/10 dark:border-white/10
                ">
                  <button
                    onClick={() => onLikeMessage(message.id_message)}
                    className={`flex items-center gap-2 text-sm transition
    ${message.likedByUser ? "text-red" : "text-red hover:text-red"}
  `}
                  >
                    <Heart
                      size={16}
                      fill={message.likedByUser ? "currentColor" : "none"} // rempli en rouge quand liked
                    />
                    {message.nombre_likes || 0}
                  </button>



                  <button
                    onClick={() =>
                      setNewComment(prev => ({
                        ...prev,
                        [message.id_message]: prev[message.id_message] || ""
                      }))
                    }
                    className="flex items-center gap-2 text-sm hover:text-primary transition"
                  >
                    <MessageCircle size={16} />
                    {t("ForumManagement.reply")}
                  </button>
                </div>

                {/* COMMENT FORM */}
                {newComment[message.id_message] !== undefined && (
                  <div className="mt-5 ml-8 pl-6 border-l border-primary/30">
                    <input
                      value={newComment[message.id_message]}
                      onChange={(e) =>
                        setNewComment(prev => ({
                          ...prev,
                          [message.id_message]: e.target.value
                        }))
                      }
                      placeholder={t("ForumManagement.replyTextareaPlaceholder")}
                      className="
                        w-full rounded-xl px-4 py-3
                        bg-[rgb(var(--color-input-bg))]
                        text-[rgb(var(--color-input-text))]
                        border border-[rgb(var(--color-input-border))]
                        focus:ring-2 focus:ring-primary/40
                        transition
                      "
                    />

                    <div className="flex justify-end mt-4">
                      <div className="inline-flex">
                        <Button
                          size="sm"
                          disabled={!newComment[message.id_message]?.trim()}
                          className="px-10 py-2"
                          onClick={() =>
                            onPostComment(message.id_message, newComment[message.id_message])
                          }
                        >
                          <Send size={14} />
                        </Button>
                      </div>
                    </div>

                  </div>
                )}

                {/* COMMENTS */}
                {message.commentaires?.length > 0 && (
                  <div className="mt-5 space-y-3 ml-8">
                    {message.commentaires.map(comment => (
                      <div
                        key={comment.id_commentaire}
                        className="
                          bg-primary/5
                          dark:bg-white/5
                          rounded-xl p-4 text-sm
                        "
                      >
                        <span className="font-medium text-muted">
                          {comment.utilisateur_nom}
                        </span>
                        <p className="text-gray mt-1">
                          {comment.contenu_comm}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="
          sticky bottom-0
          bg-surface/90 backdrop-blur
          border-t border-gray-800/10 dark:border-white/10
          px-8 py-4 flex justify-end
        ">
          <Button variant="secondary" onClick={onClose}>
            {t("ForumManagement.close")}
          </Button>
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
      setError(err.message || t("ForumManagement.unknownError"));
      toast.error(err.message || t("ForumManagement.genericError"));
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
              {t("ForumManagement.forumTitle")}
            </label>
            <Input
              type="text"
              required
              value={formData.titre_forum}
              onChange={(e) =>
                setFormData({ ...formData, titre_forum: e.target.value })
              }
              className="w-full p-3 border border-gray-800/20 rounded-lg bg-surface text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t("ForumManagement.forumTitlePlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray mb-2">
              {t("ForumManagement.description")}
            </label>
            <textarea
              required
              value={formData.contenu_forum}
              onChange={(e) =>
                setFormData({ ...formData, contenu_forum: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-surface text-muted min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t("ForumManagement.descriptionPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray mb-2">
              {t("ForumManagement.targetAudience")}
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
                <span className="font-medium">{t("ForumManagement.forStudents")}</span>
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
                <span className="font-medium">{t("ForumManagement.forTeachers")}</span>
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
              {t("ForumManagement.cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="px-6"
            >
              {loading ? t("ForumManagement.loading") : editingForum ? t("ForumManagement.edit") : t("ForumManagement.create")}
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
  const { t } = useTranslation("ForumManagement");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-md border border-gray-800/20">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>

          <h3 className="text-xl font-bold text-muted mb-2">
            {t("ForumManagement.deleteForumTitle")}
          </h3>

          <p className="text-gray mb-6">
            {t("ForumManagement.deleteForumMessage", { title: forumTitle })}
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={onClose}
              className="px-6"
            >
              {t("ForumManagement.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={onConfirm}
              className="px-6 bg-red-500 hover:bg-red-600"
            >
              {t("ForumManagement.delete")}
            </Button>
          </div>
        </div>
      </div>
    </div >
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
        toast.error(t("ForumManagement.adminNotAuthenticated"));
        throw new Error(t("ForumManagement.adminNotAuthenticated"));
      }

      const res = await fetch("http://localhost:8000/api/forums/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        toast.error(text || t("ForumManagement.serverError"));
        throw new Error(text || t("ForumManagement.serverError"));
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
      setError(t("ForumManagement.cannotLoadForums"));
      toast.error(t("ForumManagement.cannotLoadForums"));
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
      toast.error(t("ForumManagement.missingToken"));
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

        toast.success(`✅ ${t("ForumManagement.forumUpdatedSuccess")}`);

      } else {
        // CRÉATION - Utilise l'URL standard
        const newForum = await createForum(token, forumData);

        console.log("✅ Response from Django:", newForum);

        // Vérifiez la réponse
        if (!newForum.id_forum) {
          console.error("❌ Invalid response from server:", newForum);

          const errorMsg = t("ForumManagement.invalidServerResponseMissingForumId");

          toast.error(errorMsg);
          throw new Error(errorMsg);
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
            ? t("ForumManagement.administrator")
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
        toast.success(`✅ ${t("ForumManagement.forumCreatedSuccess")}`);
      }

      // Fermer le modal
      setIsModalOpen(false);
      setEditingForum(null);

    } catch (err) {
      console.error("❌ Detailed error:", err);

      // Messages d'erreur plus clairs
      let userMessage = err.message;

      if (err.message.includes("400")) {
        userMessage = t("ForumManagement.errors.invalidData");
      } else if (err.message.includes("403")) {
        userMessage = t("ForumManagement.errors.forbidden");
      } else if (err.message.includes("401")) {
        userMessage = t("ForumManagement.errors.unauthorized");
      } else if (err.message.includes("500")) {
        userMessage = t("ForumManagement.errors.serverError");
      } else if (err.message.includes("NetworkError")) {
        userMessage = t("ForumManagement.errors.networkError");
      }

      toast.error(`❌ ${userMessage}`);
    }
  };

  const handleDeleteForum = async () => {
    if (!forumToDelete) return;

    const token = localStorage.getItem("admin_token");

    if (!token) {
      toast.error(t("ForumManagement.missingToken"));
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

      toast.success(`✅ ${t("ForumManagement.forumDeletedSuccess")}`);

    } catch (err) {
      console.error("❌ Erreur lors de la suppression:", err);
      toast.error(`❌ ${t("ForumManagement.deleteForumError")}: ${err.message}`);
    }
  };

  // =========================
  // HANDLER LIKE FORUM
  // =========================
  const handleLikeForum = async (forumId) => {
    try {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        toast.error(t("ForumManagement.likeAuthRequired"));
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
      toast.error(`❌ ${t("ForumManagement.networkError")}`);
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
          toast.error(t("ForumManagement.cannotLoadMessages"));
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
      toast.error(t("ForumManagement.forumLoadError"));       // traduit
    }
  };

  // =========================
  // HANDLERS MESSAGES
  // =========================
  const handlePostMessage = useCallback(async (messageContent) => {
    if (!selectedForum) {
      toast.error(`❌ ${t("ForumManagement.noForumSelected")}`);

      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.warning(`⚠️ ${t("ForumManagement.mustBeLoggedIn")}`);
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
          errorMessage = responseText || t("ForumManagement.unknownError");
        }

        toast.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }

      let newMessage;
      try {
        newMessage = JSON.parse(responseText);
      } catch {
        const errorMsg = t("invalidServerResponse");
        toast.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }


      const enrichedMessage = {
        ...newMessage,
        id_message: newMessage.id_message || newMessage.id,
        contenu_message: newMessage.contenu_message || messageContent,
        utilisateur_nom: newMessage.utilisateur_nom || t("ForumManagement.administrator"),
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
        toast.error(`❌ ${t("ForumManagement.forbidden")}`);
      } else if (err.message.includes("404")) {
        toast.error(`❌ ${t("ForumManagement.endpointNotFound")}`);
      } else if (err.message.includes("500")) {
        toast.error(`❌ ${t("ForumManagement.serverErrorDjango")}`);
      } else {
        toast.error(`❌ ${t("ForumManagement.error")}: ${err.message}`);
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
      toast.error(`❌ ${t("ForumManagement.error")}`);
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
      title: t("ForumManagement.totalForums"),
      value: forums.length,
      icon: <MessageSquare className="text-primary" size={40} />,
      bg: "bg-grad-5"
    },
    {
      title: t("ForumManagement.forStudents"),
      value: forums.filter(f => f.cible === "etudiants").length,
      icon: <GraduationCap className="text-purple dark:text-supp" size={40} />,
      bg: "bg-grad-4"
    },
    {
      title: t("ForumManagement.forTeachers"),
      value: forums.filter(f => f.cible === "enseignants").length,
      icon: <Users className="text-pink" size={40} />,
      bg: "bg-grad-2"
    },
    {
      title: t("ForumManagement.totalMessages"),
      value: forums.reduce((sum, f) => sum + f.threads, 0),
      icon: <TrendingUp className="text-primary" size={40} />,
      bg: "bg-grad-3"
    },
  ], [forums, t]);


  const filterTabs = useMemo(() => [
    { id: "all", label: t("ForumManagement.filterAll") },
    { id: "etudiants", label: t("ForumManagement.filterStudents") },
    { id: "enseignants", label: t("ForumManagement.filterTeachers") },
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
          <h2 className="text-lg sm:text-xl font-semibold text-muted mb-4">{t("ForumManagement.discussionForums")}</h2>

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
                      ? "bg-primary text-white shadow-sm"
                      : "text-grayc dark:text-primary/70"
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
                  placeholder={t("ForumManagement.searchF")}
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
              <p className="text-gray text-sm sm:text-base">{t("ForumManagement.loadingForums")}</p>
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
                {t("ForumManagement.retry")}
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
                    {t("ForumManagement.noForumFound")}
                  </h3>
                  <p className="text-gray mb-4 sm:mb-6 px-4 mx-auto text-sm sm:text-base max-w-md">
                    {search ? t("ForumManagement.noForumMatchSearch") : t("ForumManagement.createFirstForum")}
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
                      {t("ForumManagement.createF")}
                    </Button>
                  )}
                </div>
              ) : (
                filteredForums.map((forum) => (
                  <div
                    key={forum.id}
                    className="bg-grad-2 rounded-2xl p-4 sm:p-5 border border-gray-800/20 hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden"
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
                              {forum.cible === "etudiants" ? t("ForumManagement.students") : t("ForumManagement.teachers")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description mobile */}
                      <p className="text-gray text-sm mb-3 line-clamp-2">
                        {forum.originalData?.contenu_forum || t("ForumManagement.noDescription")}
                      </p>

                      {/* Stats mobile compact */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray">
                          <MessageSquare size={14} className="text-grayc" />
                          <span>{forum.threads} {t("ForumManagement.discussion")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray">
                          <TrendingUp size={14} className="text-grayc" />
                          <span>{forum.posts}{t("ForumManagement.likee")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray truncate">
                          <User size={14} className="text-grayc" />
                          <span className="truncate"> {t("ForumManagement.createdBy")} {forum.utilisateur.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray">
                          <Clock size={14} className="text-grayc" />
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
                          {t("ForumManagement.view")}
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
                          {t("ForumManagement.edit")}
                        </Button>
                        <Button
                          variant="manage"
                          onClick={() => handleLikeForum(forum.id)}
                          className={`flex items-center gap-2 px-3 py-2 ${forum.userHasLiked
                            ? "bg-red-500/10 text-red-500"
                            : "text-gray"
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
                            <GraduationCap className="w-6 h-6 text-purple" />
                          ) : (
                            <Users className="w-6 h-6 text-pink" />
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
                              {forum.cible === "etudiants" ? t("ForumManagement.forStudents") : t("ForumManagement.forTeachers")}
                            </span>
                          </div>

                          <p className="text-gray text-sm mb-3 line-clamp-2">
                            {forum.originalData?.contenu_forum || t("ForumManagement.noDescription")}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray">
                            <span className="flex items-center gap-1">
                              <MessageSquare size={14} />
                              {forum.threads} {t("ForumManagement.discussion")}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp size={14} />
                              {forum.posts} {t("ForumManagement.likee")}
                            </span>
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {t("ForumManagement.createdBy")}  {forum.utilisateur}
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
                          {t("ForumManagement.view")}
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
                          {t("ForumManagement.edit")}
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
                          {t("ForumManagement.delete")}
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