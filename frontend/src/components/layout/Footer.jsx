import React from "react";
import "../../styles/index.css"; 
import { useTranslation } from "react-i18next";

export default function Footer() {
    const { t } = useTranslation();
  return (
     <footer   className="bg-surface  w-screen py-4 flex flex-col md:flex-row
        items-center justify-between
        px-6 py-4
        text-center md:text-center
        "
      
    >
      {/* Texte principal au centre */}
      <p className= " text-secondary md:text-center m-0" >
      {t("acceuil.copyright")} {" "}
        <span className="text-primary font-semibold" >
         {"C{}nnect"}
        </span>{" "}
       {t("acceuil.all_rights")}
      </p>

      {/* Lien à droite */}
      <p className="text-secondary mt-2 md:mt-0 cursor-pointer" >
        &gt; {t("acceuil.footer_policy")}
      </p>
    </footer>
  );
}

