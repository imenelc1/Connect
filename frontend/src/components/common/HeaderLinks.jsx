import React, { useState, useContext } from "react";
import { FiSun, FiMoon, FiMenu, FiX, FiGlobe } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ThemeContext from "../../context/ThemeContext";

export default function HeaderLinks() {
  // Traduction (namespace : acceuil)
  const { t, i18n } = useTranslation("acceuil");

  // Mode thème : clair / sombre
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  // État du menu mobile
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Permet de changer la langue (FR ↔ EN)
  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  // Liens du header
  const links = [
    { name: t("acceuil.home") },
    { name: t("acceuil.about") },
    { name: t("acceuil.features") },
  ];

  return (
    <nav className="w-full flex items-center justify-between px-4 md:px-16 lg:px-16 py-4 bg-surface relative">

      {/* Version Desktop : visible à partir de md */}
      <div className="hidden md:flex items-center space-x-10 lg:space-x-12">

        {/* Liens statiques */}
        {links.map((link, index) => (
        <button
          key={index}
          className="hover:text-primary transition font-medium whitespace-nowrap"
        >
        {link.name}
        </button>

        ))}

        {/* Bouton thème (dark/light) */}
        <button onClick={toggleDarkMode}>
          {darkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>

        {/* Bouton pour changer la langue */}
        <button onClick={toggleLanguage} className="hover:text-primary transition">
          <FiGlobe size={20} title="Changer la langue" />
        </button>
      </div>

      {/* Bouton menu hamburger mobile */}
      <div className="md:hidden">
        <button onClick={toggleMenu}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
  <div className="absolute top-full left-0  bg-surface/90 shadow-lg flex flex-col items-center py-4 space-y-4 md:hidden rounded-b-2xl">
    
    {/* Liens mobiles */}
    {links.map((link, index) => (
      <button
        key={index}
        className="text-lg font-medium hover:text-primary transition w-full text-center py-2 whitespace-nowrap"
      >
        {link.name}
      </button>
    ))}

    {/* Options thème + langue */}
    <div className="flex items-center space-x-4 mt-2">
      <button onClick={toggleDarkMode}>
        {darkMode ? <FiMoon size={20}/> : <FiSun size={20}/>}
      </button>
      <button onClick={toggleLanguage}>
        <FiGlobe size={20}/>
      </button>
    </div>
  </div>
)}

    </nav>
  );
}
