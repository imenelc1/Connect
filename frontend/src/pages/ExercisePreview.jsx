import React from "react";
import SideNavbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import { PlayCircle, Globe } from "lucide-react"; // Globe pour changer de langue
import { useTranslation } from "react-i18next";

export default function ExercisePreview() {
  const { t, i18n } = useTranslation("exercisePreview");

  // Fonction pour changer de langue
  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex w-full min-h-screen bg-[#F7FAFF]">

      {/* SIDEBAR */}
      <SideNavbar
        links={[]}
        userName="Andrew Smith"
        userRole="Product Designer"
        userInitials="A.S"
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col p-6 ml-72">

        {/* TOP BAR */}
        <div className="w-full bg-white border-b border-gray-200 px-10 py-3 mb-10 
                        flex items-center justify-between shadow-sm">

          {/* LEFT : CURRICULUM */}
          <div className="flex items-center gap-1">
            <PlayCircle size={16} className="text-[#2B3A67]" />
            <span className="text-[#2B3A67] font-medium text-base">
              {t("topbar.curriculum")}
            </span>
          </div>

          {/* RIGHT : Publish + Lang Switch */}
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-1 cursor-pointer">
              <PlayCircle size={16} className="text-[#2B3A67]" />
              <span className="text-[#2B3A67] font-medium text-base">
                {t("topbar.publish")}
              </span>
            </div>

            {/* SWITCH LANGUE */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg text-sm">
              <Globe size={16} /> {i18n.language.toUpperCase()}
            </button>
          </div>

        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
          <span className="text-sky-600 text-2xl font-bold cursor-pointer">
            {t("title.back")}
          </span>
          <span className="text-[#2B3A67] font-semibold">
            {t("title.preview")}
          </span>
        </h2>

        {/* EXERCISE CONTENT */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl bg-gradient-to-b from-[#F5F9FF] to-[#E4ECFF]
                          border border-[#C8D8FF] rounded-3xl shadow-sm p-8">

            <h3 className="text-md font-bold text-gray-800 mb-4">
              Exercice 1: Somme de deux nombres
            </h3>

            <p className="text-sm text-gray-700">
              <strong>Écrire un algorithme qui :</strong>
            </p>

            <ul className="text-sm text-gray-700 leading-relaxed mt-3 space-y-1 ml-4">
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

          <button className="px-6 py-2 bg-[#DDE7FF] text-gray-700 rounded-xl text-sm shadow">
            {t("buttons.previous")}
          </button>

          <div className="flex gap-3">
            <button className="px-6 py-2 bg-white border border-sky-300 text-gray-700 rounded-xl text-sm shadow">
              {t("buttons.save_draft")}
            </button>

            <button className="px-6 py-2 bg-primary text-white rounded-xl text-sm shadow">
              {t("buttons.publish")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
