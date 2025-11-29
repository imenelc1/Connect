
import { useTranslation } from "react-i18next";
import React from "react";
import "../../styles/index.css";

export default function Cards({ icon, title, text, gradient }) {
  const { t } = useTranslation("acceuil"); // Traductions

  return (
    <div
      className={`
        w-78 rounded-3xl shadow-md p-4 p-6 flex flex-col items-start gap-4 transition
        ${gradient ? "bg-grad-1 text-white" : "bg-surface text-title-card"}
      `}
    >
      {/* Cercle contenant l’icône */}
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center shadow-md text-3xl
          ${gradient ? "bg-white text-primary" : "bg-primary text-white"}
        `}
      >
        {icon}
      </div>

      {/* Titre de la carte */}
      <h3 className="text-base font-bold uppercase whitespace-nowrap text-text">
        {t(title)}
      </h3>

      {/* Texte descriptif */}
      <p className="text-left text-base opacity-90 text-text">
        {t(text)}
      </p>
    </div>
  );
}
