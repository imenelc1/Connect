import { FiSend } from "react-icons/fi";
import Input from "../components/common/Input";
import Navbar from "../components/common/Navbar";
import UserCircle from "../components/common/UserCircle";
import { useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import ThemeContext from "../context/ThemeContext";
import Tabs from "../components/common/Tabs";
import Button from "../components/common/Button";
import ModernDropdown from "../components/common/ModernDropdown";
import { Loader, Heart, Trash2, Send, ChevronDown, ChevronUp, MessageSquare, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

// Fonction utilitaire pour déterminer la cible
const getCibleFromForumType = (forumType) => {
  const mapping = {
    "teacher-teacher": "enseignants",
    "teacher-student": "etudiants",
    "student-student": "etudiants", 
    "student-teacher": "enseignants"
  };
  return mapping[forumType] || "etudiants";
};

// Fonction utilitaire pour la validation
const validateForumData = (title, content) => {
  const errors = [];
  
  if (!title.trim()) {
    errors.push("Le titre est requis");
  } else if (title.length > 200) {
    errors.push("Le titre ne doit pas dépasser 200 caractères");
  }
  
  if (!content.trim()) {
    errors.push("Le message est requis");
  } else if (content.length > 2000) {
    errors.push("Le message ne doit pas dépasser 2000 caractères");
  }
  
  return errors;
};

// Fonction utilitaire pour les messages de confirmation
const getConfirmationMessage = (role, forumType) => {
  const messages = {
    "enseignant": {
      "teacher-student": "Ce forum sera visible et répondable uniquement par les étudiants. Les enseignants ne pourront pas y participer. Continuer ?",
      "teacher-teacher": "Ce forum sera réservé aux enseignants seulement. Les étudiants n'y auront pas accès. Continuer ?"
    },
    "etudiant": {
      "student-teacher": "Ce forum sera visible et répondable uniquement par les enseignants. Les autres étudiants ne pourront pas y participer. Continuer ?",
      "student-student": "Ce forum sera réservé aux étudiants seulement. Les enseignants n'y auront pas accès. Continuer ?"
    }
  };
  
  return messages[role]?.[forumType] || "";
};

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [error, setError] = useState("");
  const [deletingForumId, setDeletingForumId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [expandedForums, setExpandedForums] = useState({});
  const [messages, setMessages] = useState({});
  const [newMessages, setNewMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState({});
  const [postingMessage, setPostingMessage] = useState({});
  const [likingMessageId, setLikingMessageId] = useState(null);
  
  // États pour les commentaires et le formulaire
  const [newComments, setNewComments] = useState({});
  const [postingComment, setPostingComment] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  
  const navigate = useNavigate();
  const { t } = useTranslation("community");
  const { fetchUnreadCount } = useNotifications();
  
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  const role = userData?.role;
  const userId = userData?.user_id;
  
  const messagesEndRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [forumTypeToCreate, setForumTypeToCreate] = useState("");
  
  // États pour la responsivité
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:8000/api" 
    : "/api";

  // Définir le type de forum par défaut selon le rôle
  useEffect(() => {
    if (role === "enseignant") {
      setForumTypeToCreate("teacher-student");
    } else if (role === "etudiant") {
      setForumTypeToCreate("student-teacher");
    }
  }, [role]);

  // Effet pour la responsivité
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

  useEffect(() => {
    if (!userData || !token) {
      navigate("/login");
    }
  }, [userData, token, navigate]);

  const initials = useMemo(() => 
    `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase(),
    [userData?.nom, userData?.prenom]
  );

  const { toggleDarkMode } = useContext(ThemeContext);

  const forumOptions = useMemo(() => [
    { value: "all", label: t("forums.all") || "Tous les forums" },
    { value: "teacher-teacher", label: t("forums.teacher-teacher") || "Enseignants ↔ Enseignants" },
    { value: "teacher-student", label: t("forums.teacher-student") || "Enseignant → Étudiant" },
    { value: "student-student", label: t("forums.student-student") || "Étudiants ↔ Étudiants" },
    { value: "student-teacher", label: t("forums.student-teacher") || "Étudiant → Enseignant" }
  ].filter(opt => {
    if (role === "enseignant") {
      return opt.value !== "student-student" && opt.value !== "student-teacher";
    } else {
      return opt.value !== "teacher-teacher" && opt.value !== "teacher-student";
    }
  }), [role, t]);

  const [forumType, setForumType] = useState("all");

  // Fonction pour déclencher une notification
  const triggerNotificationEvent = useCallback(() => {
    window.dispatchEvent(new CustomEvent('new-notification'));
    if (fetchUnreadCount) {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

  // Fonction pour vérifier les likes de tous les forums
  const checkAllForumLikes = useCallback(async (forums) => {
    if (!token) return forums;
    
    const forumsWithLikes = await Promise.all(
      forums.map(async (forum) => {
        try {
          const response = await fetch(`${API_URL}/forums/${forum.id}/check-like/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            return {
              ...forum,
              userHasLiked: data.user_has_liked || false,
              likes: data.likes_count || forum.likes
            };
          }
        } catch (error) {
          console.error(`Erreur vérification like forum ${forum.id}:`, error);
        }
        return forum;
      })
    );
    
    return forumsWithLikes;
  }, [token, API_URL]);

  // Charger les messages initiaux pour chaque forum
  useEffect(() => {
    const loadInitialMessages = async () => {
      if (!token || posts.length === 0) return;
      
      for (const post of posts) {
        if (!messages[post.id] && post.id) {
          await loadForumMessages(post.id);
        }
      }
    };
    
    if (posts.length > 0) {
      loadInitialMessages();
    }
  }, [posts, token, messages]);

  // ========== FONCTIONS POUR LES COMMENTAIRES ==========
  
  const toggleMessageComments = useCallback((messageId) => {
    setExpandedComments(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  }, []);

  const handlePostComment = useCallback(async (messageId, forumId) => {
    const commentContent = newComments[messageId]?.trim();
    
    if (!commentContent || !token) {
      return;
    }
    
    setPostingComment(prev => ({ ...prev, [messageId]: true }));
    
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}/comments/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contenu_comm: commentContent
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }
      
      const newComment = await response.json();
      
      setMessages(prev => {
        const forumMessages = prev[forumId] || [];
        const updatedMessages = forumMessages.map(msg => {
          if (msg.id_message === messageId) {
            const updatedCommentaires = [...(msg.commentaires || []), newComment];
            return {
              ...msg,
              commentaires: updatedCommentaires,
              nombre_commentaires: updatedCommentaires.length
            };
          }
          return msg;
        });
        return { ...prev, [forumId]: updatedMessages };
      });
      
      setNewComments(prev => ({ ...prev, [messageId]: "" }));
      setExpandedComments(prev => ({ ...prev, [messageId]: true }));
      
      triggerNotificationEvent();
      
    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire:", error);
      setError(`Erreur lors de l'envoi du commentaire: ${error.message}`);
    } finally {
      setPostingComment(prev => ({ ...prev, [messageId]: false }));
    }
  }, [token, API_URL, newComments, triggerNotificationEvent]);

  const handleDeleteComment = useCallback(async (commentId, messageId, forumId) => {
    if (!token) {
      return;
    }
    
    setDeletingCommentId(commentId);
    
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setMessages(prev => {
          const forumMessages = prev[forumId] || [];
          const updatedMessages = forumMessages.map(msg => {
            if (msg.id_message === messageId && msg.commentaires) {
              const updatedCommentaires = msg.commentaires.filter(c => c.id_commentaire !== commentId);
              return {
                ...msg,
                commentaires: updatedCommentaires,
                nombre_commentaires: updatedCommentaires.length
              };
            }
            return msg;
          });
          return { ...prev, [forumId]: updatedMessages };
        });
        
        setPosts(prev => prev.map(post => {
          if (post.id === forumId) {
            return {
              ...post,
              commentsCount: Math.max(0, (post.commentsCount || 0) - 1)
            };
          }
          return post;
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erreur lors de la suppression:", errorData.error || `Erreur ${response.status}`);
        setError(`Erreur lors de la suppression du commentaire: ${errorData.error || `Erreur ${response.status}`}`);
      }
    } catch (error) {
      console.error("Erreur réseau lors de la suppression:", error);
      setError("Erreur réseau lors de la suppression du commentaire");
    } finally {
      setDeletingCommentId(null);
      setShowDeleteCommentConfirm(null);
    }
  }, [token, API_URL]);

  const handleLikeMessage = useCallback(async (messageId, forumId) => {
    if (!token) {
      return;
    }

    setLikingMessageId(messageId);

    const currentMessages = messages[forumId] || [];
    const message = currentMessages.find(m => m.id_message === messageId);
    
    if (!message) {
      setLikingMessageId(null);
      return;
    }

    const newLikedState = !message.user_has_liked;
    const newLikesCount = newLikedState ? (message.nombre_likes || 0) + 1 : Math.max(0, (message.nombre_likes || 0) - 1);
    
    // Mise à jour optimiste
    setMessages(prev => {
      const forumMessages = prev[forumId] || [];
      const updatedMessages = forumMessages.map(msg => 
        msg.id_message === messageId
          ? { 
              ...msg, 
              nombre_likes: newLikesCount, 
              user_has_liked: newLikedState 
            }
          : msg
      );
      return { ...prev, [forumId]: updatedMessages };
    });

    try {
      const response = await fetch(`${API_URL}/messages/${messageId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Revert en cas d'erreur
        setMessages(prev => {
          const forumMessages = prev[forumId] || [];
          const updatedMessages = forumMessages.map(msg => 
            msg.id_message === messageId
              ? { 
                  ...msg, 
                  nombre_likes: message.nombre_likes || 0, 
                  user_has_liked: message.user_has_liked || false 
                }
              : msg
          );
          return { ...prev, [forumId]: updatedMessages };
        });
        
        console.error("Erreur lors du like:", errorData.error || `Erreur ${response.status}`);
        setError(`Erreur lors du like: ${errorData.error || `Erreur ${response.status}`}`);
      } else {
        const data = await response.json();
        // Mise à jour avec la réponse du serveur
        setMessages(prev => {
          const forumMessages = prev[forumId] || [];
          const updatedMessages = forumMessages.map(msg => 
            msg.id_message === messageId
              ? { 
                  ...msg, 
                  nombre_likes: data.likes_count || newLikesCount, 
                  user_has_liked: data.user_has_liked || newLikedState 
                }
              : msg
          );
          return { ...prev, [forumId]: updatedMessages };
        });

        triggerNotificationEvent();
      }
    } catch (error) {
      // Revert en cas d'erreur réseau
      setMessages(prev => {
        const forumMessages = prev[forumId] || [];
        const updatedMessages = forumMessages.map(msg => 
          msg.id_message === messageId
            ? { 
                ...msg, 
                nombre_likes: message.nombre_likes || 0, 
                user_has_liked: message.user_has_liked || false 
              }
            : msg
        );
        return { ...prev, [forumId]: updatedMessages };
      });
      
      console.error("Erreur réseau lors du like:", error);
      setError("Erreur réseau lors du like");
    } finally {
      setLikingMessageId(null);
    }
  }, [token, API_URL, messages, triggerNotificationEvent]);

  const loadForumMessages = useCallback(async (forumId) => {
    if (!token || !forumId) return;
    
    setLoadingMessages(prev => ({ ...prev, [forumId]: true }));
    
    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/messages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const messagesData = await response.json();
      const messagesWithComments = messagesData.map(msg => ({
        ...msg,
        commentaires: msg.commentaires || [],
        nombre_commentaires: msg.nombre_commentaires || (msg.commentaires?.length || 0)
      }));
      
      setMessages(prev => ({ ...prev, [forumId]: messagesWithComments }));
      
      setPosts(prev => prev.map(post => 
        post.id === forumId 
          ? { ...post, commentsCount: messagesData.length }
          : post
      ));
      
    } catch (error) {
      console.error(`Erreur chargement messages forum ${forumId}:`, error);
      setMessages(prev => ({ ...prev, [forumId]: [] }));
      setError(`Erreur chargement messages: ${error.message}`);
    } finally {
      setLoadingMessages(prev => ({ ...prev, [forumId]: false }));
    }
  }, [token, API_URL]);

  const toggleForumMessages = useCallback(async (forumId) => {
    const isExpanded = expandedForums[forumId];
    
    if (!isExpanded && !messages[forumId]) {
      await loadForumMessages(forumId);
    }
    
    setExpandedForums(prev => ({
      ...prev,
      [forumId]: !isExpanded
    }));
  }, [expandedForums, messages, loadForumMessages]);

  const handlePostMessage = useCallback(async (forumId) => {
    const messageContent = newMessages[forumId]?.trim();
    
    if (!messageContent || !token) {
      setError("Veuillez écrire un message");
      return;
    }

    if (messageContent.length > 2000) {
      setError("Le message ne doit pas dépasser 2000 caractères");
      return;
    }
    
    setPostingMessage(prev => ({ ...prev, [forumId]: true }));
    setError("");
    
    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/messages/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contenu_message: messageContent
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }
      
      const newMessage = await response.json();
      const messageWithLikeAndComments = {
        ...newMessage,
        user_has_liked: false,
        nombre_likes: 0,
        commentaires: [],
        nombre_commentaires: 0
      };
      
      setMessages(prev => ({
        ...prev,
        [forumId]: [...(prev[forumId] || []), messageWithLikeAndComments]
      }));
      
      setPosts(prev => prev.map(post => 
        post.id === forumId 
          ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
          : post
      ));
      
      setNewMessages(prev => ({ ...prev, [forumId]: "" }));
      
      triggerNotificationEvent();
      
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setError(`Erreur lors de l'envoi du message: ${error.message}`);
    } finally {
      setPostingMessage(prev => ({ ...prev, [forumId]: false }));
    }
  }, [token, API_URL, newMessages, triggerNotificationEvent]);

  const handleLike = useCallback(async (forumId) => {
    if (!token) {
      setError("Vous devez être connecté pour liker");
      return;
    }

    const post = posts.find(p => p.id === forumId);
    if (!post) {
      setError("Forum non trouvé");
      return;
    }

    const newLikedState = !post.userHasLiked;
    const newLikesCount = newLikedState ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 0) - 1);
    
    // Mise à jour optimiste
    setPosts(prev => prev.map(p => 
      p.id === forumId 
        ? { ...p, likes: newLikesCount, userHasLiked: newLikedState }
        : p
    ));

    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Revert en cas d'erreur
        setPosts(prev => prev.map(p => 
          p.id === forumId 
            ? { ...p, likes: post.likes || 0, userHasLiked: post.userHasLiked || false }
            : p
        ));
        
        const errorData = await response.json().catch(() => ({}));
        console.error("Erreur lors du like:", errorData.error || "Erreur inconnue");
        setError(`Erreur lors du like: ${errorData.error || "Erreur inconnue"}`);
      } else {
        const data = await response.json();
        // Mise à jour avec la réponse du serveur
        setPosts(prev => prev.map(p => 
          p.id === forumId 
            ? { 
                ...p, 
                likes: data.likes_count || newLikesCount, 
                userHasLiked: data.user_has_liked || newLikedState 
              }
            : p
        ));
        
        triggerNotificationEvent();
      }
    } catch (error) {
      // Revert en cas d'erreur réseau
      setPosts(prev => prev.map(p => 
        p.id === forumId 
          ? { ...p, likes: post.likes || 0, userHasLiked: post.userHasLiked || false }
          : p
      ));
      console.error("Erreur réseau lors du like:", error);
      setError("Erreur réseau lors du like");
    }
  }, [token, API_URL, posts, triggerNotificationEvent]);

  useEffect(() => {
    const fetchForums = async () => {
      if (!token) {
        setError("Token manquant - Veuillez vous reconnecter");
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/forums/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const forums = await response.json();
        
        const transformedForums = forums.map(forum => ({
          id: forum.id_forum,
          authorInitials: `${forum.utilisateur_nom?.[0] || ""}${forum.utilisateur_prenom?.[0] || ""}`.toUpperCase(),
          authorName: `${forum.utilisateur_prenom || ""} ${forum.utilisateur_nom || ""}`.trim(),
          time: forum.date_creation,
          title: forum.titre_forum,
          likes: forum.nombre_likes || 0,
          commentsCount: forum.nombre_messages || 0,
          type: forum.type || (role === "enseignant" ? "teacher-student" : "student-teacher"),
          userHasLiked: forum.user_has_liked || false,
          forumData: forum,
          isMine: forum.utilisateur === userId,
          comments: [],
          initialMessage: forum.contenu_message || ""
        }));
        
        const forumsWithLikes = await checkAllForumLikes(transformedForums);
        
        setPosts(forumsWithLikes);
        setError("");
      } catch (error) {
        console.error("Erreur chargement forums:", error);
        setError("Impossible de charger les forums. Vérifiez votre connexion.");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && role) {
      fetchForums();
    }
  }, [token, role, userId, API_URL, checkAllForumLikes]);

  const handleCreatePost = async () => {
    // Validation
    const validationErrors = validateForumData(newPostTitle, newPostContent);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    if (!token) {
      setError("Vous devez être connecté pour créer un forum");
      return;
    }

    // Confirmation selon le type de forum
    const confirmationMessage = getConfirmationMessage(role, forumTypeToCreate);
    if (confirmationMessage) {
      const confirm = window.confirm(confirmationMessage);
      if (!confirm) return;
    }

    setIsCreatingPost(true);
    setError("");

    try {
      const cible = getCibleFromForumType(forumTypeToCreate);
      
      const forumData = {
        titre_forum: newPostTitle,
        contenu_message: newPostContent,
        type: forumTypeToCreate,
        cible: cible
      };

      const response = await fetch(`${API_URL}/forums/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(forumData)
      });

      if (!response.ok) {
        let errorMessage = `Erreur HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (e) {
          // Ignore si pas de JSON
        }
        throw new Error(errorMessage);
      }

      const createdForum = await response.json();
      
      if (!createdForum.id_forum) {
        throw new Error("Réponse serveur invalide: ID manquant");
      }

      const newForum = {
        id: createdForum.id_forum,
        authorInitials: initials,
        authorName: `${userData.nom || ""} ${userData.prenom || ""}`.trim(),
        time: createdForum.date_creation || new Date().toISOString(),
        title: createdForum.titre_forum,
        likes: 0,
        userHasLiked: false,
        type: createdForum.type || forumTypeToCreate,
        isMine: true,
        commentsCount: 1,
        initialMessage: newPostContent,
        forumData: createdForum
      };

      setPosts(prev => [newForum, ...prev]);
      setNewPostTitle("");
      setNewPostContent("");
      
      try {
        await loadForumMessages(createdForum.id_forum);
      } catch (e) {
        console.warn("Impossible de charger les messages initiaux:", e);
      }
      
      setExpandedForums(prev => ({
        ...prev,
        [createdForum.id_forum]: true
      }));
      
      triggerNotificationEvent();
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error("Erreur lors de la création du forum:", error);
      setError(`Échec de la création: ${error.message}`);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleDeleteForum = useCallback(async (forumId) => {
    if (!token) {
      setError("Vous devez être connecté pour supprimer un forum");
      return;
    }

    setDeletingForumId(forumId);
    
    const postToDelete = posts.find(p => p.id === forumId);
    
    // Suppression optimiste
    setPosts(prev => prev.filter(post => post.id !== forumId));
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[forumId];
      return newMessages;
    });

    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Restauration en cas d'erreur
        if (postToDelete) {
          setPosts(prev => [...prev, postToDelete].sort((a, b) => new Date(b.time) - new Date(a.time)));
        }
        
        console.error("Erreur lors de la suppression:", errorData.error || `Erreur ${response.status}`);
        setError(`Erreur lors de la suppression: ${errorData.error || `Erreur ${response.status}`}`);
      }
    } catch (error) {
      // Restauration en cas d'erreur réseau
      if (postToDelete) {
        setPosts(prev => [...prev, postToDelete].sort((a, b) => new Date(b.time) - new Date(a.time)));
      }
      
      console.error("Erreur réseau lors de la suppression:", error);
      setError("Erreur réseau lors de la suppression");
    } finally {
      setDeletingForumId(null);
      setShowDeleteConfirm(null);
    }
  }, [token, API_URL, posts]);

  const formatTimeAgo = useCallback((dateString) => {
    if (!dateString) return "récemment";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return "à l'instant";
      if (diffMins < 60) return `il y a ${diffMins} min`;
      if (diffHours < 24) return `il y a ${diffHours} h`;
      if (diffDays < 7) return `il y a ${diffDays} j`;
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return "récemment";
    }
  }, []);

  const getForumTypeLabel = useCallback((type) => {
    switch(type) {
      case "teacher-teacher": return "Enseignants ↔ Enseignants";
      case "teacher-student": return "Enseignant → Étudiants";
      case "student-student": return "Étudiants ↔ Étudiants";
      case "student-teacher": return "Étudiant → Enseignants";
      default: return type;
    }
  }, []);

  const getForumTypeClasses = useCallback((type) => {
    switch(type) {
      case "teacher-teacher": 
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      case "teacher-student": 
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "student-student": 
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "student-teacher":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
      default: 
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  }, []);

  const getFilteredPosts = useCallback(() => {
    let filtered = [...posts];

    if (forumType !== "all") {
      filtered = filtered.filter(post => post.type === forumType);
    }

    switch (activeTab) {
      case "popular":
        return filtered.sort((a, b) => b.likes - a.likes);
      case "myforums":
        return filtered.filter(post => post.isMine)
          .sort((a, b) => new Date(b.time) - new Date(a.time));
      default:
        return filtered.sort((a, b) => new Date(b.time) - new Date(a.time));
    }
  }, [posts, forumType, activeTab]);

  const finalPosts = useMemo(() => getFilteredPosts(), [getFilteredPosts]);

  if (!userData || !token) {
    return (
      <div className="flex min-h-screen bg-background dark:bg-gray-900 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">Non connecté</h1>
          <p className="mb-6 dark:text-gray-300">Veuillez vous connecter</p>
          <button 
            onClick={() => navigate("/login")}
            className="bg-blue text-white px-6 py-2 rounded-full hover:bg-blue-dark transition"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      {/* Main content */}
      <main className={`
        flex-1 p-4 sm:p-6 pt-16 sm:pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
        {/* Header avec notifications et UserCircle */}
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-50">
          <div className="bg-bg dark:bg-gray-700 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-bg/80 transition">
            <Bell size={isMobile ? 16 : 20} />
          </div>
          <UserCircle
            size={isMobile ? "sm" : "md"}
            initials={initials}
            onToggleTheme={toggleDarkMode}
            onChangeLang={(lang) => {
              const i18n = window.i18n;
              if (i18n?.changeLanguage) i18n.changeLanguage(lang);
            }}
          />
        </div>

        <header className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-blue dark:text-blue-400">{t("community.title")}</h1>
          <p className="text-sm sm:text-base text-grayc dark:text-gray-400">
            {t("community.subtitle")}
          </p>
        </header>

        {/* Formulaire de création de forum */}
        <div className="bg-card  shadow-lg rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-6 sm:mb-8 border border-blue/20 dark:border-blue-800/30">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre du forum *
            </label>
            <Input
              placeholder="Donnez un titre à votre discussion (max 200 caractères)"
              value={newPostTitle}
              onChange={(e) => {
                setNewPostTitle(e.target.value);
                setError("");
              }}
              className="bg-surface dark:bg-gray-700 text-textc dark:text-white border border-blue/20 dark:border-gray-600 rounded-xl px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base"
              disabled={isCreatingPost}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {newPostTitle.length}/200 caractères
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Votre message initial *
            </label>
            <textarea
              placeholder="Écrivez votre message... (max 2000 caractères)"
              value={newPostContent}
              onChange={(e) => {
                setNewPostContent(e.target.value);
                setError("");
              }}
              className="w-full bg-white dark:bg-gray-700 text-textc dark:text-white border border-grayc/20 dark:border-gray-600 rounded-xl px-4 sm:px-5 py-3 h-32 sm:h-40 resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition text-sm sm:text-base"
              disabled={isCreatingPost}
              maxLength={2000}
            />
            <div className="flex flex-col sm:flex-row justify-between mt-1 gap-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ce message sera le point de départ de la discussion
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {newPostContent.length}/2000 caractères
              </p>
            </div>
          </div>
          
          {/* Section de sélection du type de forum */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Publier pour :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Options pour ENSEIGNANTS */}
              {role === "enseignant" && (
                <>
                  <Button
                    type="button"
                    variant={forumTypeToCreate === "teacher-teacher" ? "tabActive" : "tab"}
                    onClick={() => setForumTypeToCreate("teacher-teacher")}
                    className="w-full justify-start text-left p-3 sm:p-4"
                  >
                    <div>
                      <div className="font-medium text-sm sm:text-base">Aux enseignants</div>
                      <div className="text-xs mt-1 opacity-80">
                        Seulement entre enseignants
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={forumTypeToCreate === "teacher-student" ? "tabActive" : "tab"}
                    onClick={() => setForumTypeToCreate("teacher-student")}
                    className="w-full justify-start text-left p-3 sm:p-4"
                  >
                    <div>
                      <div className="font-medium text-sm sm:text-base">Aux étudiants</div>
                      <div className="text-xs mt-1 opacity-80">
                        Seulement pour les étudiants
                      </div>
                    </div>
                  </Button>
                </>
              )}
              
              {/* Options pour ÉTUDIANTS */}
              {role === "etudiant" && (
                <>
                  <Button
                    type="button"
                    variant={forumTypeToCreate === "student-student" ? "tabActive" : "tab"}
                    onClick={() => setForumTypeToCreate("student-student")}
                    className="w-full justify-start text-left p-3 sm:p-4"
                  >
                    <div>
                      <div className="font-medium text-sm sm:text-base">Aux étudiants</div>
                      <div className="text-xs mt-1 opacity-80">
                        Seulement entre étudiants
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={forumTypeToCreate === "student-teacher" ? "tabActive" : "tab"}
                    onClick={() => setForumTypeToCreate("student-teacher")}
                    className="w-full justify-start text-left p-3 sm:p-4"
                  >
                    <div>
                      <div className="font-medium text-sm sm:text-base">Aux enseignants</div>
                      <div className="text-xs mt-1 opacity-80">
                        Seulement pour les enseignants
                      </div>
                    </div>
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Message d'erreur global */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <div className="text-sm text-grayc dark:text-gray-400 order-2 sm:order-1">
              Posté par <span className="font-semibold">{initials}</span>
              <span className="ml-2 px-2 py-1 text-xs bg-blue/10 dark:bg-blue-900/30 text-blue dark:text-blue-300 rounded">
                {role === "enseignant" ? "Enseignant" : "Étudiant"}
              </span>
            </div>
            
            <Button
              variant="send"
              text={isCreatingPost ? "Publication..." : t("community.send")}
              className="!w-full sm:!w-auto px-6 py-2 order-1 sm:order-2"
              onClick={handleCreatePost}
              disabled={isCreatingPost || !newPostTitle.trim() || !newPostContent.trim()}
              icon={isCreatingPost ? <Loader className="animate-spin ml-2" size={16} /> : <FiSend className="ml-2" />}
            />
          </div>
        </div>

        {/* Onglets */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 mb-6 sm:mb-8">
          <div className="text-sm text-grayc dark:text-gray-400">
            {finalPosts.length} forum{finalPosts.length !== 1 ? 's' : ''}
          </div>
          <div className="w-full sm:w-auto">
            <ModernDropdown
              value={forumType}
              onChange={setForumType}
              options={forumOptions.map(o => ({
                ...o,
                label: t(`forums.${o.value}`) || o.label
              }))}
              placeholder={t("forums.select") || "Sélectionner un type"}
              disabled={isLoading}
              className="w-full sm:w-64"
            />
          </div>
        </div>

        {/* Message d'erreur global */}
        {error && !newPostTitle && !newPostContent && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6 pb-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin dark:text-white" size={24} />
            </div>
          ) : finalPosts.length === 0 ? (
            <div className="text-center py-12 dark:text-gray-300">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">Aucun forum</h3>
              <p className="text-grayc dark:text-gray-400 mb-6">
                {forumType === "all" 
                  ? "Soyez le premier à créer un forum !" 
                  : `Aucun forum de type "${forumOptions.find(o => o.value === forumType)?.label}"`}
              </p>
            </div>
          ) : (
            finalPosts.map((post) => (
              <div key={post.id} className="bg-grad-2 dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md border border-blue/10 dark:border-gray-700">
                {/* TOUT DANS LA MÊME CARTE */}
                <div className="flex items-start sm:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="bg-grad-1 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                      {post.authorInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-blue dark:text-blue-400 text-sm sm:text-base truncate">{post.authorName}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                        <p className="text-xs sm:text-sm text-grayc dark:text-gray-400">
                          {formatTimeAgo(post.time)}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded border ${getForumTypeClasses(post.type)} inline-block w-fit`}>
                          {getForumTypeLabel(post.type)}
                        </span>
                        {post.type === "student-teacher" && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded border border-yellow-200 dark:border-yellow-800 inline-block w-fit">
                            Question d'étudiant
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {post.isMine && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full shrink-0">
                      Votre forum
                    </span>
                  )}
                </div>
                
                {/* Titre du forum */}
                <h2 className="mb-3 sm:mb-4 text-textc dark:text-white font-bold text-base sm:text-lg">
                  {post.title}
                </h2>
                
                {/* Message initial */}
                <div className="mb-4">
                  <p className="text-textc dark:text-gray-300 whitespace-pre-wrap text-sm sm:text-base">
                    {post.initialMessage || 
                     (loadingMessages[post.id] ? (
                      <span className="italic text-gray-500 dark:text-gray-400">
                        Chargement du message...
                      </span>
                    ) : messages[post.id]?.[0]?.contenu_message ? (
                      messages[post.id][0].contenu_message
                    ) : (
                      <span className="italic text-gray-500 dark:text-gray-400">
                        Contenu du forum
                      </span>
                    ))}
                  </p>
                </div>
                
                {/* Boutons d'interaction */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-3">
                  <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto justify-between sm:justify-start">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-2 text-grayc dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                      disabled={!token}
                      aria-label={post.userHasLiked ? "Retirer le like" : "Ajouter un like"}
                      aria-pressed={post.userHasLiked}
                    >
                      <Heart 
                        size={isMobile ? 18 : 20} 
                        fill={post.userHasLiked ? "#ef4444" : "none"} 
                        color={post.userHasLiked ? "#ef4444" : "#6b7280"} 
                      />
                      <span className={`text-sm ${post.userHasLiked ? "text-red-500 dark:text-red-400 font-semibold" : ""}`}>
                        {post.likes} {post.likes === 1 ? 'like' : 'likes'}
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => toggleForumMessages(post.id)}
                      className="flex items-center space-x-2 text-grayc dark:text-gray-400 hover:text-blue dark:hover:text-blue-400 transition-colors"
                      aria-expanded={expandedForums[post.id]}
                    >
                      <MessageSquare size={isMobile ? 16 : 18} />
                      <span className="text-sm">
                        {expandedForums[post.id] ? 'Masquer' : 'Voir'} les messages
                        {!expandedForums[post.id] && messages[post.id]?.length > 1 && 
                          ` (${messages[post.id].length - 1})`
                        }
                      </span>
                      {expandedForums[post.id] ? (
                        <ChevronUp size={isMobile ? 14 : 16} />
                      ) : (
                        <ChevronDown size={isMobile ? 14 : 16} />
                      )}
                    </button>
                  </div>
                  
                  {post.isMine && (
                    <div className="relative w-full sm:w-auto">
                      <button 
                        onClick={() => setShowDeleteConfirm(post.id)}
                        disabled={deletingForumId === post.id}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 
                                 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-600 hover:text-red-800 dark:hover:text-red-200 transition-colors 
                                 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto text-sm"
                        aria-label="Supprimer le forum"
                      >
                        {deletingForumId === post.id ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Suppression...
                          </>
                        ) : (
                          <>
                            <Trash2 size={isMobile ? 14 : 16} />
                            Supprimer le forum
                          </>
                        )}
                      </button>
                      
                      {showDeleteConfirm === post.id && (
                        <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-800 p-4 z-10">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">Supprimer ce forum ?</h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Cette action est irréversible. Tous les messages et commentaires seront supprimés.
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleDeleteForum(post.id)}
                              disabled={deletingForumId === post.id}
                              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {deletingForumId === post.id ? 'Suppression...' : 'Supprimer'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* FORMULAIRE DE RÉPONSE - TOUJOURS VISIBLE */}
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Écrivez votre réponse..."
                      value={newMessages[post.id] || ""}
                      onChange={(e) => setNewMessages(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && !postingMessage[post.id] && handlePostMessage(post.id)}
                      className="flex-1 bg-white dark:bg-gray-700 text-textc dark:text-white border border-gray-300 dark:border-gray-600 rounded-full px-3 sm:px-4 py-2 text-sm"
                      disabled={postingMessage[post.id] || !token}
                      maxLength={2000}
                    />
                    <button
                      onClick={() => handlePostMessage(post.id)}
                      disabled={postingMessage[post.id] || !newMessages[post.id]?.trim() || !token}
                      className="bg-blue dark:bg-blue-600 text-white p-2 rounded-full hover:bg-blue-dark dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      aria-label="Envoyer la réponse"
                    >
                      {postingMessage[post.id] ? (
                        <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      ) : (
                        <Send size={isMobile ? 16 : 18} />
                      )}
                    </button>
                  </div>
                  {newMessages[post.id] && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {newMessages[post.id].length}/2000 caractères
                    </p>
                  )}
                </div>
                
                {/* Section des autres messages (dépliée) */}
                {expandedForums[post.id] && messages[post.id]?.length > 1 && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700 dark:text-gray-300">
                      {messages[post.id].length - 1} réponse{messages[post.id].length - 1 !== 1 ? 's' : ''}
                    </h4>
                    
                    <div className="mb-4 max-h-80 sm:max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                      {loadingMessages[post.id] ? (
                        <div className="flex justify-center py-6 sm:py-8">
                          <Loader className="animate-spin" size={isMobile ? 16 : 20} />
                        </div>
                      ) : messages[post.id]?.length > 1 ? (
                        <div className="space-y-3 sm:space-y-4">
                          {messages[post.id].slice(1).map((message) => (
                            <div key={message.id_message} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue/20 dark:bg-blue-900/40 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                                  {`${message.utilisateur_prenom?.[0] || ""}${message.utilisateur_nom?.[0] || ""}`.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                      <span className="font-medium dark:text-white text-sm truncate">
                                        {message.utilisateur_prenom} {message.utilisateur_nom}
                                      </span>
                                      <span className="text-xs text-grayc dark:text-gray-400">
                                        {formatTimeAgo(message.date_publication)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button 
                                        onClick={() => handleLikeMessage(message.id_message, post.id)}
                                        disabled={likingMessageId === message.id_message || !token}
                                        className="flex items-center space-x-1 text-grayc dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                                        aria-label={message.user_has_liked ? "Retirer le like" : "Ajouter un like"}
                                        aria-pressed={message.user_has_liked}
                                      >
                                        {likingMessageId === message.id_message ? (
                                          <Loader className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <Heart 
                                            size={isMobile ? 12 : 14} 
                                            fill={message.user_has_liked ? "#ef4444" : "none"} 
                                            color={message.user_has_liked ? "#ef4444" : "#6b7280"} 
                                          />
                                        )}
                                        <span className={`${message.user_has_liked ? "text-red-500 dark:text-red-400 font-semibold" : ""}`}>
                                          {message.nombre_likes || 0}
                                        </span>
                                      </button>
                                      
                                      {message.utilisateur === userId && (
                                        <div className="relative">
                                          <button 
                                            onClick={() => setShowDeleteCommentConfirm(message.id_message)}
                                            className="text-red-400 hover:text-red-600 text-xs px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                            aria-label="Supprimer le message"
                                          >
                                            <Trash2 size={isMobile ? 10 : 12} />
                                          </button>
                                          
                                          {showDeleteCommentConfirm === message.id_message && (
                                            <div className="absolute top-full right-0 mt-1 w-56 sm:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-200 dark:border-red-800 p-3 z-10">
                                              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3">
                                                Supprimer ce message ?
                                              </p>
                                              <div className="flex justify-end gap-2">
                                                <button
                                                  onClick={() => setShowDeleteCommentConfirm(null)}
                                                  className="px-2 sm:px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                >
                                                  Annuler
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    // Fonction de suppression de message à implémenter
                                                    setShowDeleteCommentConfirm(null);
                                                  }}
                                                  className="px-2 sm:px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                >
                                                  Supprimer
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="mt-2 text-textc dark:text-gray-300 text-sm">{message.contenu_message}</p>
                                  
                                  {/* SECTION COMMENTAIRES DU MESSAGE */}
                                  <div className="mt-3 sm:mt-4">
                                    <button
                                      onClick={() => toggleMessageComments(message.id_message)}
                                      className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-2"
                                      aria-expanded={expandedComments[message.id_message]}
                                    >
                                      <MessageSquare size={isMobile ? 12 : 14} />
                                      <span>{message.nombre_commentaires || 0} commentaire{message.nombre_commentaires !== 1 ? 's' : ''}</span>
                                      {expandedComments[message.id_message] ? (
                                        <ChevronUp size={isMobile ? 10 : 12} />
                                      ) : (
                                        <ChevronDown size={isMobile ? 10 : 12} />
                                      )}
                                    </button>
                                    
                                    {expandedComments[message.id_message] && (
                                      <div className="ml-2 border-l-2 border-gray-200 dark:border-gray-700 pl-3 sm:pl-4">
                                        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                                          {message.commentaires?.map(comment => (
                                            <div key={comment.id_commentaire} className="bg-gray-100 dark:bg-gray-800 rounded p-2 sm:p-3">
                                              <div className="flex justify-between items-start gap-2">
                                                <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue/20 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {`${comment.utilisateur_prenom?.[0] || ""}${comment.utilisateur_nom?.[0] || ""}`.toUpperCase()}
                                                  </div>
                                                  <div className="min-w-0">
                                                    <span className="font-medium dark:text-white text-xs sm:text-sm truncate block">
                                                      {comment.utilisateur_prenom} {comment.utilisateur_nom}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                      {formatTimeAgo(comment.date_commpub)}
                                                    </span>
                                                  </div>
                                                </div>
                                                {comment.utilisateur === userId && (
                                                  <div className="relative shrink-0">
                                                    <button
                                                      onClick={() => setShowDeleteCommentConfirm(`comment_${comment.id_commentaire}`)}
                                                      disabled={deletingCommentId === comment.id_commentaire}
                                                      className="text-red-400 hover:text-red-600 dark:hover:text-red-400 text-xs disabled:opacity-50 p-1"
                                                      aria-label="Supprimer le commentaire"
                                                    >
                                                      {deletingCommentId === comment.id_commentaire ? (
                                                        <Loader className="h-3 w-3 animate-spin" />
                                                      ) : (
                                                        <Trash2 size={isMobile ? 10 : 12} />
                                                      )}
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                              <p className="mt-2 text-xs sm:text-sm text-textc dark:text-gray-300">{comment.contenu_comm}</p>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                          <Input
                                            placeholder="Écrire un commentaire..."
                                            value={newComments[message.id_message] || ""}
                                            onChange={(e) => setNewComments(prev => ({ ...prev, [message.id_message]: e.target.value }))}
                                            onKeyPress={(e) => e.key === 'Enter' && !postingComment[message.id_message] && handlePostComment(message.id_message, post.id)}
                                            className="flex-1 text-xs sm:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1.5"
                                            disabled={postingComment[message.id_message] || !token}
                                            maxLength={1000}
                                          />
                                          <button
                                            onClick={() => handlePostComment(message.id_message, post.id)}
                                            disabled={postingComment[message.id_message] || !newComments[message.id_message]?.trim() || !token}
                                            className="bg-blue dark:bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-dark dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                            aria-label="Envoyer le commentaire"
                                          >
                                            {postingComment[message.id_message] ? (
                                              <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                            ) : (
                                              <Send size={isMobile ? 12 : 14} />
                                            )}
                                          </button>
                                        </div>
                                        {newComments[message.id_message] && (
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                                            {newComments[message.id_message].length}/1000 caractères
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-grayc dark:text-gray-400">
                          <MessageSquare className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mb-2" />
                          <p className="text-sm">Pas encore de réponses. Soyez le premier à répondre !</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}