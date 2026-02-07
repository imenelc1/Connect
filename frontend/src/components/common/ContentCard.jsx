import React, { useState, useEffect } from "react";
import ContentProgress from "./ContentProgress";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiCheckCircle } from "react-icons/fi";
import progressionService from "../../services/progressionService";

/* ===================== STYLES ===================== */
// Couleurs  selon le niveau du cours /exo/quiz
const levelStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};

//couleur des buttons selons les niveau
const buttonStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};
//couleur de cercle utilisateur selon le niveau
const initialsBgMap = {
  Débutant: "bg-blue",
  Intermédiaire: "bg-purple",
  Avancé: "bg-pink",
};
//couleur de barre de progression selon le niveau
const progressColorMap = {
  Débutant: "bg-blue",
  Intermédiaire: "bg-purple",
  Avancé: "bg-pink",
};
//mapping des niveaux

const levelKeyMap = {
  Débutant: "beginner",
  Intermédiaire: "intermediate",
  Avancé: "advanced",
};

/* ===================== COMPONENT ===================== */
export default function ContentCard({
  course, //objet cours qui peut etre cours ou quiz ou exo
  role, //etudiant /enseignant
  showProgress, //progression
  type,
  className = "",
  onDelete, //suppression
}) {
  const { t } = useTranslation("contentPage");  //traduction
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(course?.progress ?? 0);
  useEffect(() => {
    setProgress(course?.progress ?? 0);
  }, [course?.progress]);

  // pas d'object=> rien a afficher
  if (!course) return null;
  //le type de la page selon le type des objets envoyé
  const pageType =
    type ||
    (location.pathname.includes("courses")
      ? "course"
      : location.pathname.includes("exercises")
        ? "exercise"
        : "quiz");

  // labels dynamique selon le type de la page
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
  //commencer le contenu selon le type et role
  const handleStart = () => {
    if (pageType === "exercise") {
      navigate(
        course.categorie === "code"
          ? `/start-exerciseCode/${course.id}`
          : `/start-exercise/${course.id}`
      );
    } else if (pageType === "quiz" && role === "etudiant") {
      navigate(`/quiz-intro/${course.id}`);
    } else if (pageType === "quiz" && role === "enseignant") {
      navigate(`/quiz-preview/${course.id}`);
    } else {
      navigate(`/Seecourses/${course.id}`);
    }
  };
  //reinitialiser la progression
  const handleRestart = async () => {
    try {
      await progressionService.resetCourseProgress(course.id);
      setProgress(0);
      navigate(
        pageType === "quiz"
          ? `/QuizIntro/${course.id}`
          : pageType === "course"
            ? `/Seecourses/${course.id}`
            : `/ListeExercices/${course.id}`
      );
    } catch (err) {
      console.error(err);
    }
  };
  //voir la liste des exercices associé
  const seeExercises = () => navigate(`/ListeExercices/${course.id}`);
  //naviger vers la page de modification de contenu 
  const handleEdit = () => {
    navigate(
      pageType === "course"
        ? `/courses/edit/${course.id}`
        : pageType === "exercise"
          ? `/exercices/edit/${course.id}`
          : `/quiz/edit/${course.id}`
    );
  };

  return (
    <div
      className={`shadow-md p-6 rounded-2xl flex flex-col justify-between h-full
      transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      {/* ================= BODY ================= */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* titre et niveau */}
        <div className="flex justify-between items-start gap-3">
          <h2 className="font-semibold text-lg line-clamp-2 break-words">
            {course.title}
          </h2>
          <span
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${levelStyles[course.level]}`}
          >
            {t(`levels.${levelKeyMap[course.level]}`)}
          </span>
        </div>
        {/*description */}
        <p className="text-grayc my-3 line-clamp-3 break-words">
          {course.description}
        </p>
        {/*auteur et duree */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-8 h-8 rounded-full ${initialsBgMap[course.level]} text-white flex items-center justify-center`}
            >
              {course.initials}
            </div>
            <span className="text-sm truncate">{course.author}</span>
          </div>

          <span className="text-xs text-gray-400 whitespace-nowrap">
            {pageType === "exercise"
              ? course.categorie
              : pageType === "quiz" && course.duration
                ? `${course.duration} min`
                : course.duration}
          </span>
        </div>
        {/* barre de progression pour la page exercice et cours */}
        {showProgress && pageType !== "quiz" && (
          <ContentProgress
            value={progress}
            className="mt-3"
            color={progressColorMap[course.level]}
          />
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="mt-4">
        {/* ================= ETUDIANT ================= */}
        {role === "etudiant" && (
          <>
            {/* ================= QUIZ ================= */}
            {pageType === "quiz" ? (
              <div className="grid grid-cols-2 gap-3">
                {!course.isBlocked && (
                  <Button
                    variant="heroPrimary"
                    className={`${buttonStyles[course.level]} px-4 py-2 w-full col-span-2`}
                    onClick={handleStart}
                  >
                    {course.tentatives?.length > 0 &&
                      course.tentativesRestantes <= 0
                      ? labels.restart
                      : labels.start}
                  </Button>
                )}

                {course.isBlocked && (
                  <p className="col-span-2 text-sm text-red-500 font-semibold">
                    {course.tentativesRestantes <= 0
                      ? t("maxAttemptsReached")
                      : t("retryIn", { minutes: course.minutesRestantes })}
                  </p>
                )}

                {course.tentativesRestantes > 0 && (
                  <p className="col-span-2 text-xs text-gray-400">
                    {t("remainingAttempts", {
                      count: course.tentativesRestantes,
                    })}
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* ================= COURSES & EXOS ================= */}

                {/* ===== progress = 0 ===== */}
                {progress === 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="heroPrimary"
                      className={`${buttonStyles[course.level]} px-4 py-2 w-full`}
                      onClick={() => navigate(`/Seecourses/${course.id}`)}
                    >
                      {labels.start}
                    </Button>

                    <Button
                      variant="heroOutline"
                      className="px-4 py-2 w-full"
                      onClick={seeExercises}
                    >
                      {t("checkExos")}
                    </Button>
                  </div>
                )}

                {/* ===== progress 1 → 99 ===== */}
                {progress > 0 && progress < 100 && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="heroOutline"
                      className="px-4 py-2 w-full"
                      onClick={handleRestart}
                    >
                      {labels.restart}
                    </Button>

                    <Button
                      variant="heroOutline"
                      className="px-4 py-2 w-full"
                      onClick={seeExercises}
                    >
                      {t("checkExos")}
                    </Button>

                    <Button
                      variant="heroPrimary"
                      className={`${buttonStyles[course.level]} px-4 py-2 w-full col-span-2`}
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

                {/* ===== progress = 100 ===== */}
                {progress >= 100 && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="heroOutline"
                      className="px-4 py-2 w-full"
                      onClick={handleRestart}
                    >
                      {labels.restart}
                    </Button>

                    <Button
                      variant="heroOutline"
                      className="px-4 py-2 w-full"
                      onClick={seeExercises}
                    >
                      {t("checkExos")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ================= ENSEIGNANT ================= */}
        {role === "enseignant" && (
          <div className="grid grid-cols-2 gap-3 items-center">

            <div className="flex items-center gap-2 col-span-2">

            
            <Button
              variant="heroPrimary"
              className={`${buttonStyles[course.level]} px-4 py-2 w-full col-span-2`}
              onClick={handleStart}
            >
              {labels.check}
            </Button>

            {course.isMine && (
              <>
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
              </>
            )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}