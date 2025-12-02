import React, { useContext } from "react";
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

  return (
    <header className="ml-0 lg:ml-64 p-2 mb-4 flex items-center justify-between text-textc">
      {/* Partie gauche */}
      <div className="flex gap-2 items-center">
        <div className="w-10 h-10 flex items-center justify-center rounded-md text-white text-xl bg-grad-all text-white">
          <FaMedal />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-muted">
            {tBadges("header.title")}
          </h1>
          <p className="text-sm text-grayc mt-1">
            {tBadges("header.subtitle")}
          </p>
        </div>
      </div>

      {/* Partie droite */}
      <div className="flex gap-3 items-center">
        <div className="flex gap-2 ml-5">
          <IaAssistant />
          <HeadMascotte />
        </div>

        <button className="px-4 py-2 rounded-md bg-tertiary text-white font-semibold shadow">
          {tBadges("header.level")}
        </button>

        <UserCircle
          initials={initials}
          onToggleTheme={toggleDarkMode}
          onChangeLang={(lang) => i18n.changeLanguage(lang)}
        />
      </div>
    </header>
  );
}
