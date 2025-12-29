import { useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import { FiSend } from "react-icons/fi";
import { Loader, Heart, Trash2, Send, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

import Navbar from "../components/common/NavBar";
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

  const navigate = useNavigate();
  const { t } = useTranslation("community");
  const { fetchUnreadCount } = useNotifications();

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  const role = userData?.role;
  const userId = userData?.user_id;

  const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:8000/api"
    : "/api";

  const { toggleDarkMode } = useContext(ThemeContext);

  const initials = useMemo(() =>
    `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase(),
    [userData?.nom, userData?.prenom]
  );

  const forumOptions = useMemo(() => {
    // OPTIONS EXACTES COMME DEMANDÉ :

    if (role === "enseignant") {
      return [
        { value: "all", label: t("forums.all") },
        { value: "teacher-teacher", label: t("forums.teacher-teacher") },
        { value: "teacher-student", label: t("forums.teacher-teacher") }  // Regroupe teacher-student + student-teacher
      ];
    }
    else if (role === "etudiant") {
      return [
        { value: "all", label: "Tous les forums" },
        { value: "student-student", label: t("forums.student-student") },
        { value: "student-teacher", label: t("forums.student-student") }  // Regroupe teacher-student + student-teacher
      ];
    }

    // Pour admin ou autres rôles (au cas où)
    return [
      { value: "all", label: t("forums.all") },
      { value: "teacher-teacher", label: t("forums.teacher-teacher") },
      { value: "teacher-student", label: t("forums.teacher-student") },
      { value: "student-student", label: t("forums.student-student") },
      { value: "student-teacher", label: t("forums.student-teacher") }
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
          // Erreur vérification like forum 
          console.error(`${t("errors.likeError")} forum ${forum.id}:`, error);
        }
        return forum;
      })
    );

    return forumsWithLikes;
  }, [token, API_URL]);

  const fetchForums = useCallback(async () => {
    if (!token) {
      // "Token manquant - Veuillez vous reconnecter"
      setError(t("errors.Tokerror"));
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

      // Filtrer selon les règles de visibilité
      const visibleForums = forums.filter(forum => {
        const forumType = forum.type;
        const creatorRole = forum.utilisateur_role || (forum.utilisateur === userId ? role : null);

        if (role === "etudiant") {
          // Étudiant voit :
          // 1. Forums envoyés aux étudiants (teacher-student, student-student)
          // 2. Forums envoyés aux enseignants SEULEMENT si créé par étudiant (student-teacher)
          if (forumType === "teacher-student" || forumType === "student-student") {
            return true;
          }
          if (forumType === "student-teacher") {
            return creatorRole === "etudiant";
          }
          return false; // teacher-teacher invisible
        }
        else if (role === "enseignant") {
          // Enseignant voit :
          // 1. Forums envoyés aux enseignants (teacher-teacher, student-teacher)
          // 2. Forums envoyés aux étudiants SEULEMENT si créé par enseignant (teacher-student)
          if (forumType === "teacher-teacher" || forumType === "student-teacher") {
            return true;
          }
          if (forumType === "teacher-student") {
            return creatorRole === "enseignant";
          }
          return false; // student-student invisible
        }

        return true; // admin voit tout
      });

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
      //  "Impossible de charger les forums. Vérifiez votre connexion.
      console.error(t("errors.forumError"), error);
      setError();
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, role, userId, API_URL, checkAllForumLikes]);

  useEffect(() => {
    if (token && role) {
      fetchForums();
    }
  }, [token, role, userId, API_URL, checkAllForumLikes]);

  const getFilteredPosts = useCallback(() => {
    let filtered = [...posts];

    if (forumType !== "all") {
      // Gérer les options spéciales du dropdown
      if (role === "enseignant" && forumType === "teacher-student") {
        // Pour enseignant : "Enseignants ↔ Étudiants" = teacher-student + student-teacher
        filtered = filtered.filter(post =>
          post.type === "teacher-student" || post.type === "student-teacher"
        );
      }
      else if (role === "etudiant" && forumType === "student-teacher") {
        // Pour étudiant : "Étudiants ↔ Enseignants" = teacher-student + student-teacher
        filtered = filtered.filter(post =>
          post.type === "teacher-student" || post.type === "student-teacher"
        );
      }
      else {
        // Filtre normal par type exact
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

  // Fonction pour obtenir le label du type de forum dans l'affichage des posts
  const getDisplayForumTypeLabel = useCallback((type) => {
    if (role === "enseignant") {
      if (type === "teacher-student" || type === "student-teacher") {
        return t("forums.teacher-student");
      }
    } else if (role === "etudiant") {
      if (type === "teacher-student" || type === "student-teacher") {
        return t("forums.student-teacher");
      }
    }
    return getForumTypeLabel(type);
  }, [role, getForumTypeLabel]);

  if (!userData || !token) {
    return (
      <div className="flex min-h-screen bg-background dark:bg-gray-900 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">   {t("community.notConnected")}</h1>
          <p className="mb-6 dark:text-gray-300">   {t("community.pleaseLogin")}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue text-white px-6 py-2 rounded-full hover:bg-blue-dark transition"
          >
            {/* se connecter */}
            {t("community.login")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background dark:bg-gray-900">
      <Navbar />

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

      <div className="flex-1 ml-56 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-blue dark:text-blue-400">{t("community.title")}</h1>
          <p className="mb-6 text-grayc dark:text-gray-400">
            {t("community.subtitle")}
          </p>
        </header>

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
            placeholder={t("forums.select")}
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
          getForumTypeLabel={getDisplayForumTypeLabel}  // Utiliser la fonction adaptée
          getForumTypeClasses={getForumTypeClasses}
          formatTimeAgo={formatTimeAgo}
          t={t}
        />
      </div>
    </div>
  );
}
