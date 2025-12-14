import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, BookOpen, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import progressionService from "../../services/progressionService";

export default function CourseContent({
  course,
  currentSectionIndex,
  setCurrentSectionIndex,
  setSections,
  setCourseProgress,
}) {
  const { t } = useTranslation("courses");
  const { title, sections } = course;
  const courseId = course.id || "default";

  // Timer
  const [secondsSpent, setSecondsSpent] = useState(
    parseInt(localStorage.getItem(`courseTimer_${courseId}`) || "0", 10)
  );

  useEffect(() => {
    const storedCourseId = localStorage.getItem("currentCourseId");
    if (storedCourseId !== courseId) {
      setSecondsSpent(0);
      localStorage.setItem("currentCourseId", courseId);
    }
  }, [courseId]);

  useEffect(() => {
    let interval;
    const startTimer = () => {
      interval = setInterval(() => setSecondsSpent((prev) => prev + 1), 1000);
    };
    const stopTimer = () => clearInterval(interval);
    startTimer();
    const handleVisibility = () => {
      if (document.hidden) stopTimer();
      else startTimer();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [courseId]);

  useEffect(() => {
    localStorage.setItem(`courseTimer_${courseId}`, secondsSpent.toString());
  }, [secondsSpent, courseId]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Pagination des leçons
  const LESSONS_PER_PAGE = 2;
  const section = sections[currentSectionIndex] || { lessons: [], ordre: 0 };
  const lessons = section?.lessons || [];
  const totalLessonPages = Math.ceil(lessons.length / LESSONS_PER_PAGE);
  const [currentLessonPage, setCurrentLessonPage] = useState(0);
  const currentLessons = lessons.slice(
    currentLessonPage * LESSONS_PER_PAGE,
    currentLessonPage * LESSONS_PER_PAGE + LESSONS_PER_PAGE
  );

  const isLastPage =
    currentSectionIndex === sections.length - 1 &&
    currentLessonPage === totalLessonPages - 1;

  // Navigation et progression
  const nextLessonPage = async () => {
    const startIdx = currentLessonPage * LESSONS_PER_PAGE;
    const endIdx = startIdx + LESSONS_PER_PAGE;
    const currentPageLessons = lessons.slice(startIdx, endIdx);

    // Marquer toutes les leçons de la page actuelle comme complétées
    for (const lesson of currentPageLessons) {
      if (lesson?.id) {
        try {
          const res = await progressionService.completeLesson(lesson.id);
          const newProgress = res.progress ?? section.progress ?? 0;

          const updatedSections = sections.map((sec, i) =>
            i === currentSectionIndex ? { ...sec, progress: newProgress } : sec
          );
          setSections(updatedSections);
          if (setCourseProgress) setCourseProgress(newProgress);
        } catch (err) {
          console.error("Erreur progression :", err.response?.data || err.message);
        }
      }
    }

    // Aller à la page/section suivante
    if (!isLastPage) {
      if (currentLessonPage < totalLessonPages - 1) setCurrentLessonPage(currentLessonPage + 1);
      else if (currentSectionIndex < sections.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentLessonPage(0);
      }
    } else {
      // Dernière page : cours terminé
      console.log("Cours terminé !");
    }
  };

  const prevLessonPage = () => {
    if (currentLessonPage > 0) setCurrentLessonPage(currentLessonPage - 1);
    else if (currentSectionIndex > 0) {
      const prevSection = sections[currentSectionIndex - 1];
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentLessonPage(Math.ceil(prevSection.lessons.length / LESSONS_PER_PAGE) - 1);
    }
  };

  // Feedback
  const allFeedbacks = [
    { id: 1, initials: "A.S", comment: t("feedback1"), stars: 5 },
    { id: 2, initials: "M.K", comment: t("feedback2"), stars: 5 },
    { id: 3, initials: "S.R", comment: t("feedback3"), stars: 5 },
    { id: 4, initials: "T.L", comment: t("feedback1"), stars: 4 },
    { id: 5, initials: "H.D", comment: t("feedback2"), stars: 5 },
    { id: 6, initials: "N.M", comment: t("feedback3"), stars: 4 },
  ];
  const [page, setPage] = useState(0);
  const feedbacksPerPage = 3;
  const totalPages = Math.ceil(allFeedbacks.length / feedbacksPerPage);
  const currentFeedbacks = allFeedbacks.slice(
    page * feedbacksPerPage,
    page * feedbacksPerPage + feedbacksPerPage
  );

  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const handleSubmit = () => {
    console.log("Feedback submitted:", { feedback, rating });
    setFeedback("");
    setRating(0);
  };

  return (
    <div className="bg-card rounded-3xl border border-blue/20 p-4 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="px-2 mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-muted">{title}</h1>
        <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
          <span className="flex items-center gap-1 text-muted font-medium">
            <BookOpen size={14} className="sm:w-4 sm:h-4" /> Chapitre {section.ordre} / {sections.length}
          </span>
          <span className="flex items-center gap-1 text-muted">
            <Clock size={14} className="sm:w-4 sm:h-4" /> {formatTime(secondsSpent)}
          </span>
        </div>
      </div>

      {/* Leçons */}
      <div className="bg-card rounded-3xl border border-blue/20 p-4 sm:p-8 shadow-sm">
        {currentLessons.length > 0 ? (
          currentLessons.map((lesson) => (
            <div key={lesson.id} className="mb-10">
              <h2 className="mt-6 text-lg sm:text-xl font-semibold text-muted">{lesson.title}</h2>
              {lesson.type === "image" && lesson.preview && <img src={lesson.preview} alt={lesson.title} className="rounded-xl mt-4" />}
              {lesson.type === "text" && lesson.content && <p className="mt-2 text-sm sm:text-base text-textc leading-relaxed">{lesson.content}</p>}
              {lesson.type === "example" && lesson.content && <pre className="mt-2 p-4 bg-gray-100 rounded-xl overflow-x-auto">{lesson.content}</pre>}
            </div>
          ))
        ) : (
          <p className="text-center text-sm sm:text-base text-gray-500 mt-4">Aucune leçon disponible</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-row gap-2 sm:gap-3 mt-4">
        <button
          onClick={prevLessonPage}
          disabled={currentSectionIndex === 0 && currentLessonPage === 0}
          className="flex items-center gap-1 sm:gap-2 bg-white px-3 sm:px-4 py-1 sm:py-2 rounded-xl border border-blue/40 shadow text-blue text-xs sm:text-base hover:bg-blue/10 disabled:opacity-30"
        >
          <ChevronLeft size={14} className="sm:w-4 sm:h-4" /> {t("chapitrePrec")}
        </button>

        <button
          onClick={nextLessonPage}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-base shadow ${
            isLastPage
            ? "bg-supp/80 text-white hover:bg-supp/90 focus:bg-supp/30"
              : "bg-blue text-white hover:bg-blue/90"
          }`}
        >
          {isLastPage ? "Terminer" : t("ChapitreSuiv")}
          {!isLastPage && <ChevronRight size={14} className="sm:w-4 sm:h-4" />}
        </button>
      </div>

      {/* Quiz */}
      <div className="mt-10 w-full">
        <div className="w-full bg-grad-1 text-white p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow">
          <div className="text-left mb-4 md:mb-0">
            <h3 className="text-base sm:text-lg font-semibold">{t("readyQuiz")}</h3>
            <p className="text-sm sm:text-base opacity-90">{t("quizDesc")}</p>
          </div>
          <button className="bg-white text-blue font-medium px-4 sm:px-6 py-2 rounded-xl shadow flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            {t("startQuiz")} <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Feedback */}
      <div className="mt-16 w-full max-w-4xl px-2">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="text-2xl sm:text-3xl text-blue disabled:opacity-30"
            disabled={page === 0}
          >
            ‹
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 flex-1 px-4 sm:px-6">
            {currentFeedbacks.map((f) => (
              <div key={f.id} className="relative bg-grad-1 rounded-3xl p-4 sm:p-6 text-white shadow-lg">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center text-sm sm:text-lg font-semibold mb-4">
                  {f.initials}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed opacity-90">{f.comment}</p>
                <div className="flex gap-1 text-yellow-300 text-base sm:text-xl mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < f.stars ? "★" : "☆"}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="text-2xl sm:text-3xl text-blue disabled:opacity-30"
            disabled={page === totalPages - 1}
          >
            ›
          </button>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-muted mb-3">{t("yourFeedback")}</h3>
        <textarea
          className="w-full h-36 sm:h-48 border border-blue/20 rounded-2xl p-3 sm:p-4 shadow-sm focus:outline-none text-black/80 text-sm sm:text-base"
          placeholder={t("feedbackPlaceholder")}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-gray-800 font-medium text-sm sm:text-base">{t("rateCourse")}</span>
            <div className="flex gap-1 text-xl sm:text-2xl">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)} className="cursor-pointer text-yellow-400">
                  {s <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-blue text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl shadow hover:bg-blue/90 text-sm sm:text-base"
          >
            {t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}