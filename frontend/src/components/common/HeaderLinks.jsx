import React, { useState, useContext } from "react";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { FiGlobe } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ThemeContext from "../../context/ThemeContext";

export default function HeaderLinks() {
  const { t, i18n } = useTranslation("acceuil");
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Toggle FR ↔ EN
  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const links = [
    { name: t("acceuil.home") },
    { name: t("acceuil.about") },
    { name: t("acceuil.features") },
  ];

  return (
    <nav className="w-full flex items-center justify-between px-4 md:px-8 py-4 bg-surface relative">

      {/* Desktop Links */}
      <div className="hidden md:flex items-center space-x-6">
        {links.map((link, index) => (
          <button
            key={index}
            className="hover:text-primary transition font-medium"
          >
            {link.name}
          </button>
        ))}

        {/* Theme Toggle */}
        <button onClick={toggleDarkMode}>
          {darkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>

        {/* Language Icon */}
        <button onClick={toggleLanguage} className="hover:text-primary transition">
          <FiGlobe size={20} title="Changer la langue" />

        </button>
      </div>

      {/* Hamburger Menu Button */}
      <div className="md:hidden">
        <button onClick={toggleMenu}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-surface shadow-md flex flex-col items-center py-4 space-y-4 md:hidden z-10">
          {links.map((link, index) => (
            <button
              key={index}
              className="text-lg font-medium hover:text-primary transition"
            >
              {link.name}
            </button>
          ))}

          <div className="flex items-center space-x-4">
            {/* Theme */}
            <button onClick={toggleDarkMode}>
              {darkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            {/* Language */}
            <button onClick={toggleLanguage} className="hover:text-primary transition">
              <FiGlobe size={20} title="Changer la langue" />

            </button>
          </div>
        </div>
      )}
    </nav>
  );
}