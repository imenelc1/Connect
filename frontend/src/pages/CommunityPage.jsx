import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import NotificationBell from "../components/common/NotificationBell";
import PostCreationForm from "../components/community/PostCreationForm";
import ForumList from "../components/community/ForumList";
import ModernDropdown from "../components/common/ModernDropdown";
import Tabs from "../components/common/Tabs";
import i18n from "../i18n";
import { getForumTypeLabel, getForumTypeClasses, formatTimeAgo } from "../utils/formUtils";

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
  const { toggleDarkMode } = useContext(ThemeContext);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  const role = userData?.role;
  const userId = userData?.user_id;

  const initials = useMemo(() =>
    `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase(),
    [userData?.nom, userData?.prenom]
  );

  // Responsivité
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

  // Redirection si pas connecté
  useEffect(() => {
    if (!userData || !token) navigate("/login");
  }, [userData, token, navigate]);

  // Dropdown options
  const forumOptions = useMemo(() => {
    if (role === "enseignant") {
      return [
        { value: "all", label: i18n.t("forums.all") },
        { value: "teacher-teacher", label: i18n.t("forums.teacher-teacher") },
        { value: "teacher-student", label: i18n.t("forums.teacher-student") }
      ];
    } else if (role === "etudiant") {
      return [
        { value: "all", label: t("forums.all") },
        { value: "student-student", label: t("forums.student-student") },
        { value: "student-teacher", label: t("forums.student-teacher") }
      ];
    }
    return [];
  }, [role]);

  useEffect(() => {
    if (role === "enseignant") setForumTypeToCreate("teacher-student");
    if (role === "etudiant") setForumTypeToCreate("student-teacher");
  }, [role]);

  // Fetch forums + gérer likes
  const fetchForums = useCallback(async () => {
    if (!token) return;

    try {
      const API_URL = window.location.hostname === "localhost" ? "http://localhost:8000/api" : "/api";
      const response = await fetch(`${API_URL}/forums/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const forums = await response.json();
      setPosts(forums); // Simplifié pour l'exemple, tu peux reprendre ton filtrage ici
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError(t("errors.loadForums"));
      setIsLoading(false);
    }
  }, [token, t]);

  useEffect(() => { if (token) fetchForums(); }, [token, fetchForums]);

  const getFilteredPosts = useCallback(() => posts, [posts]);
  const finalPosts = useMemo(() => getFilteredPosts(), [getFilteredPosts]);

  if (!userData || !token) return <div>Not connected</div>;

  return (
    <div className="flex min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      {/* Main Content */} 
     <main className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
       
 

       {/* User controls */}
<div className="flex justify-end items-center gap-4 w-full px-0">
  <NotificationBell />
  <UserCircle
    initials={initials}
    onToggleTheme={toggleDarkMode}
    onChangeLang={(lang) => i18n.changeLanguage(lang)}
  />
</div>


        {/* Post Creation */}
        <PostCreationForm
          forumTypeToCreate={forumTypeToCreate}
          setForumTypeToCreate={setForumTypeToCreate}
          role={role}
          token={token}
          initials={initials}
          userData={userData}
          setPosts={setPosts}
          setError={setError}
          API_URL={window.location.hostname === "localhost" ? "http://localhost:8000/api" : "/api"}
          t={t}
        />

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex justify-end mt-4 mb-8">
          <ModernDropdown
            value={forumType}
            onChange={setForumType}
            options={forumOptions}
            placeholder={t("placeholders.selectPlaceholder")}
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
          role={role}
          userId={userId}
          setError={setError}
          getForumTypeLabel={getForumTypeLabel}
          getForumTypeClasses={getForumTypeClasses}
          formatTimeAgo={formatTimeAgo}
          t={t}
        />
      </main>
    </div>
  );
}
