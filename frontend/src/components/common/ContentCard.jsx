import React from "react";
import ContentProgress from "./ContentProgress";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";

/* ===================== STYLES ===================== */
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

const levelKeyMap = {
  Débutant: "beginner",
  Intermédiaire: "intermediate",
  Avancé: "advanced",
};

/* ===================== COMPONENT ===================== */
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

  if (!course) return null; // sécurité

  /* ===================== PAGE TYPE ===================== */
  const pageType =
    type ||
    (location.pathname.includes("courses")
      ? "course"
      : location.pathname.includes("exercises")
      ? "exercise"
      : "quiz");

  /* ===================== LABELS ===================== */
  const labels = {
    start: t(`start${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`),
    continue: t(
      `continue${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`
    ),
    restart: t(
      `restart${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`
    ),
    check:
      pageType === "course"
        ? t("checkCourse")
        : pageType === "exercise"
        ? t("checkExercise")
        : t("checkQuiz"),
  };
  const seeExo=()=>{
    navigate(`/ListeExercices/${course.id}`);
  }

  /* ===================== ACTIONS ===================== */
  const handleStart = () => {
    if (pageType === "exercise") {
      navigate(`/ListeExercices/${course.id}`);
    } else {
      navigate(`/Seecourses/${course.id}`);
    }
  };

  const seeExercises = () => {
    navigate(`/ListeExercices/${course.id}`);
  };

  const handleEdit = () => {
    if (pageType === "course") {
      navigate(`/courses/edit/${course.id}`);
    } else if (pageType === "exercise") {
      navigate(`/exercices/edit/${course.id}`);
    } else {
      navigate(`/ListeExercices/${course.id}`);
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <div className={`shadow-md p-6 rounded-2xl flex flex-col justify-between h-full
      transition-all duration-300 ease-out
      hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      {/* ===================== BODY ===================== */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg">{course.title}</h2>
          <span
            className={`px-3 py-1 text-xs rounded-full ${
              levelStyles[course.level]
            }`}
          >
            {t(`levels.${levelKeyMap[course.level]}`)}
          </span>
        </div>

        {/* Description */}
        <p className="text-grayc my-3 line-clamp-3">{course.description}</p>

        {/* Author + duration */}
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
        {showProgress && (
          <ContentProgress
            value={course.progress ?? 0}
            className="mt-3"
            color={progressColorMap[course.level]}
          />
          
        )}
      </div>

{/* ===================== FOOTER ===================== */}
<div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  {/* ===== ETUDIANT ===== */}
  {role === "etudiant" && (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      {/* Si pas commencé */}
      {course.progress === 0 && (
        <>
          <Button
            variant="heroPrimary"
            className={`px-4 py-2 min-w-[100px] whitespace-nowrap ${levelStyles[course.level]}`}
            onClick={() => navigate(`/Seecourses/${course.id}`)}
          >
            {labels.start}
          </Button>
          <Button
            variant="courseStart"
            className={`px-4 py-2 min-w-[100px] whitespace-nowrap ${buttonStyles[course.level]}`}
            onClick={seeExercises}
          >
            {t("checkExos")}
          </Button>
        </>
      )}

      {/* Si commencé mais pas fini */}
      {course.progress > 0 && course.progress < 100 && (
        <div className="flex flex-col gap-2">
          {/* Ligne des autres boutons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="heroOutline"
              className="px-4 py-2 whitespace-nowrap"
              onClick={() => navigate(`/Seecourses/${course.id}`)}
            >
              {labels.restart}
            </Button>

            <Button
              variant="courseStart"
              className={`px-2 py-2  whitespace-nowrap ${levelStyles[course.level]}`}
              onClick={seeExercises}
            >
              {t("checkExos")}
            </Button>
          </div>

          {/* Bouton Continue en bas */}
          <div>
            <Button
              variant="heroPrimary"
              className={`px-4 py-2 whitespace-nowrap ${buttonStyles[course.level]}`}
              onClick={() =>
                navigate(`/Seecourses/${course.id}`, {
                  state: { lastLessonId: course.last_lesson_id },
                })
              }
            >
              {labels.continue}
            </Button>
          </div>
        </div>
      )}

      {/* Si terminé */}
      {course.progress >= 100 && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="heroOutline"
            className="px-4 py-2 whitespace-nowrap"
            onClick={() => navigate(`/Seecourses/${course.id}`)}
          >
            {labels.restart}
          </Button>
          <Button
            variant="courseStart"
            className={`px-3 py-2 whitespace-nowrap ${buttonStyles[course.level]}`}
            onClick={seeExercises}
          >
            {t("checkExos")}
          </Button>
        </div>
      )}
    </div>
  )}

  {/* ===== ENSEIGNANT ===== */}
  {role === "enseignant" && (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <Button
        variant="courseStart"
        className={`px-4 py-2 whitespace-nowrap ${buttonStyles[course.level]}`}
        onClick={handleStart}
      >
        {labels.check}
      </Button>

      {course.isMine && (
        <div className="flex gap-2 ml-2">
          <FiEdit
            size={18}
            className="cursor-pointer text-grayc hover:text-primary"
            onClick={handleEdit}
          />
          <FiTrash2
            size={18}
            className="cursor-pointer text-grayc hover:text-red-500"
            onClick={() => onDelete(course.id_cours)}
          />
        </div>
      )}
    </div>
  )}
</div>

    </div>
  );
}