import React from "react";
import { FiSun, FiGlobe } from "react-icons/fi";

export default function NavLinks() {
  return (
    // Liste de navigation (utilisée dans d’autres pages)
    <ul className="flex items-center space-x-8 text-[var(--color-text-main)] font-medium">

      {/* Liens simples */}
      <li>
        <a href="/" className="text-[var(--color-text-main)] hover:opacity-80 transition">
          Home
        </a>
      </li>

      <li>
        <a href="#impact" className="text-[var(--color-text-main)] hover:opacity-80 transition">
          Impact
        </a>
      </li>

      <li>
        <a href="#services" className="text-[var(--color-text-main)] hover:opacity-80 transition">
          Services
        </a>
      </li>

      {/* Icône pour changer le thème (statique ici) */}
      <li className="cursor-pointer hover:opacity-80 transition">
        <FiSun size={18} />
      </li>

      {/* Icône pour changer la langue (statique ici) */}
      <li className="cursor-pointer hover:opacity-80 transition">
        <FiGlobe size={20} title="Changer la langue" />
      </li>
    </ul>
  );
}
