
import React from "react";
import { useTranslation } from "react-i18next";
import "../../styles/index.css";

export default function Text() {
  // Récupération de la fonction de traduction pour le namespace "acceuil"
  const { t } = useTranslation("acceuil");

  return (
    <div className="space-y-6">
      {/* ----------------------   Grand titre ---------------------- */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-3d">
        <span className="text-muted">{t("acceuil.title_part1")}</span>{" "}
        <span className="text-supp text-3d">{t("acceuil.title_part2")}</span>{" "}
        <span className="text-muted">{t("acceuil.title_part3")}</span>{" "}
        <span className="text-supp text-3d">{t("acceuil.title_part4")}</span>{" "}
        <span className="text-muted">{t("acceuil.title_part5")}</span>
      </h1>

      {/* ---------------------- Texte descriptif ---------------------- */}
      <p className="text-textc text-base sm:text-lg md:text-xl leading-relaxed max-w-full md:max-w-lg font-normal">
        {t("acceuil.p_heroS")}
      </p>
    </div>
  );
}
