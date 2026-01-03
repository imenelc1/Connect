import React, { useState } from "react";
import ContentProgress from "./ContentProgress";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiCheckCircle } from "react-icons/fi";
import progressionService from "../../services/progressionService";

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
  const [progress, setProgress] = useState(course?.progress ?? 0);

  if (!course) return null;

  const pageType =
    type ||
    (location.pathname.includes("courses")
      ? "course"
      : location.pathname.includes("exercises")
        ? "exercise"
        : "quiz");

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

  const handleStart = () => {
    if (pageType === "exercise") {
      if (course.categorie === "code") {
        navigate(`/start-exerciseCode/${course.id}`);
      } else {
        navigate(`/start-exercise/${course.id}`);
      }
    } else if (pageType === "quiz" && role === "etudiant") {
      navigate(`/quiz-intro/${course.id}`);
    } else if (pageType === "quiz" && role === "enseignant") {
      navigate(`/quiz-preview/${course.id}`);
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
    } else if (pageType === "quiz") {
      navigate(`/quiz/edit/${course.id}`);
    } else {
      navigate(`/Seecourses/${course.id}`);
    }
  };

  const handleRestart = async () => {
    try {
      await progressionService.resetCourseProgress(course.id);
      setProgress(0);
      if (pageType === "course") navigate(`/Seecourses/${course.id}`);
      else if (pageType === "quiz") navigate(`/QuizIntro/${course.id}`);
      else navigate(`/ListeExercices/${course.id}`);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation :", error);
    }
  };

 return (
  <div
    className={`shadow-md p-6 rounded-2xl flex flex-col justify-between h-full
    transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1
    overflow-hidden ${className}`}
  >
    {/* BODY */}
    <div className="flex flex-col flex-1 min-w-0">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-3">
        {/* ✅ TITRE FIXÉ */}
        <h2 className="font-semibold text-lg break-words line-clamp-2">
          {course.title}
        </h2>

        <span
          className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${levelStyles[course.level]}`}
        >
          {t(`levels.${levelKeyMap[course.level]}`)}
        </span>
      </div>

      {/* ✅ DESCRIPTION FIXÉE */}
      <p className="text-grayc my-3 line-clamp-3 break-words">
        {course.description}
      </p>

      {/* AUTHOR */}
      <div className="flex items-center justify-between mt-2 gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-8 h-8 rounded-full ${initialsBgMap[course.level]} 
            text-white flex items-center justify-center shrink-0`}
          >
            {course.initials}
          </div>

          {/* ✅ AUTEUR FIXÉ */}
          <span className="text-sm truncate">
            {course.author}
          </span>
        </div>

        <span className="text-xs text-gray-400 whitespace-nowrap">
          {pageType === "exercise"
            ? course.categorie
            : pageType === "quiz" && course.duration
              ? `${course.duration} min`
              : course.duration}
        </span>
      </div>

      {showProgress && (
        <ContentProgress
          value={progress}
          className="mt-3"
          color={progressColorMap[course.level]}
        />
      )}
    </div>

    {/* FOOTER */}
    <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* ================= ETUDIANT ================= */}
      {role === "etudiant" && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

          {/* ================= QUIZ ================= */}
          {pageType === "quiz" ? (
            <div className="flex flex-col sm:flex-row gap-2">

              {course.isBlocked ? (
                <p className="text-sm text-red-500 font-semibold break-words">
                  {course.tentativesRestantes !== null &&
                  course.tentativesRestantes <= 0
                    ? "Nombre maximum de tentatives atteint"
                    : `Réessayez dans ${course.minutesRestantes} min`}
                </p>
              ) : (
                <Button
                  variant="courseStart"
                  className={`px-4 py-2 whitespace-nowrap ${buttonStyles[course.level]}`}
                  onClick={handleStart}
                >
                  {progress > 0 ? labels.continue : labels.start}
                </Button>
              )}

              {!course.isBlocked && progress > 0 && (
                <Button
                  variant="heroOutline"
                  className="px-4 py-2 whitespace-nowrap"
                  onClick={handleRestart}
                >
                  {labels.restart}
                </Button>
              )}

              {course.tentativesRestantes !== null &&
                course.tentativesRestantes > 0 && (
                  <p className="text-xs text-gray-400 whitespace-nowrap self-center">
                    Tentatives restantes : {course.tentativesRestantes}
                  </p>
                )}
            </div>
          ) : (
            <>
              {/* ===== Début ===== */}
              {progress === 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="heroPrimary"
                    className={`px-4 py-2 min-w-[100px] whitespace-nowrap ${levelStyles[course.level]}`}
                    onClick={() => navigate(`/Seecourses/${course.id}`)}
                  >
                    {labels.start}
                  </Button>

                  <Button
                    variant="heroPrimary"
                    className={`px-4 py-2 min-w-[100px] whitespace-nowrap ${buttonStyles[course.level]}`}
                    onClick={seeExercises}
                  >
                    {t("checkExos")}
                  </Button>
                </div>
              )}

              {/* ===== En cours ===== */}
              {progress > 0 && progress < 100 && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="heroOutline"
                    className={`px-4 py-2 whitespace-nowrap ${levelStyles[course.level]}`}
                      onClick={handleRestart}
                    >
                      {labels.restart}
                    </Button>
                
                    <Button
                      variant="heroPrimary"
                      className={`px-4 py-2 whitespace-nowrap ${levelStyles[course.level]}`}
                      onClick={seeExercises}
                    >
                      {t("checkExos")}
                    </Button>
                  </div>

                  <Button
                    variant="heroPrimary"
                    className={`px-4 py-2 whitespace-nowrap ${buttonStyles[course.level]}`}
                    onClick={() =>
                      navigate(`/Seecourses/${course.id}`, {
                        state: { lastLessonId: course.lastLessonId },
                      })
                    }
                  >
                    {labels.continue}
                  </Button>
                </div>
              )}

              {/* ===== Terminé ===== */}
              {progress >= 100 && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="heroOutline"
                    className="px-4 py-2 whitespace-nowrap"
                    onClick={handleRestart}
                  >
                    {labels.restart}
                  </Button>

                  <Button
                    variant="heroPrimary"
                    className={`px-4 py-2 whitespace-nowrap ${buttonStyles[course.level]}`}
                    onClick={seeExercises}
                  >
                    {t("checkExos")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ================= ENSEIGNANT ================= */}
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
                onClick={() => onDelete(course.id)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

}
