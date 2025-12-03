import React from "react";
import ContentProgress from "./ContentProgress";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { FiEdit, FiTrash2 } from "react-icons/fi";

const levelStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};

const buttonStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};

export default function ContentCard({ course, role, showProgress, className = "", onDelete }) {
  const { t } = useTranslation("contentPage");
  const location = useLocation();

  // 👉 Determine automatiquement si on est sur la page cours, exercices ou quiz
  const pageType = location.pathname.includes("courses")
    ? "course"
    : location.pathname.includes("exercises")
    ? "exercise"
    : "quiz";

  // 👉 Textes dynamiques selon la page
  const labels = {
    start: t(`start${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`),
    continue: t(`continue${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`),
    restart: t(`restart${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`),
  };

  return (
    <div className={` shadow-md p-6 rounded-2xl flex flex-col justify-between h-full
    transition-all duration-300 ease-out
    hover:shadow-xl hover:-translate-y-1 ${className}`}>
      
      {/* Contenu principal */}
      <div className="flex flex-col flex-1">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg">{course.title}</h2>
          <span className={`px-3 py-1 text-xs rounded-full ${levelStyles[course.level]}`}>
             {t(`levels.${course.level}`)}
          </span>
        </div>

        {/* Description */}
        <p className="text-grayc my-3 line-clamp-3">
          {course.description}
        </p>

        {/* Auteur + durée */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              {course.initials}
            </div>
            <span className="text-sm">{course.author}</span>
          </div>
          <span className="text-xs text-gray-400">{course.duration}</span>
        </div>

        {/* Progress */}
        {showProgress && <ContentProgress value={course.progress ?? 0} className="mt-3" />}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">

        {/* Étudiant / Enseignant */}
        {(role === "etudiant" || role === "enseignant") && (
          course.progress > 0 ? (
            <div className="flex gap-2">
              <Button variant="heroPrimary" className="!w-auto px-4 py-2">
                {labels.continue}
              </Button>
              <Button variant="heroOutline" className="!w-auto px-4 py-2">
                {labels.restart}
              </Button>
            </div>
          ) : (
            <Button
              variant="courseStart"
              className={`${buttonStyles[course.level]} !w-auto px-4 py-2`}
            >
              {labels.start}
            </Button>
          )
        )}

        {/* Actions enseignant */}
        {role === "enseignant" && course.isMine && (
          <div className="flex gap-2 ml-4">
            <FiEdit size={18} className="cursor-pointer text-grayc hover:text-primary" />
            <FiTrash2 size={18} className="cursor-pointer text-grayc hover:text-red-500" onClick={() => onDelete(course.id)}/>
          </div>
        )}
      </div>

    </div>
  );
}