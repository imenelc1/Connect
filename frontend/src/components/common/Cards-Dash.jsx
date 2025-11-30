import { useTranslation } from "react-i18next";
import React from "react";
import "../../styles/index.css";

export default function Cards({ icon, title, text, value, bg }) {
  const { t } = useTranslation("Dashboard");

  return (
    <div
      className={`
        w-78 h-52 rounded-3xl shadow-md p-6 flex flex-col justify-between
        ${bg ? bg : "bg-surface text-title-card"}
      `}
    >
      {/* Zone haute : texte + icône */}
      <div className="flex w-full justify-between">
        <p className="text-grad-2 opacity-90 text-xl font-semibold leading-tight">
          {t(text)}
        </p>

        <div className="text-xl opacity-90 text-supp">
          {icon && React.cloneElement(icon, { size: 30 })}
        </div>
      </div>

      {/* Zone basse : ligne + valeur fixée */}
      <div className="flex w-full items-center justify-between">
        <div className="w-1 h-10 bg-grad-1 rounded-full opacity-50"></div>

        <p className="text-5xl font-bold text-muted leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}
