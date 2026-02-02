import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Globe } from "lucide-react";
import i18n from "../../i18n";

export default function UserCircle({
  initials, //initials de l'utilisateur affiché dans le cercle
  onToggleTheme, //callback pour changer le theme
  clickable = true //determiner si le menu dropdown peut s'ouvrir
}) {
  const [open, setOpen] = useState(false); //etat de menu dropdown
  const menuRef = useRef(null); //reference de menu pour clic exterieur
  const [currentLang, setCurrentLang] = useState(i18n.language || "fr");

  // Changement de langue
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setCurrentLang(lang);
  };

  // Fermer si clic extérieur
  useEffect(() => {
    if (!clickable) return; //si non clickable, pas besoin d'ecouteur

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false); //fermer le menu si clic en dehors
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clickable]);

  return (
    <div ref={menuRef} className="relative select-none z-50">
      {/* Cercle utilisateur */}
      <div
        onClick={clickable ? () => setOpen(!open) : undefined} //toggle menu
        className={`w-12 h-12 rounded-full bg-grad-1 text-white flex items-center justify-center 
        font-semibold shadow-lg ${
          clickable ? "cursor-pointer hover:opacity-90" : ""
        }`}
      >
        {initials} {/* afficher des initials */}
      </div>

      {/* Dropdown paramètres */}
      {clickable && open && (
        <div
          className="absolute top-16 right-0 w-60 backdrop-blur-md bg-white/80 
          dark:bg-gray-900/80 shadow-2xl rounded-2xl p-3 
          border border-white/30 dark:border-gray-700/40 animate-fadeIn"
        >
          {/* titre du menu */}
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">
            Paramètres
          </h3>

          {/* button de changement du  Thème */}
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl 
            hover:bg-gray-200/60 dark:hover:bg-gray-700/50 transition"
          >
            <span className="flex items-center gap-2">
              <Sun size={16} />
              Changer le thème
            </span>
            <Moon size={16} />
          </button>

          {/* button changement de langue */}
          <button
            onClick={() => changeLanguage("fr")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition 
            hover:bg-gray-200/60 dark:hover:bg-gray-700/50 ${
              currentLang === "fr" ? "bg-primary/20" : ""
            }`}
          >
            <Globe size={16} /> Français
          </button>

          <button
            onClick={() => changeLanguage("en")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition 
            hover:bg-gray-200/60 dark:hover:bg-gray-700/50 ${
              currentLang === "en" ? "bg-primary/20" : ""
            }`}
          >
            <Globe size={16} /> English
          </button>
        </div>
      )}
    </div>
  );
}
