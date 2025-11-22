import React from "react";
import "../../styles/index.css"; 
import { useTranslation } from "react-i18next";

export default function Footer() {
     const { t } = useTranslation("acceuil");
  return (
     <footer  className="bg-surface py-4 flex flex-col md:flex-row
        items-center justify-between
        px-80 py-4
        text-center md:text-center
        "
      
    >
      {/* Texte principal au centre */}
      <p className= "text-supp text-center sm:text-center md:text-center lg:text-center" >
      {t("acceuil.copyright")} {" "}
        <span className="text-muted font-semibold" >
         {"C{}nnect"}
        </span>{" "}
       {t("acceuil.all_rights")}
      </p>

      {/* Lien à droite */}
      <p className="text-muted mt-2 md:mt-0 cursor-pointer" >
        &gt; {t("acceuil.footer_policy")}
      </p>
    </footer>
  );
}

