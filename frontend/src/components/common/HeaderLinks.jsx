import React, { useState, useContext } from "react";
import { NavLink } from "react-router-dom";  // <-- OBLIGATOIRE
import { FiSun, FiMoon, FiMenu, FiX, FiGlobe } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ThemeContext from "../../context/ThemeContext";
import AuthContext from "../../context/AuthContext"; // <-- AJOUT

export default function HeaderLinks() {
  const { t, i18n } = useTranslation("acceuil");
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  // 🔥 Infos utilisateur
  const { user } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  const links = [
    { name: t("acceuil.home") },
    { name: t("acceuil.about") },
    { name: t("acceuil.features") },
  ];

  // 🔥 Chemin Dashboard selon rôle
  const dashboardLink =
    user?.role === "enseignant" ? "/dashboard-ens" : "/dashboard-etu";

  return (
    <nav className="w-full flex items-center justify-between px-4 md:px-16 lg:px-16 py-4 bg-surface relative">

      {/* ▸ VERSION DESKTOP */}
      <div className="hidden md:flex items-center space-x-10 lg:space-x-12">

        {links.map((link, index) => (
          <button
            key={index}
            className="hover:text-primary transition font-medium whitespace-nowrap"
          >
            {link.name}
          </button>
        ))}

        {/* 🔥 Dashboard visible si connecté */}
        {user && (
          <NavLink to={dashboardLink}>
            <button className="hover:text-primary transition font-medium whitespace-nowrap">
              Dashboard
            </button>
          </NavLink>
        )}

        <button onClick={toggleDarkMode}>
          {darkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>

        <button onClick={toggleLanguage} className="hover:text-primary transition">
          <FiGlobe size={20} title="Changer la langue" />
        </button>
      </div>

      {/* ▸ Toggle hamburger */}
      <div className="md:hidden">
        <button onClick={toggleMenu}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* ▸ MENU MOBILE */}
      {menuOpen && (
        <div className="absolute top-full left-0 bg-surface/90 shadow-lg flex flex-col items-center py-4 space-y-4 md:hidden rounded-b-2xl">

          {links.map((link, index) => (
            <button
              key={index}
              className="text-lg font-medium hover:text-primary transition w-full text-center py-2 whitespace-nowrap"
            >
              {link.name}
            </button>
          ))}

          {/* 🔥 Dashboard mobile */}
          {user && (
            <NavLink to={dashboardLink}>
              <button className="text-lg font-medium hover:text-primary transition w-full text-center py-2 whitespace-nowrap">
                Dashboard
              </button>
            </NavLink>
          )}

          <div className="flex items-center space-x-4 mt-2">
            <button onClick={toggleDarkMode}>
              {darkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            <button onClick={toggleLanguage}>
              <FiGlobe size={20} />
            </button>
          </div>

        </div>
      )}
    </nav>
  );
}
