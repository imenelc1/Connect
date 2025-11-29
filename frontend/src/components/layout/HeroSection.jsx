import React from "react";
import { useNavigate } from "react-router-dom";

// Composants UI
import Header from "../common/Header.jsx";
import Text from "../common/Text.jsx";
import Button from "../common/Button.jsx";
import IconeLogoComponent from "../common/IconeLogoComponent.jsx";

// Icône d’envoi
import { FaPaperPlane } from "react-icons/fa";



// Traduction pour la page d’accueil
import { useTranslation } from "react-i18next";


export default function HeroSection() {

  // Navigation
  const navigate = useNavigate();

  // Traduction (espace de noms : "acceuil")
  const { t } = useTranslation("acceuil");

  return (
    <header className="bg-surface min-h-[70vh] md:min-h-[90vh] flex flex-col px-8 md:px-16">

      {/* Header global : logo + options */}
      <Header />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-15 md:mt-20">

        {/* Section texte + boutons */}
        <div className="max-w-xl md:max-w-2xl space-y-6">

          {/* Texte marketing / titre principal */}
          <Text />

          {/* Boutons d’action */}
          <div className="flex flex-row space-x-4">

            {/* Bouton : Commencer */}
            <Button
              variant="heroPrimary"
              onClick={() => navigate("/choice")}
              className="px-6 sm:px-8 md:px-12 py-2 bg-grad-1 text-white rounded-xl shadow flex items-center gap-2 mb-2"
            >
              <FaPaperPlane size={16} />
              {t("acceuil.button_start")}
            </Button>

            {/* Bouton : Voir comment ça marche */}
            <Button
              variant="heroOutline"
              className="px-6 sm:px-8 md:px-12 py-2 border border-primary text-primary bg-white rounded-xl hover:bg-bg mb-2"
            >
              {t("acceuil.button_work")}
            </Button>
          </div>
        </div>

        {/* Logo / illustration à droite */}
        <IconeLogoComponent size="w-40 h-40" className="hidden md:block"/>
      </div>
    </header>
  );
}