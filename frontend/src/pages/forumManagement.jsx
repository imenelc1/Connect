import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import { MessageSquare, TrendingUp, User, Plus } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import ContentSearchBar from "../components/common/ContentSearchBar";

export default function ForumManagement() {
  const navigate = useNavigate();
  const { t } = useTranslation("ForumManagement");
  const { toggleDarkMode } = useContext(ThemeContext);

  // =========================
  // STATES
  // =========================
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================
  // FETCH FORUMS
  // =========================
  useEffect(() => {
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

        // 🔥 important : éviter JSON si backend renvoie HTML
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Erreur serveur");
        }

        const data = await res.json();

        // 🔁 mapping backend → frontend
        const formattedForums = data.map((forum) => ({
          id: forum.id_forum,
          title: forum.titre_forum,
          description: forum.type, // ou "" si tu veux
          threads: forum.nombre_messages,
          posts: 0, // pas fourni par backend
          members: forum.nombre_likes,
        }));


        setForums(formattedForums);
      } catch (err) {
        console.error("Erreur chargement forums :", err);
        setError("Impossible de charger les forums");
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
  }, []);

  // =========================
  // RESPONSIVE EFFECTS
  // =========================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleSidebarChange = (e) => {
      setSidebarCollapsed(e.detail);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  // =========================
  // RENDER
  // =========================
  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <Navbar />

      {/* Main */}
      <main
        className={`flex-1 p-6 pt-10 space-y-5 transition-all duration-300
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">
              {t("ForumManagement.forumM")}
            </h1>
            <p className="text-gray">
              {t("ForumManagement.Managediscussion")}
            </p>
          </div>

          <Button
            text={
              <span className="flex items-center gap-2">
                <Plus size={18} />
                {t("ForumManagement.createF")}
              </span>
            }
            variant="primary"
            className="!w-auto px-6 py-2 rounded-xl"
            onClick={() => setCreateModal(true)}
          />
        </div>

        {/* Search */}
        <div className="relative mb-6 sm:mb-10 w-full max-w-md">
          <ContentSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full"
          />
        </div>

        {/* STATES */}
        {loading && (
          <p className="text-gray text-center">Chargement...</p>
        )}

        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        {/* FORUM LIST */}
        {!loading && !error && (
          <div className="flex flex-col gap-4 sm:gap-5">
            {forums.map((forum) => (
              <div
                key={forum.id}
                className="bg-grad-2 rounded-xl p-4 sm:p-6
                           flex flex-col sm:flex-row sm:justify-between gap-4"
              >
                {/* LEFT */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-grad-3 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-muted" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-muted">
                      {forum.title}
                    </h3>
                    <p className="text-gray mt-1">{forum.description}</p>

                    <div className="flex gap-4 mt-3 text-sm text-gray">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {forum.threads} {t("ForumManagement.threads")}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        {forum.posts} {t("ForumManagement.posts")}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {forum.members} {t("ForumManagement.memebers")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <Button
                  variant="manage"
                  className="self-end sm:self-center"
                >
                  {t("ForumManagement.ButtonManage")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
