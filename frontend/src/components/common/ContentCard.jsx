import React from "react";
import ContentProgress from "./ContentProgress";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
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

export default function ContentCard({ course, role, showProgress, type, className = "", onDelete }) {
  const { t } = useTranslation("contentPage");
  const location = useLocation();
  const navigate = useNavigate();

  if (!course) return null; // sécurité

  const pageType = type || (location.pathname.includes("courses") ? "course" :
    location.pathname.includes("exercises") ? "exercise" : "quiz");

  const labels = {
    start: t(`start${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`),
    continue: t(`continue${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`),
    restart: t(`restart${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`),
  };

  const levelKeyMap = {
    Débutant: "beginner",
    Intermédiaire: "intermediate",
    Avancé: "advanced"
  };

  const handleEdit = () => {
    if (pageType === "course") navigate(`/courses/edit/${course.id}`);
    else navigate(`/ListeExercices/${course.id}`);
  };

 const handleStart = () => {
  if (pageType === "exercise") {
    navigate(`/ListeExercices`); // <- juste la page existante
  } else {
    navigate(`/Seecourses/${course.id}`);
  }
};


  return (
    <div className={`shadow-md p-6 rounded-2xl flex flex-col justify-between h-full
      transition-all duration-300 ease-out
      hover:shadow-xl hover:-translate-y-1 ${className}`}>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg">{course.title}</h2>
          <span className={`px-3 py-1 text-xs rounded-full ${levelStyles[course.level]}`}>
            {t(`levels.${levelKeyMap[course.level]}`)}
          </span>
        </div>

        {/* Description */}
        <p className="text-grayc my-3 line-clamp-3">{course.description}</p>

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
        {(role === "etudiant" || role === "enseignant") && (
          course.progress > 0 ? (
            <div className="flex gap-2">
              <Button variant="heroPrimary" className="!w-auto px-4 py-2">{labels.continue}</Button>
              <Button variant="heroOutline" className="!w-auto px-4 py-2">{labels.restart}</Button>
            </div>
          ) : (
            <Button
              variant="courseStart"
              className={`${buttonStyles[course.level]} !w-auto px-4 py-2`}
              onClick={handleStart}
            >
              {labels.start}
            </Button>
          )
        )}

        {role === "enseignant" && course.isMine && (
          <div className="flex gap-2 ml-4">
            <FiEdit size={18} className="cursor-pointer text-grayc hover:text-primary" onClick={handleEdit} />
            <FiTrash2 size={18} className="cursor-pointer text-grayc hover:text-red-500" onClick={() => onDelete(course.id)} />
          </div>
        )}
      </div>
    </div>
  );
}
