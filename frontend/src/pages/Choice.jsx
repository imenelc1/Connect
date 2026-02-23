import React, { useContext } from "react";

// Icônes provenant de la librairie lucide-react
import { GraduationCap, UserRound } from "lucide-react";

// Composants personnalisés
import IconeLogoComponent from '../components/common/IconeLogoComponent';
import Button from '../components/common/Button';
import LogoComponent from "../components/common/LogoComponent";

// Traduction (i18next)
import { useTranslation } from "react-i18next";

// Navigation entre routes (React Router)
import { useNavigate } from "react-router-dom";



// Styles globaux
import "../styles/index.css";

function Choice() {

  // Hook pour naviguer vers d'autres pages
  const navigate = useNavigate();

  // Hook de traduction
  const { t } = useTranslation();

  return (
    <div className="Choice flex flex-col h-screen bg-grad-5">

      {/* Header : logo + bouton thème */}
      <div className="flex flex-row gap-[1000px]">
        <header className="p-2">
          <LogoComponent />
        </header>

        {/* Bouton pour activer/désactiver le dark mode */}
      </div>

      {/* Contenu principal */}
      <main className="flex flex-col items-center justify-center flex-1 gap-16 text-center px-4">

        {/* Logo animé / icône principale */}
        <IconeLogoComponent size="w-28 h-28" />

        {/* Texte descriptif venant du fichier de traduction */}
        <p className="font-poppins text-l sm:text-xl md:text-2xl text-grayc">
          {t("choice.title")} <br />
          {t("choice.title_contd")}
        </p>

        {/* Boutons de choix (instructeur ou étudiant) */}
        <div className="flex gap-10 md:gap-16">

          {/* Choix : Instructeur */}
          <Button
            onClick={() => navigate("/signup/instructor")}
            className="shadow-md rounded-2xl font-semibold font-poppins bg-grad-1 text-white flex items-center justify-center gap-3 px-6 py-4"
          >
            <UserRound /> {t("choice.instructor")}
          </Button>

          {/* Choix : Étudiant */}
          <Button
            onClick={() => navigate("/signup/student")}
            className="shadow-md rounded-2xl font-semibold font-poppins bg-grad-1 text-white flex items-center justify-center gap-3 px-6 py-4"
          >
            <GraduationCap /> {t("choice.student")}
          </Button>
        </div>
      </main>
    </div>
  );
}

export default Choice;