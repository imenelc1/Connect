import { FiSend } from "react-icons/fi";
import Input from "../components/common/Input";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import { useContext, useState, useEffect, useRef } from "react";
import ThemeContext from "../context/ThemeContext";
import Tabs from "../components/common/Tabs";
import Button from "../components/common/Button";
import ModernDropdown from "../components/common/ModernDropdown";
import { Bell, Loader, Heart, Trash2, Send, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [error, setError] = useState("");
  const [deletingForumId, setDeletingForumId] = useState(null);
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
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  
  const navigate = useNavigate();
  const { t } = useTranslation("community");
  
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  const role = userData?.role;
  const userId = userData?.user_id;
  
  const messagesEndRef = useRef(null);
  
  const [forumTypeToCreate, setForumTypeToCreate] = useState("");
  
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:8000/api" 
    : "/api";

  useEffect(() => {
    if (role === "enseignant") {
      setForumTypeToCreate("teacher-teacher");
    } else {
      setForumTypeToCreate("student-student");
    }
  }, [role]);

  useEffect(() => {
    if (!userData || !token) {
      navigate("/login");
    }
  }, [userData, token, navigate]);

  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const { toggleDarkMode } = useContext(ThemeContext);

  const forumOptions = [
    { value: "all", label: t("forums.all") || "All forums" },
    { value: "teacher-teacher", label: t("forums.teacher-teacher") || "Teacher ↔ Teacher" },
    { value: "teacher-student", label: t("forums.teacher-student") || "Teacher ↔ Student" },
    { value: "student-student", label: t("forums.student-student") || "Student ↔ Student" }
  ].filter(opt => 
    role === "enseignant" 
      ? opt.value !== "student-student" 
      : opt.value !== "teacher-teacher"
  );

  const [forumType, setForumType] = useState("all");
  const [posts, setPosts] = useState([]);

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
  }, [posts, token]);

  // ========== FONCTIONS POUR LES COMMENTAIRES ==========
  
  const toggleMessageComments = (messageId) => {
    setExpandedComments(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };
  
  const handlePostComment = async (messageId, forumId) => {
    const commentContent = newComments[messageId]?.trim();
    
    if (!commentContent || !token) {
      alert("Écrivez quelque chose avant d'envoyer");
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
      
    } catch (error) {
      alert("Erreur lors de l'envoi du commentaire: " + error.message);
    } finally {
      setPostingComment(prev => ({ ...prev, [messageId]: false }));
    }
  };
  
  const handleDeleteComment = async (commentId, messageId, forumId) => {
    if (!token) {
      alert("Connectez-vous pour supprimer");
      return;
    }
    
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
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
        alert("Erreur lors de la suppression: " + (errorData.error || `Erreur ${response.status}`));
      }
    } catch (error) {
      alert("Erreur réseau lors de la suppression");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleLikeMessage = async (messageId, forumId) => {
    if (!token) {
      alert("Connectez-vous pour liker");
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
    const newLikesCount = newLikedState ? (message.nombre_likes || 0) + 1 : (message.nombre_likes || 0) - 1;
    
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
        
        alert("Erreur lors du like: " + (errorData.error || `Erreur ${response.status}`));
      } else {
        const data = await response.json();
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
      }
    } catch (error) {
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
      
      alert("Erreur réseau lors du like");
    } finally {
      setLikingMessageId(null);
    }
  };

  const loadForumMessages = async (forumId) => {
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
      setMessages(prev => ({ ...prev, [forumId]: [] }));
    } finally {
      setLoadingMessages(prev => ({ ...prev, [forumId]: false }));
    }
  };

  const toggleForumMessages = async (forumId) => {
    const isExpanded = expandedForums[forumId];
    
    if (!isExpanded && !messages[forumId]) {
      await loadForumMessages(forumId);
    }
    
    setExpandedForums(prev => ({
      ...prev,
      [forumId]: !isExpanded
    }));
  };

  const handlePostMessage = async (forumId) => {
    const messageContent = newMessages[forumId]?.trim();
    
    if (!messageContent || !token) {
      alert("Écrivez quelque chose avant d'envoyer");
      return;
    }
    
    setPostingMessage(prev => ({ ...prev, [forumId]: true }));
    
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
      
    } catch (error) {
      alert("Erreur lors de l'envoi du message: " + error.message);
    } finally {
      setPostingMessage(prev => ({ ...prev, [forumId]: false }));
    }
  };

  const refreshForumState = async (forumId) => {
    if (!token || !forumId) return;
    
    try {
      const response = await fetch(`${API_URL}/forums/${forumId}/check-like/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(prev => prev.map(p => 
          p.id === forumId 
            ? { ...p, likes: data.likes_count, userHasLiked: data.user_has_liked }
            : p
        ));
      }
    } catch (error) {
      console.error("Erreur rafraîchissement:", error);
    }
  };

  useEffect(() => {
    const fetchForums = async () => {
      if (!token) {
        setError("Token manquant");
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
        
        const filteredForums = forums.filter(forum => {
          if (role === "enseignant") {
            return forum.type !== "student-student";
          } else {
            return forum.type !== "teacher-teacher";
          }
        });
        
        const transformedForums = filteredForums.map(forum => ({
          id: forum.id_forum,
          authorInitials: `${forum.utilisateur_nom?.[0] || ""}${forum.utilisateur_prenom?.[0] || ""}`.toUpperCase(),
          authorName: `${forum.utilisateur_prenom || ""} ${forum.utilisateur_nom || ""}`,
          time: forum.date_creation,
          title: forum.titre_forum,
          likes: forum.nombre_likes || 0,
          commentsCount: forum.nombre_messages || 0,
          type: forum.type || (role === "enseignant" ? "teacher-teacher" : "student-student"),
          userHasLiked: forum.user_has_liked || false,
          forumData: forum,
          isMine: forum.utilisateur === userId,
          comments: []
        }));
        
        setPosts(transformedForums);
        setError("");
      } catch (error) {
        setError("Impossible de charger les forums");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && role) {
      fetchForums();
    }
  }, [token, role, userId, API_URL]);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !token) {
      alert("Veuillez remplir le titre et le contenu avant de publier");
      return;
    }

    if (role === "enseignant" && !forumTypeToCreate) {
      alert("Veuillez sélectionner à qui s'adresse ce forum");
      return;
    }

    setIsCreatingPost(true);
    try {
      const forumData = {
        titre_forum: newPostTitle,
        contenu_message: newPostContent,
        type: forumTypeToCreate
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
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur: ${response.status}`);
      }

      const createdForum = await response.json();
      await loadForumMessages(createdForum.id_forum);
      
      const newForum = {
        id: createdForum.id_forum,
        authorInitials: initials,
        authorName: `${userData.nom || ""} ${userData.prenom || ""}`,
        time: createdForum.date_creation || new Date().toISOString(),
        title: createdForum.titre_forum,
        likes: 0,
        userHasLiked: false,
        type: createdForum.type,
        isMine: true,
        commentsCount: 1
      };

      setPosts(prev => [newForum, ...prev]);
      setNewPostTitle("");
      setNewPostContent("");
      
      setExpandedForums(prev => ({
        ...prev,
        [createdForum.id_forum]: true
      }));
      
      alert("Forum créé avec votre message initial !");
      
    } catch (error) {
      alert("Erreur lors de la création: " + error.message);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleLike = async (forumId) => {
    if (!token) {
      alert("Connectez-vous pour liker");
      return;
    }

    const post = posts.find(p => p.id === forumId);
    if (!post) return;

    const newLikedState = !post.userHasLiked;
    const newLikesCount = newLikedState ? post.likes + 1 : post.likes - 1;
    
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
        const errorData = await response.json();
        setPosts(prev => prev.map(p => 
          p.id === forumId 
            ? { ...p, likes: post.likes, userHasLiked: post.userHasLiked }
            : p
        ));
        alert("Erreur lors du like: " + (errorData.error || "Erreur inconnue"));
      } else {
        const data = await response.json();
        setPosts(prev => prev.map(p => 
          p.id === forumId 
            ? { 
                ...p, 
                likes: data.likes_count || newLikesCount, 
                userHasLiked: data.user_has_liked || newLikedState 
              }
            : p
        ));
        
        refreshForumState(forumId);
      }
    } catch (error) {
      setPosts(prev => prev.map(p => 
        p.id === forumId 
          ? { ...p, likes: post.likes, userHasLiked: post.userHasLiked }
          : p
      ));
      alert("Erreur réseau lors du like");
    }
  };

  const handleDeleteForum = async (forumId) => {
    if (!token) {
      alert("Connectez-vous pour supprimer");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce forum ? Cette action est irréversible.")) {
      return;
    }

    setDeletingForumId(forumId);

    const postToDelete = posts.find(p => p.id === forumId);
    
    setPosts(prev => prev.filter(post => post.id !== forumId));

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
        if (postToDelete) {
          setPosts(prev => [...prev, postToDelete].sort((a, b) => new Date(b.time) - new Date(a.time)));
        }
        
        alert("Erreur lors de la suppression: " + (errorData.error || `Erreur ${response.status}`));
      }
    } catch (error) {
      if (postToDelete) {
        setPosts(prev => [...prev, postToDelete].sort((a, b) => new Date(b.time) - new Date(a.time)));
      }
      
      alert("Erreur réseau lors de la suppression");
    } finally {
      setDeletingForumId(null);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "récemment";
    
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
    return date.toLocaleDateString();
  };

  const getForumTypeLabel = (type) => {
    switch(type) {
      case "teacher-teacher": return "Enseignants";
      case "teacher-student": return "Tous";
      case "student-student": return "Étudiants";
      default: return type;
    }
  };

  const getForumTypeClasses = (type) => {
    switch(type) {
      case "teacher-teacher": 
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "teacher-student": 
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "student-student": 
        return "bg-green-100 text-green-800 border-green-200";
      default: 
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFilteredPosts = () => {
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
  };

  const finalPosts = getFilteredPosts();

  if (!userData || !token) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Non connecté</h1>
          <p className="mb-6">Veuillez vous connecter</p>
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
    <div className="flex min-h-screen bg-background">
      <Navbar />
      
      <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
        <div className="bg-bg w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-sm">
          <Bell size={18} />
        </div>
        <UserCircle
          initials={initials}
          onToggleTheme={toggleDarkMode}
          onChangeLang={(lang) => {
            const i18n = window.i18n;
            if (i18n?.changeLanguage) i18n.changeLanguage(lang);
          }}
        />
      </div>

      <div className="flex-1 ml-56 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-blue">{t("community.title")}</h1>
          <p className="mb-6 text-grayc">
            {t("community.subtitle")}
          </p>
        </header>

        {/* Formulaire de création de forum */}
        <div className="bg-card shadow-lg rounded-3xl p-5 mb-8 border border-blue/20">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du forum *
            </label>
            <Input
              placeholder="Donnez un titre à votre discussion"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="bg-surface text-textc border border-blue/20 rounded-xl px-5 py-3 font-semibold"
              disabled={isCreatingPost}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre message initial *
            </label>
            <textarea
              placeholder="Écrivez votre message... (ce sera le premier message du forum)"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-surface text-textc border border-blue/20 rounded-xl px-5 py-3 h-40 resize-none"
              disabled={isCreatingPost}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ce message sera le point de départ de la discussion
            </p>
          </div>
          
          {role === "enseignant" ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publier pour :
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setForumTypeToCreate("teacher-teacher")}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    forumTypeToCreate === "teacher-teacher"
                      ? "bg-purple-50 text-purple-700 border-purple-500"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-left">
                      <div className="font-medium">Aux enseignants</div>
                      <div className="text-xs mt-1">Seulement entre enseignants</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForumTypeToCreate("teacher-student")}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    forumTypeToCreate === "teacher-student"
                      ? "bg-blue-50 text-blue-700 border-blue-500"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-left">
                      <div className="font-medium">Aux étudiants</div>
                      <div className="text-xs mt-1">Étudiants & enseignants</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-primary rounded-xl border border-green-200">
              <div className="flex items-center gap-2">
                <span className="text-green-600">👨‍🎓</span>
                <div>
                  <p className="text-sm font-medium text-green-700">Forum étudiant</p>
                  <p className="text-xs text-green-600">Ce forum sera visible uniquement par les étudiants</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-grayc">
              Posté par <span className="font-semibold">{initials}</span>
              <span className="ml-2 px-2 py-1 text-xs bg-blue/10 text-blue rounded">
                {role === "enseignant" ? "Enseignant" : "Étudiant"}
              </span>
            </div>
            
            <Button
              variant="send"
              text={isCreatingPost ? "Publication..." : t("community.send")}
              className="!w-auto px-6 py-2"
              onClick={handleCreatePost}
              disabled={isCreatingPost || !newPostTitle.trim() || !newPostContent.trim() || (role === "enseignant" && !forumTypeToCreate)}
              icon={isCreatingPost ? <Loader className="animate-spin ml-2" size={16} /> : <FiSend className="ml-2" />}
            />
          </div>
        </div>

        {/* Onglets */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex justify-end mt-4 mb-8">
          <ModernDropdown
            value={forumType}
            onChange={setForumType}
            options={forumOptions.map(o => ({
              ...o,
              label: t(`forums.${o.value}`)
            }))}
            placeholder={t("forums.select")}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin" size={24} />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : finalPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">Aucun forum</h3>
              <p className="text-grayc mb-6">Soyez le premier à créer un forum !</p>
            </div>
          ) : (
            finalPosts.map((post) => (
              <div key={post.id} className="bg-grad-2 rounded-3xl p-6 shadow-md border border-blue/10">
                {/* TOUT DANS LA MÊME CARTE */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-grad-1 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold">
                      {post.authorInitials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue">{post.authorName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-grayc">
                          {formatTimeAgo(post.time)}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded border ${getForumTypeClasses(post.type)}`}>
                          {getForumTypeLabel(post.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {post.isMine && (
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Votre forum
                    </span>
                  )}
                </div>
                
                {/* Titre du forum */}
                <h2 className="mb-4 text-textc font-bold text-lg">
                  {post.title}
                </h2>
                
                {/* Message initial intégré directement dans la carte */}
                <div className="mb-4">
                  <p className="text-textc whitespace-pre-wrap">
                    {loadingMessages[post.id] ? (
                      <span className="italic text-gray-500">
                        Chargement du message...
                      </span>
                    ) : messages[post.id]?.[0]?.contenu_message ? (
                      messages[post.id][0].contenu_message
                    ) : (
                      <span className="italic text-gray-500">
                        Contenu du forum
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Boutons d'interaction */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-2 text-grayc hover:text-red-500 transition-colors"
                    >
                      <Heart 
                        size={20} 
                        fill={post.userHasLiked ? "#ef4444" : "none"} 
                        color={post.userHasLiked ? "#ef4444" : "#6b7280"} 
                      />
                      <span className={post.userHasLiked ? "text-red-500 font-semibold" : ""}>
                        {post.likes} {post.likes === 1 ? 'like' : 'likes'}
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => toggleForumMessages(post.id)}
                      className="flex items-center space-x-2 text-grayc hover:text-blue transition-colors"
                    >
                      <MessageSquare size={18} />
                      <span>
                        {expandedForums[post.id] ? 'Masquer' : 'Voir'} les messages
                        {!expandedForums[post.id] && messages[post.id]?.length > 1 && 
                          ` (${messages[post.id].length - 1} autre${messages[post.id].length - 1 !== 1 ? 's' : ''})`
                        }
                      </span>
                      {expandedForums[post.id] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                  
                  {post.isMine && (
                    <button 
                      onClick={() => handleDeleteForum(post.id)}
                      disabled={deletingForumId === post.id}
                      className="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingForumId === post.id ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Suppression...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Supprimer
                        </>
                      )}
                    </button>
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
                      className="flex-1 bg-white text-textc border border-gray-300 rounded-full px-4 py-2"
                      disabled={postingMessage[post.id]}
                    />
                    <button
                      onClick={() => handlePostMessage(post.id)}
                      disabled={postingMessage[post.id] || !newMessages[post.id]?.trim()}
                      className="bg-blue text-white p-2 rounded-full hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {postingMessage[post.id] ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Section des autres messages (dépliée) - SEULEMENT LES RÉPONSES EXISTANTES */}
                {expandedForums[post.id] && messages[post.id]?.length > 1 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700">
                      {messages[post.id].length - 1} réponse{messages[post.id].length - 1 !== 1 ? 's' : ''}
                    </h4>
                    
                    <div className="mb-4 max-h-96 overflow-y-auto pr-2">
                      {loadingMessages[post.id] ? (
                        <div className="flex justify-center py-8">
                          <Loader className="animate-spin" size={20} />
                        </div>
                      ) : messages[post.id]?.length > 1 ? (
                        <div className="space-y-4">
                          {/* Afficher seulement les messages après le premier */}
                          {messages[post.id].slice(1).map((message) => (
                            <div key={message.id_message} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue/20 flex items-center justify-center text-sm font-bold">
                                  {`${message.utilisateur_prenom?.[0] || ""}${message.utilisateur_nom?.[0] || ""}`.toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-medium">
                                        {message.utilisateur_prenom} {message.utilisateur_nom}
                                      </span>
                                      <span className="text-xs text-grayc ml-2">
                                        {formatTimeAgo(message.date_publication)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button 
                                        onClick={() => handleLikeMessage(message.id_message, post.id)}
                                        disabled={likingMessageId === message.id_message}
                                        className="flex items-center space-x-1 text-grayc hover:text-red-500 transition-colors disabled:opacity-50"
                                      >
                                        {likingMessageId === message.id_message ? (
                                          <Loader className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <Heart 
                                            size={14} 
                                            fill={message.user_has_liked ? "#ef4444" : "none"} 
                                            color={message.user_has_liked ? "#ef4444" : "#6b7280"} 
                                          />
                                        )}
                                        <span className={`text-xs ${message.user_has_liked ? "text-red-500 font-semibold" : ""}`}>
                                          {message.nombre_likes || 0}
                                        </span>
                                      </button>
                                      
                                      {message.utilisateur === userId && (
                                        <button className="text-red-400 hover:text-red-600 text-xs">
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="mt-2 text-textc">{message.contenu_message}</p>
                                  
                                  {/* SECTION COMMENTAIRES DU MESSAGE */}
                                  <div className="mt-4">
                                    <button
                                      onClick={() => toggleMessageComments(message.id_message)}
                                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-2"
                                    >
                                      <MessageSquare size={14} />
                                      <span>{message.nombre_commentaires || 0} commentaire{message.nombre_commentaires !== 1 ? 's' : ''}</span>
                                      {expandedComments[message.id_message] ? (
                                        <ChevronUp size={12} />
                                      ) : (
                                        <ChevronDown size={12} />
                                      )}
                                    </button>
                                    
                                    {expandedComments[message.id_message] && (
                                      <div className="ml-2 border-l-2 border-gray-200 pl-4">
                                        <div className="space-y-3 mb-4">
                                          {message.commentaires?.map(comment => (
                                            <div key={comment.id_commentaire} className="bg-gray-100 rounded p-3">
                                              <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-6 h-6 rounded-full bg-blue/20 flex items-center justify-center text-xs font-bold">
                                                    {`${comment.utilisateur_prenom?.[0] || ""}${comment.utilisateur_nom?.[0] || ""}`.toUpperCase()}
                                                  </div>
                                                  <span className="font-medium text-sm">
                                                    {comment.utilisateur_prenom} {comment.utilisateur_nom}
                                                  </span>
                                                  <span className="text-xs text-gray-500">
                                                    {formatTimeAgo(comment.date_commpub)}
                                                  </span>
                                                </div>
                                                {comment.utilisateur === userId && (
                                                  <button
                                                    onClick={() => handleDeleteComment(comment.id_commentaire, message.id_message, post.id)}
                                                    disabled={deletingCommentId === comment.id_commentaire}
                                                    className="text-red-400 hover:text-red-600 text-xs disabled:opacity-50"
                                                  >
                                                    {deletingCommentId === comment.id_commentaire ? (
                                                      <Loader className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                      <Trash2 size={12} />
                                                    )}
                                                  </button>
                                                )}
                                              </div>
                                              <p className="mt-2 text-sm text-textc">{comment.contenu_comm}</p>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                          <Input
                                            placeholder="Écrire un commentaire..."
                                            value={newComments[message.id_message] || ""}
                                            onChange={(e) => setNewComments(prev => ({ ...prev, [message.id_message]: e.target.value }))}
                                            onKeyPress={(e) => e.key === 'Enter' && !postingComment[message.id_message] && handlePostComment(message.id_message, post.id)}
                                            className="flex-1 text-sm bg-white border border-gray-300 rounded-full px-3 py-1.5"
                                            disabled={postingComment[message.id_message]}
                                          />
                                          <button
                                            onClick={() => handlePostComment(message.id_message, post.id)}
                                            disabled={postingComment[message.id_message] || !newComments[message.id_message]?.trim()}
                                            className="bg-blue text-white p-1.5 rounded-full hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {postingComment[message.id_message] ? (
                                              <Loader className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Send size={14} />
                                            )}
                                          </button>
                                        </div>
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
                        <div className="text-center py-8 text-grayc">
                          <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                          <p>Pas encore de réponses. Soyez le premier à répondre !</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}