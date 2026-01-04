import React from "react";
import { ChevronRight, ChevronLeft, BookOpen, Clock } from "lucide-react";

export default function CourseContentSimple({
  course,
  currentSectionIndex,
  setCurrentSectionIndex,
  sectionPages,
  setSectionPages,
}) {
  const { title, sections } = course;
  const courseId = course.id || "default";

  const LESSONS_PER_PAGE = 2;
  const section = sections[currentSectionIndex] || { lessons: [], ordre: 0 };
  const lessons = section?.lessons || [];
  const totalLessonPages = Math.ceil(lessons.length / LESSONS_PER_PAGE);
  const currentLessonPage = sectionPages?.[currentSectionIndex] ?? 0;
  const currentLessons = lessons.slice(
    currentLessonPage * LESSONS_PER_PAGE,
    currentLessonPage * LESSONS_PER_PAGE + LESSONS_PER_PAGE
  );

  // Navigation
  const goToLessonPage = (page) => {
    setSectionPages((prev) => ({ ...prev, [currentSectionIndex]: page }));
  };

  const nextLessonPage = () => {
    if (currentLessonPage < totalLessonPages - 1) {
      goToLessonPage(currentLessonPage + 1);
    } else if (currentSectionIndex < sections.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      setSectionPages((prev) => ({ ...prev, [nextIndex]: 0 }));
    }
  };

  const prevLessonPage = () => {
    if (currentLessonPage > 0) {
      goToLessonPage(currentLessonPage - 1);
    } else if (currentSectionIndex > 0) {
      const prevIndex = currentSectionIndex - 1;
      setCurrentSectionIndex(prevIndex);

      const totalPrevPages = Math.ceil(sections[prevIndex].lessons.length / LESSONS_PER_PAGE);
      setSectionPages((prev) => ({ ...prev, [prevIndex]: totalPrevPages - 1 }));
    }
  };

  const isLastPage =
    currentSectionIndex === sections.length - 1 &&
    currentLessonPage === totalLessonPages - 1;

  return (
    <div className="bg-card rounded-3xl border border-blue/20 p-4 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="px-2 mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-muted">{title}</h1>
        <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
          <span className="flex items-center gap-1 text-muted font-medium">
            <BookOpen size={14} className="sm:w-4 sm:h-4" /> Chapitre {section.ordre} / {sections.length}
          </span>
        </div>
        <p>{course.duration}</p>
      </div>

      {/* Lessons */}
      <div className="bg-card rounded-3xl border border-blue/20 p-4 sm:p-8 shadow-sm">
        {currentLessons.length > 0 ? (
          currentLessons.map((lesson) => (
            <div key={lesson.id} className="mb-10">
              <h2 className="mt-6 text-lg sm:text-xl font-semibold text-muted">{lesson.title}</h2>
              {lesson.type === "image" && lesson.preview && (
                <img src={lesson.preview} alt={lesson.title} className="rounded-xl mt-4" />
              )}
              {lesson.type === "text" && lesson.content && (
                <p className="mt-2 text-sm sm:text-base text-textc leading-relaxed">{lesson.content}</p>
              )}
              {lesson.type === "example" && lesson.content && (
                <pre className="mt-2 p-4 bg-grad-dark-3 rounded-xl overflow-x-auto">{lesson.content}</pre>
              )}
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
          <ChevronLeft size={14} className="sm:w-4 sm:h-4" /> Précédent
        </button>
        <button
          onClick={nextLessonPage}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-base shadow ${
            isLastPage
              ? "bg-supp/80 text-white hover:bg-supp/90 focus:bg-supp/30"
              : "bg-blue text-white hover:bg-blue/90"
          }`}
        >
          {isLastPage ? "Terminer" : "Suivant"}
          {!isLastPage && <ChevronRight size={14} className="sm:w-4 sm:h-4" />}
        </button>
      </div>

      {isLastPage && (
        <div className="mb-4 p-4 text-center">
          <p className="text-green-700 font-semibold text-sm sm:text-base">Cours terminé !</p>
        </div>
      )}
    </div>
  );
}