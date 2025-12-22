import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import { MessageSquare, TrendingUp, User, Plus } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import ContentSearchBar from "../components/common/ContentSearchBar";

export default function ForumManagement() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("ForumManagement");
  const { toggleDarkMode } = useContext(ThemeContext);
  const [search, setSearch] = useState("");
  
  // États
  const [createModal, setCreateModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Données des forums
  const forums = [
    { title: t("ForumManagement.GeneralD"), description: t("ForumManagement.Talk"), threads: 456, posts: 2341, members: 1234 },
    { title: t("ForumManagement.Homework"), description: t("ForumManagement.gethelp"), threads: 789, posts: 3056, members: 987 },
    { title: t("ForumManagement.ProjetShowcas"), description: t("ForumManagement.share"), threads: 32, posts: 874, members: 654 },
    { title: t("ForumManagement.AlgorithmD"), description: t("ForumManagement.deepDive"), threads: 345, posts: 1987, members: 789 },
    { title: t("ForumManagement.career"), description: t("ForumManagement.Careerp"), threads: 76, posts: 765, members: 532 },
    { title: t("ForumManagement.Bug"), description: t("ForumManagement.Report"), threads: 87, posts: 234, members: 124 },
  ];

  // Effets
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

  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      {/* Main Content */}
      <main className={`flex-1 p-6 pt-10 space-y-5 transition-all duration-300
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}`}>
        
        {/* Header - Inchangé */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("ForumManagement.forumM")}</h1>
            <p className="text-gray">{t("ForumManagement.Managediscussion")}</p>
          </div>

          <div className="flex gap-4 items-center">
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
        </div>

        {/* Search bar - Inchangé */}
        <div className="relative mb-6 sm:mb-10 w-full max-w-md">
          <ContentSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full"
          />
        </div>

        {/* FORUM LIST - Seules les cartes sont modifiées pour mobile */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {forums.map((forum, i) => (
            <div
              key={i}
              className="bg-grad-2  rounded-xl p-4 sm:p-6 
                         flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4"
            >
              {/* LEFT PART - Plus compact sur mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
                {/* Icône plus petite sur mobile */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl 
                              bg-grad-3 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-muted" strokeWidth={2} />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <div className="flex-1">
                    {/* Titre plus petit sur mobile */}
                    <h3 className="text-base sm:text-xl font-semibold text-muted">
                      {forum.title}
                    </h3>
                    
                    {/* Description plus petite sur mobile */}
                    <p className="text-grayc/80 text-sm sm:text-base mt-1">
                      {forum.description}
                    </p>

                    {/* Stats - Texte plus petit sur mobile */}
                    <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center 
                                  gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray/10">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span>{forum.threads} {t("ForumManagement.threads")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span>{forum.posts} {t("ForumManagement.posts")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span>{forum.members} {t("ForumManagement.memebers")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT BUTTON - Bouton plus petit sur mobile */}
              <div className="w-full sm:w-auto mt-3 sm:mt-0 flex justify-end">
                <Button 
                  variant="manage"
                  className="text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl w-full sm:w-auto justify-center"
                >
                  {t("ForumManagement.ButtonManage")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}