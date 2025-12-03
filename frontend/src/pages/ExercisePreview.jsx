import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import SideNavbar from "../components/common/NavBar";
import { PlayCircle, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeButton from "../components/common/ThemeButton";
import ThemeContext from "../context/ThemeContext";
import Topbar from "../components/common/TopBar";
import { FileText, Activity } from "lucide-react";


export default function ExercisePreview() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("exercisePreview");

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const { toggleDarkMode } = useContext(ThemeContext);

  const exerciseSteps = [
  { label: t("exercises.info"), icon: FileText, route: "/new-exercise" },
  { label: t("exercises.preview"), icon: Activity, route: "/exercise-preview" }
];

  return (
    <div className="flex w-full min-h-screen bg-surface">
      
      {/* SIDEBAR */}
      <SideNavbar
        links={[]}
        userName="Andrew Smith"
        userRole="Product Designer"
        userInitials="A.S"
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col p-6 ml-72">
        
          <div>
             <ThemeButton onClick={toggleDarkMode} />
         <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg text-sm"
            >
              <Globe size={16} /> {i18n.language.toUpperCase()}
            </button>
          </div>
      
        {/* TOP BAR */}
        <Topbar steps={exerciseSteps} activeStep={2} className="flex justify-between" />

        {/* LANGUAGE SWITCHER */}
        <div className="w-full flex justify-end mb-4">
  
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-textc mb-6 flex items-center gap-2 mt-10">
          <span className="text-sky-600 text-2xl font-bold cursor-pointer">
            {t("title.back")}
          </span>
          <span className="text-textc font-semibold">
            {t("title.preview")}
          </span>
        </h2>

        {/* EXERCISE CONTENT */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl bg-grad-3 border text-nav rounded-3xl shadow-sm p-8">

            <h3 className="text-md font-bold text-nav mb-4">
              Exercice 1: Somme de deux nombres
            </h3>

            <p className="text-sm text-nav">
              <strong>Écrire un algorithme qui :</strong>
            </p>

            <ul className="text-sm text-nav leading-relaxed mt-3 space-y-1 ml-4">
              <li>1. Demande à l’utilisateur de saisir n nombres.</li>
              <li>2. Calcule la somme et la moyenne de ces nombres.</li>
              <li>3. Affiche le résultat.</li>
            </ul>

            <div className="mt-6">
              <span className="bg-primary text-white px-4 py-1 rounded-full text-xs">
                Beginner
              </span>
            </div>

          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-between items-center mt-10 max-w-xl w-full mx-auto">
          <button className="px-6 py-2 bg-[#DDE7FF] text-gray-700 rounded-xl text-sm shadow" onClick={() => navigate("/new-exercise")}>
            {t("buttons.previous")}
          </button>

          <div className="flex gap-3">
            <button className="px-6 py-2 bg-white border border-sky-300 text-gray-700 rounded-xl text-sm shadow">
              {t("buttons.save_draft")}
            </button>

            <button className="px-6 py-2 bg-primary text-white rounded-xl text-sm shadow hover:bg-grad-1">
              {t("buttons.publish")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}