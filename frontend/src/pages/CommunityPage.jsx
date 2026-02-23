import { useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import { FiSend } from "react-icons/fi";
import { Loader, Heart, Trash2, Send, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

import Navbar from "../components/common/Navbar";
import UserCircle from "../components/common/UserCircle";
import Input from "../components/common/Input";
import Tabs from "../components/common/Tabs";
import Button from "../components/common/Button";
import ModernDropdown from "../components/common/ModernDropdown";
import NotificationBell from "../components/common/NotificationBell";

import {
  getCibleFromForumType,
  validateForumData,
  getConfirmationMessage,
  getForumTypeLabel,
  getForumTypeClasses,
  formatTimeAgo
} from "../utils/formUtils";

import PostCreationForm from "../components/community/PostCreationForm";
import ForumList from "../components/community/ForumList";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [forumType, setForumType] = useState("all");
  const [forumTypeToCreate, setForumTypeToCreate] = useState("");
  // / États de l'interface
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Gestion de la responsivité
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);


  const navigate = useNavigate();
  const { t } = useTranslation("community");
  const { fetchUnreadCount } = useNotifications();
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  const role = userData?.role;
  const userId = userData?.user_id;

  const API_URL = window.REACT_APP_API_URL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "${import.meta.env.VITE_API_URL}/api"
      : "/api");

  const { toggleDarkMode } = useContext(ThemeContext);

  const initials = useMemo(() =>
    `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase(),
    [userData?.nom, userData?.prenom]
  );

  const forumOptions = useMemo(() => {
    if (role === "enseignant") {
      return [
        { value: "all", label: "Tous les forums" },
        { value: "teacher-teacher", label: "Enseignants ↔ Enseignants" },
        { value: "teacher-student", label: "Enseignants ↔ Étudiants" }
      ];
    }
    else if (role === "etudiant") {
      return [
        { value: "all", label: "Tous les forums" },
        { value: "student-student", label: "Étudiants ↔ Étudiants" },
        { value: "student-teacher", label: "Étudiants ↔ Enseignants" }
      ];
    }
    // Pour admin ou autres rôles
    return [
      { value: "all", label: "Tous les forums" },
      { value: "teacher-teacher", label: "Enseignants ↔ Enseignants" },
      { value: "teacher-student", label: "Enseignant → Étudiants" },
      { value: "student-student", label: "Étudiants ↔ Étudiants" },
      { value: "student-teacher", label: "Étudiant → Enseignants" },
      { value: "admin-student-forum", label: "Admin → Étudiants" },
      { value: "admin-teacher-forum", label: "Admin → Enseignants" }
    ];
  }, [role]);

  useEffect(() => {
    if (role === "enseignant") {
      setForumTypeToCreate("teacher-student");
    } else if (role === "etudiant") {
      setForumTypeToCreate("student-teacher");
    }
  }, [role]);

  useEffect(() => {
    if (!userData || !token) {
      navigate("/login");
    }
  }, [userData, token, navigate]);

  const triggerNotificationEvent = useCallback(() => {
    window.dispatchEvent(new CustomEvent('new-notification'));
    if (fetchUnreadCount) {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

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

  const fetchForums = useCallback(async () => {
    if (!token) {
      setError("Token manquant - Veuillez vous reconnecter");
      setIsLoading(false);
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/forums/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const forums = await response.json();

      // Filtrage simplifié et corrigé
      const visibleForums = forums;


      const transformedForums = visibleForums.map(forum => ({
        id: forum.id_forum,
        authorInitials: `${forum.utilisateur_nom?.[0] || ""}${forum.utilisateur_prenom?.[0] || ""}`.toUpperCase(),
        authorName: `${forum.utilisateur_prenom || ""} ${forum.utilisateur_nom || ""}`.trim(),
        time: forum.date_creation,
        title: forum.titre_forum,
        likes: forum.nombre_likes || 0,
        commentsCount: forum.nombre_messages || 0,
        type: forum.type,
        userHasLiked: forum.user_has_liked || false,
        forumData: forum,
        isMine: forum.utilisateur === userId,
        comments: [],
        initialMessage: forum.contenu_message || "",
        contenu_forum: forum.contenu_forum || "",
        creatorRole: forum.utilisateur_role || (forum.utilisateur === userId ? role : null)
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
  }, [token, role, userId, API_URL, checkAllForumLikes]);

  useEffect(() => {
    if (token && role) {
      fetchForums();
    }
  }, [token, role, fetchForums]);

  const getFilteredPosts = useCallback(() => {
    let filtered = [...posts];

    if (forumType !== "all") {
      // Gérer les options spéciales du dropdown
      if (role === "enseignant" && forumType === "teacher-student") {
        filtered = filtered.filter(post =>
          post.type === "teacher-student" || post.type === "student-teacher"
        );
      }
      else if (role === "etudiant" && forumType === "student-teacher") {
        filtered = filtered.filter(post =>
          post.type === "teacher-student" || post.type === "student-teacher"
        );
      }
      else {
        filtered = filtered.filter(post => post.type === forumType);
      }
    }

    switch (activeTab) {
      case "popular":
        return [...filtered].sort((a, b) => b.likes - a.likes);
      case "myforums":
        return [...filtered].filter(post => post.isMine)
          .sort((a, b) => new Date(b.time) - new Date(a.time));
      default:
        return [...filtered].sort((a, b) => new Date(b.time) - new Date(a.time));
    }
  }, [posts, forumType, activeTab, role]);

  const finalPosts = useMemo(() => getFilteredPosts(), [getFilteredPosts]);

  // Fonction pour obtenir le label du type de forum
  const getDisplayForumTypeLabel = useCallback((type) => {
    if (role === "enseignant") {
      if (type === "teacher-student" || type === "student-teacher") {
        return "Enseignants ↔ Étudiants";
      }
    } else if (role === "etudiant") {
      if (type === "teacher-student" || type === "student-teacher") {
        return "Étudiants ↔ Enseignants";
      }
    }
    return getForumTypeLabel(type);
  }, [role, getForumTypeLabel]);

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
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      <div className={`
            flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
            ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
          `}>
        {/* En-tête */}
        <header className="flex flex-row justify-between items-center gap-3 sm:gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-blue dark:text-blue-400">{t("community.title")}</h1>
            <p className="mb-6 text-grayc dark:text-gray-400">
              {t("community.subtitle")}
            </p>

          </div>


          {/* Notifications + User */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => window.i18n?.changeLanguage(lang)}
            />
          </div>
        </header>


        <div className="flex-1 ">



          <div className="flex-1 ">


            <PostCreationForm
              forumTypeToCreate={forumTypeToCreate}
              setForumTypeToCreate={setForumTypeToCreate}
              role={role}
              token={token}
              initials={initials}
              userData={userData}
              setPosts={setPosts}
              setError={setError}
              triggerNotificationEvent={triggerNotificationEvent}
              API_URL={API_URL}
              t={t}
            />

            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex justify-end mt-4 mb-8">
              <ModernDropdown
                value={forumType}
                onChange={setForumType}
                options={forumOptions}
                placeholder="Sélectionner un type"
                disabled={isLoading}
              />
            </div>

            <ForumList
              isLoading={isLoading}
              finalPosts={finalPosts}
              forumType={forumType}
              forumOptions={forumOptions}
              posts={posts}
              setPosts={setPosts}
              token={token}
              API_URL={API_URL}
              role={role}
              userId={userId}
              setError={setError}
              triggerNotificationEvent={triggerNotificationEvent}
              getForumTypeLabel={getDisplayForumTypeLabel}
              getForumTypeClasses={getForumTypeClasses}
              formatTimeAgo={formatTimeAgo}
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
