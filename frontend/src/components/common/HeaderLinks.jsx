// import React from "react";
// import { FiSun, FiMoon } from "react-icons/fi";
// import { MdTranslate } from "react-icons/md";
// import { useTranslation } from "react-i18next";
// import { useNavigate } from "react-router-dom";


// export default function HeaderLinks() {
//   const navigate = useNavigate();
//     const { t, i18n } = useTranslation();
//   const changeLanguage = () => {
//     i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
//   };
//   return (
//    <ul className="flex items-center space-x-8 text-textc font-medium">
//   <li>
//     <a href="/" className="text-textc hover:opacity-80  transition">
//       {t("acceuil.home")}
//     </a>
//   </li>
//   <li>
//     <a href="#About" className="text-textc hover:opacity-80  transition ">
//     {t("acceuil.about")}
//     </a>
//   </li>
//   <li>
//     <a href="#Features" className="text-textc hover:opacity-80  transition">
//   {t("acceuil.features")}
//     </a>
//   </li>

//   {/* toggle theme */}
//   <li className="cursor-pointer text-textc hover:opacity-80  transition">
//     <FiSun size={20} />
//   </li>
//   <li className="cursor-pointer text-textc hover:opacity-80  transition">
// <MdTranslate
//   size={20}
//   title="Changer la langue"
//   onClick={changeLanguage}
// />

// </li>
// </ul>




//   );
// }
 import React, { useState } from "react";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function HeaderLinks() {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
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
        <button onClick={toggleDarkMode} className="hover:text-primary transition">
          {darkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>

        {/* Language */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => changeLanguage("en")}
            className={`px-2 py-1 rounded ${i18n.language === "en" ? "bg-primary text-white" : "hover:bg-gray-200"}`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage("fr")}
            className={`px-2 py-1 rounded ${i18n.language === "fr" ? "bg-primary text-white" : "hover:bg-gray-200"}`}
          >
            FR
          </button>
        </div>
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
            <button onClick={toggleDarkMode}>
              {darkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-2 py-1 rounded ${i18n.language === "en" ? "bg-primary text-white" : "hover:bg-gray-200"}`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage("fr")}
                className={`px-2 py-1 rounded ${i18n.language === "fr" ? "bg-primary text-white" : "hover:bg-gray-200"}`}
              >
                FR
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
