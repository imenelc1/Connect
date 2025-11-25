import React from "react";
import "../../styles/index.css"; 
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation("acceuil");

  return (
    <footer className="bg-surface py-4 flex flex-row  justify-between md:px-80 px-10 text-center">
      
      {/* Texte principal au centre */}
      <p className="text-supp text-center">
        {t("acceuil.copyright")}{" "}
        <span className="text-muted font-semibold">
          {"C{}nnect"}
        </span>{" "}
        {t("acceuil.all_rights")}
      </p>

      {/* Lien vers la politique du site */}
      <p className="text-muted mt-2 md:mt-0 cursor-pointer">
        &gt; {t("acceuil.footer_policy")}
      </p>
    </footer>
  );
}
