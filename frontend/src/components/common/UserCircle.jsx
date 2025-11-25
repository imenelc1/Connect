import React, { useState, useRef, useEffect } from "react";

export default function UserCircle({ initials, onToggleTheme, onChangeLang }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Fermer quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="fixed top-6 right-6 z-50">
      {/* Circle button */}
      <div
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-primary text-white 
                   flex items-center justify-center font-semibold shadow-lg 
                   cursor-pointer hover:opacity-90 transition"
      >
        {initials}
      </div>

      {/* Dropdown menu */}
      {open && (
        <div
          className="mt-3 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 border
                     animate-[fadeIn_0.15s_ease-out]"
        >
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center px-3 py-2 rounded-lg 
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Changer thème
          </button>

          <button
            onClick={() => onChangeLang("fr")}
            className="w-full flex items-center px-3 py-2 rounded-lg 
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Langue : Français
          </button>

          <button
            onClick={() => onChangeLang("en")}
            className="w-full flex items-center px-3 py-2 rounded-lg 
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Langue : English
          </button>

          {/* Tu peux ajouter autant d’options que tu veux */}
        </div>
      )}
    </div>
  );
}
