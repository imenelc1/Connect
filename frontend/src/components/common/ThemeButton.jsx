import React, { useContext } from "react";
import { Sun, Moon } from "lucide-react";
import ThemeContext from "../../context/ThemeContext";

export default function ThemeButton() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleDarkMode}
      className="
      "
    >
      {darkMode ? (
        <Sun className="w-6 h-6 text-yellow-400" />
      ) : (
        <Moon className="w-6 h-6 text-primary" />
      )}
    </button>
  );
}
