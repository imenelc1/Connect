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

  const seeExercises = () => navigate(`/ListeExercices/${course.id}`);

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

        <p className="text-grayc my-3 line-clamp-3 break-words">
          {course.description}
        </p>

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

        {showProgress && pageType !== "quiz" && (
          <ContentProgress
            value={progress}
            className="mt-3"
            color={progressColorMap[course.level]}
          />
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {role === "etudiant" && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* ================= QUIZ ================= */}
            {pageType === "quiz" ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {!course.isBlocked && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="courseStart"
                      className={`px-4 py-2 ${buttonStyles[course.level]}`}
                      onClick={handleStart}
                    >
                      {course.tentatives?.length > 0 &&
                      course.tentativesRestantes <= 0
                        ? labels.restart
                        : labels.start}
                    </Button>

                    {course.tentatives?.length > 0 &&
                      course.tentativesRestantes <= 0 && (
                        <FiCheckCircle className="text-purple" size={18} />
                      )}
                  </div>
                )}

                {course.isBlocked && (
                  <p className="text-sm text-red-500 font-semibold">
                    {course.tentativesRestantes <= 0
                      ? t("maxAttemptsReached")
                      : t("retryIn", { minutes: course.minutesRestantes })}
                  </p>
                )}

                {course.tentativesRestantes > 0 && (
                  <p className="text-xs text-gray-400">
                    {t("remainingAttempts", {
                      count: course.tentativesRestantes,
                    })}
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* ================= COURSES & EXOS ================= */}
                {progress === 0 && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="heroPrimary"
                      className={`whitespace-nowrap px-4 whitespace-nowrap py-2 ${levelStyles[course.level]} `}
                      onClick={() => navigate(`/Seecourses/${course.id}`)}
                    >
                      {labels.start}
                    </Button>
                    <Button
                      variant="heroPrimary"
                      className={`${buttonStyles[course.level]} whitespace-nowrap px-4 whitespace-nowrap py-2`}
                      onClick={seeExercises}
                    >
                      {t("checkExos")}
                    </Button>
                  </div>
                )}

                {progress > 0 && progress < 100 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-3">
                      <Button variant="heroOutline" className="px-4 whitespace-nowrap" onClick={handleRestart}>
                        {labels.restart}
                      </Button>
                      <Button
                        variant="heroPrimary"
                        className={` whitespace-nowrap ${levelStyles[course.level]} px-4 py-2`}
                        onClick={seeExercises}
                      >
                        {t("checkExos")}
                      </Button>
                    </div>
                    <Button
                      variant="heroPrimary"
                      className={`${buttonStyles[course.level]} px-4 py-2`}
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

                {progress >= 100 && (
                  <div className="flex gap-3">
                    <Button
                      variant="heroOutline"
                      className="px-4 whitespace-nowrap py-2"
                      onClick={handleRestart}
                    >
                      {labels.restart}
                    </Button>
                    <Button
                      variant="heroPrimary"
                      className={`whitespace-nowrap px-4 whitespace-nowrap py-2 ${buttonStyles[course.level]} px-0 py-2`}
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
          <div className="flex items-center gap-3">
            <Button
              variant="courseStart"
              className={`${buttonStyles[course.level]} px-4 py-2`}
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
        )}
      </div>
    </div>
  );
}