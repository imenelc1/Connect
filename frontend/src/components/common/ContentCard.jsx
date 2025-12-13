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

const initialsBgMap = {
  Débutant: "bg-blue",
  Intermédiaire: "bg-purple",
  Avancé: "bg-pink",
};

const progressColorMap = {
  Débutant: "bg-blue",
  Intermédiaire: "bg-purple",
  Avancé: "bg-pink",
};


export default function ContentCard({
  course,
  role,
  showProgress,
  type,
  className = "",
  onDelete,
}) {
  const { t } = useTranslation("contentPage");
  const location = useLocation();
  const navigate = useNavigate();

  if (!course) return null;

  const pageType =
    type ||
    (location.pathname.includes("courses")
      ? "course"
      : location.pathname.includes("exercises")
      ? "exercise"
      : "quiz");

  const handleEdit = () => {
    if (pageType === "course") navigate(`/courses/edit/${course.id}`);
    else navigate(`/ListeExercices/${course.id}`);
  };

  const handleStart = () => {
    if (pageType === "exercise") navigate(`/ListeExercices`);
    else navigate(`/Seecourses/${course.id}`);
  };

  const getButtonLabel = () => {
    if (role === "etudiant") {
      if (course.progress > 0) return t("continueCourse");
      if (pageType === "course") return t("startCourse");
      if (pageType === "exercise") return t("startExercise");
      if (pageType === "quiz") return t("startQuiz");
    } else {
      // rôle professeur
      if (pageType === "course") return t("checkCourse");
      if (pageType === "exercise") return t("checkExercise");
      if (pageType === "quiz") return t("checkQuiz");
    }
  };

  return (
    <div
      className={`shadow-md p-6 rounded-2xl flex flex-col justify-between h-full
      transition-all duration-300 ease-out
      hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg">{course.title}</h2>
          <span
            className={`px-3 py-1 text-xs rounded-full ${
              levelStyles[course.level]
            }`}
          >
            {t(`levels.${course.level}`)}
          </span>
        </div>

        {/* Description */}
        <p className="text-grayc my-3 line-clamp-3">{course.description}</p>

        {/* Auteur + durée */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full ${
                initialsBgMap[course.level]
              } text-white flex items-center justify-center`}
            >
              {course.initials}
            </div>
            <span className="text-sm">{course.author}</span>
          </div>
          <span className="text-xs text-gray-400">{course.duration}</span>
        </div>

        {/* Progress */}
        {showProgress && (
          <ContentProgress value={course.progress ?? 0} className="mt-3" color={progressColorMap[course.level]}/>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        {(role === "etudiant" || role === "enseignant") && (
          <Button
            variant="courseStart"
            className={`${buttonStyles[course.level]} !w-auto px-4 py-2`}
            onClick={handleStart}
          >
            {getButtonLabel()}
          </Button>
        )}

        {role === "enseignant" && course.isMine && (
          <div className="flex gap-2 ml-4">
            <FiEdit
              size={18}
              className="cursor-pointer text-grayc hover:text-primary"
              onClick={handleEdit}
            />
            <FiTrash2
              size={18}
              className="cursor-pointer text-grayc hover:text-red-500"
              onClick={() => onDelete(course.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
