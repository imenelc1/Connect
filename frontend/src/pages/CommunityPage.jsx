import { FiSend, FiMessageSquare } from "react-icons/fi";
import Input from "../components/common/Input";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import { useContext, useState, useEffect, useRef } from "react";
import ThemeContext from "../context/ThemeContext";
import Tabs from "../components/common/Tabs";
import Post from "../components/common/Post";
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
  const [newPost, setNewPost] = useState("");

  // Fonction pour liker un message
  const handleLikeMessage = async (messageId, forumId) => {
    console.log("🎯 CLIC LIKE MESSAGE - Message:", messageId);
    
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

    // Optimistic update
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

      console.log("📥 Réponse like message:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Erreur like message:", errorData);
        
        // Rollback
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
        console.log("✅ Message liké:", data);
        
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
      console.error("❌ Erreur réseau like message:", error);
      
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
      console.log("📥 Chargement messages forum:", forumId);
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
      console.log("✅ Messages chargés:", messagesData.length);
      
      setMessages(prev => ({ ...prev, [forumId]: messagesData }));
      
      setPosts(prev => prev.map(post => 
        post.id === forumId 
          ? { ...post, commentsCount: messagesData.length }
          : post
      ));
      
    } catch (error) {
      console.error("❌ Erreur chargement messages:", error);
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
      console.log("📤 Envoi message forum:", forumId);
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
      console.log("✅ Message posté:", newMessage);
      
      const messageWithLike = {
        ...newMessage,
        user_has_liked: false,
        nombre_likes: 0
      };
      
      setMessages(prev => ({
        ...prev,
        [forumId]: [...(prev[forumId] || []), messageWithLike]
      }));
      
      setPosts(prev => prev.map(post => 
        post.id === forumId 
          ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
          : post
      ));
      
      setNewMessages(prev => ({ ...prev, [forumId]: "" }));
      
    } catch (error) {
      console.error("❌ Erreur envoi message:", error);
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
        console.log("📥 Chargement des forums...");
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
        console.log("✅ Forums chargés:", forums.length);
        
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
        
        console.log("📊 Forums transformés:", transformedForums);
        setPosts(transformedForums);
        setError("");
      } catch (error) {
        console.error("❌ Erreur chargement forums:", error);
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
    if (!newPost.trim() || !token) {
      alert("Écrivez quelque chose avant de publier");
      return;
    }

    if (role === "enseignant" && !forumTypeToCreate) {
      alert("Veuillez sélectionner à qui s'adresse ce forum");
      return;
    }

    setIsCreatingPost(true);
    try {
      const forumData = {
        titre_forum: newPost,
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
        throw new Error(`Erreur: ${response.status}`);
      }

      const createdForum = await response.json();
      
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
        commentsCount: 0
      };

      setPosts(prev => [newForum, ...prev]);
      setNewPost("");
      alert("Forum créé !");
      
    } catch (error) {
      console.error("Erreur création forum:", error);
      alert("Erreur lors de la création");
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleLike = async (forumId) => {
    console.log("🎯 CLIC LIKE - Forum:", forumId);
    
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
      console.log("📤 Envoi requête like...");
      const response = await fetch(`${API_URL}/forums/${forumId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("📥 Réponse:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur serveur:", errorData);
        
        setPosts(prev => prev.map(p => 
          p.id === forumId 
            ? { ...p, likes: post.likes, userHasLiked: post.userHasLiked }
            : p
        ));
        alert("Erreur lors du like: " + (errorData.error || "Erreur inconnue"));
      } else {
        const data = await response.json();
        console.log("✅ Réponse serveur:", data);
        
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
      console.error("❌ Erreur réseau:", error);
      setPosts(prev => prev.map(p => 
        p.id === forumId 
          ? { ...p, likes: post.likes, userHasLiked: post.userHasLiked }
          : p
      ));
      alert("Erreur réseau lors du like");
    }
  };

  const handleDeleteForum = async (forumId) => {
    console.log("🗑️ CLIC SUPPRESSION - Forum:", forumId);
    
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
      console.log("📤 Envoi requête suppression...");
      const response = await fetch(`${API_URL}/forums/${forumId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("📥 Réponse suppression:", response.status);
      console.log("URL appelée:", `${API_URL}/forums/${forumId}/delete/`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Erreur suppression:", errorData);
        
        if (postToDelete) {
          setPosts(prev => [...prev, postToDelete].sort((a, b) => new Date(b.time) - new Date(a.time)));
        }
        
        alert("Erreur lors de la suppression: " + (errorData.error || `Erreur ${response.status}`));
      } else {
        const data = await response.json().catch(() => ({}));
        console.log("✅ Forum supprimé:", data.message || "Succès");
      }
    } catch (error) {
      console.error("❌ Erreur réseau suppression:", error);
      
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
          <h1 className="text-3xl font-bold mb-2">Communauté</h1>
          <p className="mb-6 text-grayc">
            Échangez et collaborez avec la communauté
          </p>
        </header>

        <div className="bg-card rounded-3xl p-5 mb-8 border border-blue/20">
          <Input
            placeholder="De quoi voulez-vous discuter ?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isCreatingPost && handleCreatePost()}
            className="bg-surface border border-blue/20 rounded-full px-5 py-3 mb-4"
            disabled={isCreatingPost}
          />
          
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
                    <span className="text-lg">👨‍🏫</span>
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
                    <span className="text-lg">👨‍🎓</span>
                    <div className="text-left">
                      <div className="font-medium">Aux étudiants</div>
                      <div className="text-xs mt-1">Étudiants & enseignants</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
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
              text={isCreatingPost ? "Publication..." : "Publier"}
              className="!w-auto px-6 py-2"
              onClick={handleCreatePost}
              disabled={isCreatingPost || !newPost.trim() || (role === "enseignant" && !forumTypeToCreate)}
              icon={isCreatingPost ? <Loader className="animate-spin ml-2" size={16} /> : <FiSend className="ml-2" />}
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            {["recent", "popular", "myforums"].map(tab => (
              <button
                key={tab}
                className={`flex items-center px-4 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-blue text-blue"
                    : "text-grayc hover:text-blue"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "recent" ? "Récent" : 
                 tab === "popular" ? "Populaire" : "Mes forums"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-grayc">
            {isLoading ? "Chargement..." : 
             `${finalPosts.length} forum${finalPosts.length > 1 ? 's' : ''}`}
          </div>
          
          <ModernDropdown
            value={forumType}
            onChange={setForumType}
            options={forumOptions}
            placeholder="Filtrer par type"
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
              <div key={post.id} className="bg-card rounded-2xl p-6 shadow-lg border border-blue/20 hover:border-blue/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue/20 flex items-center justify-center font-bold">
                      {post.authorInitials}
                    </div>
                    <div>
                      <h3 className="font-semibold">{post.authorName}</h3>
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
                      Votre post
                    </span>
                  )}
                </div>
                
                <p className="mb-4 text-gray-800">{post.title}</p>
                
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
                      <FiMessageSquare size={18} />
                      <span>{post.commentsCount} commentaire{post.commentsCount !== 1 ? 's' : ''}</span>
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
                
                {expandedForums[post.id] && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="mb-4 max-h-96 overflow-y-auto pr-2">
                      {loadingMessages[post.id] ? (
                        <div className="flex justify-center py-8">
                          <Loader className="animate-spin" size={20} />
                        </div>
                      ) : messages[post.id]?.length > 0 ? (
                        <div className="space-y-4">
                          {messages[post.id].map((message) => (
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
                                  <p className="mt-2 text-gray-700">{message.contenu_message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="text-center py-8 text-grayc">
                          <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                          <p>Aucun commentaire encore. Soyez le premier à commenter !</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Écrivez votre commentaire..."
                        value={newMessages[post.id] || ""}
                        onChange={(e) => setNewMessages(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && !postingMessage[post.id] && handlePostMessage(post.id)}
                        className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2"
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
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}