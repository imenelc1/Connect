import { FiSend } from "react-icons/fi";
import Input from "../components/common/Input";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import { useContext, useState, useEffect } from "react";
import ThemeContext from "../context/ThemeContext";
import Tabs from "../components/common/Tabs";
import Post from "../components/common/Post";
import Button from "../components/common/Button";
import ModernDropdown from "../components/common/ModernDropdown";
import { Bell, Loader, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation("community");
  
  // Récupération de l'utilisateur
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  const role = userData?.role;
  const userId = userData?.user_id;
  
  // NOUVEAU : État pour le type de forum à créer
  const [forumTypeToCreate, setForumTypeToCreate] = useState("");
  
  // URL de l'API
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:8000/api" 
    : "/api";

  // Définir le type par défaut selon le rôle
  useEffect(() => {
    if (role === "enseignant") {
      // Enseignant peut choisir entre teacher-teacher et teacher-student
      setForumTypeToCreate("teacher-teacher");
    } else {
      // Étudiant peut seulement créer student-student
      setForumTypeToCreate("student-student");
    }
  }, [role]);

  // Redirection si non connecté
  useEffect(() => {
    if (!userData || !token) {
      navigate("/login");
    }
  }, [userData, token, navigate]);

  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const { toggleDarkMode } = useContext(ThemeContext);

  // Options de filtre selon le rôle
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

  // Fonction pour rafraîchir l'état d'un forum
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

  // Chargement des forums depuis l'API
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
        
        // FILTRAGE selon le rôle
        const filteredForums = forums.filter(forum => {
          if (role === "enseignant") {
            return forum.type !== "student-student";
          } else {
            return forum.type !== "teacher-teacher";
          }
        });
        
        // TRANSFORMATION avec les données correctes
        // Dans le useEffect de chargement des forums - CORRECTION
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
  // CORRECTION : Utiliser forum.utilisateur (qui est l'ID de l'utilisateur)
  isMine: forum.utilisateur === userId, // forum.utilisateur est déjà l'ID
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

  // Création d'un nouveau forum
  const handleCreatePost = async () => {
    if (!newPost.trim() || !token) {
      alert("Écrivez quelque chose avant de publier");
      return;
    }

    // Validation pour les enseignants
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
        comments: []
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

  // Gestion des likes - VERSION CORRIGÉE
  const handleLike = async (forumId) => {
    console.log("🎯 CLIC LIKE - Forum:", forumId);
    
    if (!token) {
      alert("Connectez-vous pour liker");
      return;
    }

    // Trouver le post actuel
    const post = posts.find(p => p.id === forumId);
    if (!post) return;

    // Optimistic update IMMÉDIAT
    const newLikedState = !post.userHasLiked;
    const newLikesCount = newLikedState ? post.likes + 1 : post.likes - 1;
    
    // Mettre à jour l'état local IMMÉDIATEMENT
    setPosts(prev => prev.map(p => 
      p.id === forumId 
        ? { ...p, likes: newLikesCount, userHasLiked: newLikedState }
        : p
    ));

    // Envoyer au serveur
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
        
        // ANNULER si erreur serveur
        setPosts(prev => prev.map(p => 
          p.id === forumId 
            ? { ...p, likes: post.likes, userHasLiked: post.userHasLiked }
            : p
        ));
        alert("Erreur lors du like: " + (errorData.error || "Erreur inconnue"));
      } else {
        const data = await response.json();
        console.log("✅ Réponse serveur:", data);
        
        // Mettre à jour avec les données réelles du serveur
        setPosts(prev => prev.map(p => 
          p.id === forumId 
            ? { 
                ...p, 
                likes: data.likes_count || newLikesCount, 
                userHasLiked: data.user_has_liked || newLikedState 
              }
            : p
        ));
        
        // Rafraîchir l'état pour être sûr
        refreshForumState(forumId);
      }
    } catch (error) {
      console.error("❌ Erreur réseau:", error);
      // Annuler si erreur réseau
      setPosts(prev => prev.map(p => 
        p.id === forumId 
          ? { ...p, likes: post.likes, userHasLiked: post.userHasLiked }
          : p
      ));
      alert("Erreur réseau lors du like");
    }
  };

  // Fonction pour formater la date
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

  // Fonction pour obtenir le label du type de forum
  const getForumTypeLabel = (type) => {
    switch(type) {
      case "teacher-teacher": return "Enseignants";
      case "teacher-student": return "Tous";
      case "student-student": return "Étudiants";
      default: return type;
    }
  };

  // Fonction pour obtenir les classes CSS selon le type
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

  // Filtrage des posts
  const getFilteredPosts = () => {
    let filtered = [...posts];

    // Filtre par type
    if (forumType !== "all") {
      filtered = filtered.filter(post => post.type === forumType);
    }

    // Filtre par onglet
    switch (activeTab) {
      case "popular":
        return filtered.sort((a, b) => b.likes - a.likes);
      case "myforums":
        return filtered.filter(post => post.isMine)
          .sort((a, b) => new Date(b.time) - new Date(a.time));
      default: // recent
        return filtered.sort((a, b) => new Date(b.time) - new Date(a.time));
    }
  };

  const finalPosts = getFilteredPosts();

  // Si pas connecté
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
      
      {/* Header */}
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

      {/* Contenu principal */}
      <div className="flex-1 ml-56 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Communauté</h1>
          <p className="mb-6 text-grayc">
            Échangez et collaborez avec la communauté
          </p>
        </header>

        {/* Formulaire création */}
        <div className="bg-card rounded-3xl p-5 mb-8 border border-blue/20">
          <Input
            placeholder="De quoi voulez-vous discuter ?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isCreatingPost && handleCreatePost()}
            className="bg-surface border border-blue/20 rounded-full px-5 py-3 mb-4"
            disabled={isCreatingPost}
          />
          
          {/* NOUVEAU : Sélecteur de type de forum */}
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

        {/* Onglets */}
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

        {/* Filtres */}
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

        {/* Liste des posts */}
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
                {/* En-tête */}
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
                
                {/* Contenu */}
                <p className="mb-4 text-gray-800">{post.title}</p>
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-6">
                    {/* Bouton Like CORRIGÉ */}
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
                    
                    {/* Bouton Comment */}
                    <button className="flex items-center space-x-2 text-grayc hover:text-blue">
                      <span>💬</span>
                      <span>{post.commentsCount} commentaires</span>
                    </button>
                  </div>
                  
                  {/* Bouton Delete */}
                  {post.isMine && (
                    <button className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}