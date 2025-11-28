import React, { useContext } from "react";
import "../../styles/index.css";// Import des styles globaux
import { useTranslation } from "react-i18next";// Pour traduire les textes
import ThemeContext from "../../context/ThemeContext";// Pour récupérer le mode sombre
// Composant NavSetting pour les onglets de la page Setting
export default function NavSetting({ active = "profile", onChange }) {
   // Hook de traduction
  const { t } = useTranslation("Setting");
  // Définition des onglets avec leur id et texte traduit
  const tabs = [
    { id: "profile", label: t("Setting.Profile") },
    { id: "preferences", label: t("Setting.Preferences") },
    { id: "account", label: t("Setting.Account") },
  ];
   // Récupération du mode sombre depuis le contexte

   const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
      // Conteneur principal centré
    <div className="w-full mt-6">
      <ul className="flex overflow-x-auto sm:overflow-x-visible bg-grad-7 rounded-full shadow-sm p-1 
                     gap-4 sm:gap-4 md:gap-6 h-12 sm:h-16 justify-center sm:justify-center w-full max-w-[870px] sm:max-w-[870px] mx-auto">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={`flex-shrink-0 px-4 sm:px-6 py-2 rounded-full cursor-pointer font-medium transition 
                        ${active === tab.id ? "bg-white shadow-md" : " hover:bg-grad-3 "}`}
            onClick={() =>  onChange(tab.id)}
          >
            {active === tab.id ? (
              <span className="bg-clip-text text-transparent bg-grad-1 text-lg sm:text-2xl">
                {tab.label}
              </span>
            ) : (
              <span className="text-white text-lg sm:text-2xl">{tab.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
