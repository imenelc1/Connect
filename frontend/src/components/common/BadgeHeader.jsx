import React, { useContext,useState,useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaMedal } from "react-icons/fa";
import HeadMascotte from "../ui/HeadMascotte";
import IaAssistant from "../ui/IaAssistant";
import UserCircle from "../common/UserCircle";
import ThemeContext from "../../context/ThemeContext";

export default function BadgeHeader() {
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
    

  return (
<header className="p-2 mb-4 flex items-center justify-between text-textc transition-all duration-300">
  {/* Partie gauche (Icône + titre) */}
  <div
    className={`flex gap-2 items-center transition-all duration-300`}
    style={{
      marginLeft: sidebarCollapsed ? "5rem" : "18rem",
    }}
  >
    {/* Icône */}
    <div className="w-10 h-10 flex items-center justify-center rounded-md text-white text-xl bg-grad-all transition-all duration-300 hidden sm:flex">
      <FaMedal />
    </div>

    {/* Titre + description */}
    <div className="transition-all duration-300 hidden sm:block">
      <h1 className="text-2xl font-bold text-muted">
        {tBadges("header.title")}
      </h1>
      <p className="text-sm text-grayc mt-1">
        {tBadges("header.subtitle")}
      </p>
    </div>
  </div>

  {/* Partie droite */}
  <div className="flex gap-2 items-center ml-0 sm:ml-0">
    {/* Assistant + mascotte */}
    <div className="flex gap-1 sm:gap-2 mr-[120px] sm:mr-0 md:mr-0">
      <IaAssistant className="w-6 h-6 sm:w-auto" />
      <HeadMascotte className="w-6 h-6 sm:w-auto" />
    </div>

    {/* Bouton level */}
    <button className="px-5 py-1 sm:px-4 sm:py-2 rounded-md bg-tertiary text-white font-semibold shadow text-xs sm:text-sm">
      {tBadges("header.level")}
    </button>

    {/* UserCircle */}
    <UserCircle
      initials={initials}
      onToggleTheme={toggleDarkMode}
      onChangeLang={(lang) => i18n.changeLanguage(lang)}
      className="w-8 h-8 sm:w-auto sm:h-auto"
    />
  </div>
</header>


  );
}
