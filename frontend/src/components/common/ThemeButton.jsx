
import React, { useContext } from "react";
import { Sun, Moon } from "lucide-react"; // Icônes
import ThemeContext from "../../context/ThemeContext";

export default function ThemeButton() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleDarkMode} // 🔄 Action de bascule
      className=""
    >
      {/* Affiche une icône différente selon le mode */}
      {darkMode ? (
        <Sun className="w-6 h-6 text-yellow-400" /> // Mode sombre -> Soleil
      ) : (
        <Moon className="w-6 h-6 text-primary" />  // Mode clair -> Lune
      )}
    </button>
  );
}
