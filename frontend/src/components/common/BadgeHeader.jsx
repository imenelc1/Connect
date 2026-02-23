import React, { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaMedal } from "react-icons/fa";
import HeadMascotte from "../ui/HeadMascotte";
import IaAssistant from "../ui/IaAssistant";
import UserCircle from "../common/UserCircle";
import ThemeContext from "../../context/ThemeContext";

export default function BadgeHeader({ stats }) {
  const { t: tBadges } = useTranslation("badges");
  const { i18n } = useTranslation(); // Pas besoin du namespace "courses" ici
  const { toggleDarkMode } = useContext(ThemeContext);

 
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);
  const [isMobile, setIsMobile] = useState(false);

  return (
    <header className="p-2 mb-4 text-textc transition-all duration-300">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* TITRE */}
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <div className="hidden sm:flex w-10 h-10 items-center justify-center rounded-md bg-grad-all text-muted text-xl">
            <FaMedal />
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-lg sm:text-2xl font-bold text-muted">
              {tBadges("header.title")}
            </h1>
            <p className=" text-sm text-grayc mt-1">
              {tBadges("header.subtitle")}
            </p>
          </div>
        </div>

        {/* BOUTONS */}
        <div className="flex justify-center sm:justify-end items-center gap-2 flex-wrap">
         

          <button className="px-4 py-1 sm:px-4 sm:py-2 rounded-md bg-tertiary text-white font-semibold text-xs sm:text-sm">
            {stats ? `Level ${stats.level}` : tBadges("header.level")}
          </button>

          <UserCircle
            initials={initials}
            onToggleTheme={toggleDarkMode}
            onChangeLang={(lang) => i18n.changeLanguage(lang)}
            className="w-8 h-8"
          />
        </div>
      </div>
    </header>
  );
}
