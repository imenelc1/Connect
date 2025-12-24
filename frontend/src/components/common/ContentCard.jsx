import React, { useState, useEffect } from "react";
import ContentProgress from "./ContentProgress";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import progressionService from "../../services/progressionService";
import { getCurrentUserId } from "../../hooks/useAuth";



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

export default function ContentCard({ course, role, showProgress, type, className = "", onDelete }) {
  const { t } = useTranslation("contentPage");
  const location = useLocation();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const [progress, setProgress] = useState(course?.progress ?? 0);


  /* ===== Quiz states ===== */
  /*const [tentatives, setTentatives] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [minutesRestantes, setMinutesRestantes] = useState(0);
  const [tentativesRestantes, setTentativesRestantes] = useState(null);*/

  if (!course) return null; // sécurité

  const pageType = type || (location.pathname.includes("courses") ? "course" :
    location.pathname.includes("exercises") ? "exercise" : "quiz");
  

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




  const handleEdit = () => {
    if (pageType === "course"){
      navigate(`/courses/edit/${course.id}`);
    } 
    else {
      if (pageType === "exercise"){
        navigate(`/exercices/edit/${course.id}`);
      }
      else{
        navigate(`/quiz/edit/${course.id}`);
      }
    } 
  };
  const seeExercises=()=>{
    navigate(`/ListeExercices/${course.id}`);
  }

 const handleStart = () => {
  if (pageType === "exercise") {
    if (course.categorie === "code") {
      navigate(`/start-exerciseCode/${course.id}`);
    } else {
      navigate(`/start-exercise/${course.id}`);
    }
    //navigate(`/start-exercise/${course.id}`); // <- juste la page existante
  } else {
    if(pageType === "quiz"){
      navigate(`/quiz-intro/${course.id}`)
      
    }else{navigate(`/Seecourses/${course.id}`);}
    
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


/* ================== QUIZ LOGIC ================== */

 

 
  return (
    <div
      className={`shadow-md p-6 rounded-2xl flex flex-col justify-between h-full transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      {/* BODY */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg">{course.title}</h2>
          <span
            className={`px-3 py-1 text-xs rounded-full ${levelStyles[course.level]}`}
          >
            {t(`levels.${levelKeyMap[course.level]}`)}
          </span>
        </div>

        <p className="text-grayc my-3 line-clamp-3">{course.description}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full ${initialsBgMap[course.level]} text-white flex items-center justify-center`}
            >
              {course.initials}
            </div>
            <span className="text-sm">{course.author}</span>
          </div>
         <span className="text-xs text-gray-400">
  {pageType === "exercise"
    ? course.categorie
    : pageType === "quiz" && course.duration
    ? `${course.duration} min`
    : pageType !== "quiz"
    ? course.duration
    : null}
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
     {/* FOOTER */}
<div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  {role === "etudiant" && (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      {pageType === "quiz" ? (
        <>
          {/* Blocage du quiz */}
          {course.isBlocked ? (
  <p className="text-sm text-red-500 font-semibold">
    {course.tentativesRestantes !== null && course.tentativesRestantes <= 0
      ? "🚫 Nombre maximum de tentatives atteint"
      : `⏳ Réessayez dans ${course.minutesRestantes} min`}
  </p>
) : (
  <Button
    variant="courseStart"
    className={`${buttonStyles[course.level]} !w-auto px-4 py-2`}
    onClick={handleStart}
  >
    {progress > 0 ? labels.continue : labels.start}
  </Button>
)}

{/* Bouton restart si déjà commencé */}
{!course.isBlocked && progress > 0 && (
  <Button
    variant="heroOutline"
    className="!w-auto px-4 py-2"
    onClick={handleRestart}
  >
    {labels.restart}
  </Button>
)}

{/* Tentatives restantes */}
{course.tentativesRestantes !== null && course.tentativesRestantes > 0 && (
  <p className="text-xs text-gray-400">
    Tentatives restantes : {course.tentativesRestantes}
  </p>
)}
        </>
      ) : (
        /* Courses & Exercises */
        <>
          {progress === 0 && (
            <>
              <Button
                variant="heroPrimary"
                className={`px-4 py-2 min-w-[100px] ${levelStyles[course.level]}`}
                onClick={() => navigate(`/Seecourses/${course.id}`)}
              >
                {labels.start}
              </Button>

              <Button
                variant="heroPrimary"
                className={`px-4 py-2 min-w-[100px] ${buttonStyles[course.level]}`}
                onClick={seeExercises}
              >
                {t("checkExos")}
              </Button>
            </>
          )}

          {progress > 0 && progress < 100 && (
            <>
              <Button variant="heroOutline" onClick={handleRestart}>
                {labels.restart}
              </Button>
              <Button
                variant="heroPrimary"
                className={levelStyles[course.level]}
                onClick={seeExercises}
              >
                {t("checkExos")}
              </Button>
              <Button
                variant="heroPrimary"
                className={buttonStyles[course.level]}
                onClick={() =>
                  navigate(`/Seecourses/${course.id}`, {
                    state: { lastLessonId: course.lastLessonId },
                  })
                }
              >
                {labels.continue}
              </Button>
            </>
          )}

          {progress >= 100 && (
            <>
              <Button variant="heroOutline" onClick={handleRestart}>
                {labels.restart}
              </Button>
              <Button
                variant="heroPrimary"
                className={buttonStyles[course.level]}
                onClick={seeExercises}
              >
                {t("checkExos")}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  )}

  {/* Enseignant */}
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