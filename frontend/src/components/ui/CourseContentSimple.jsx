import React from "react";
import { ChevronRight, ChevronLeft, BookOpen, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

/* ===================================================
   CourseContentSimple
   Affiche le contenu d'un cours : sections, leçons
   avec pagination par leçon et navigation
=================================================== */
export default function CourseContentSimple({
  course, //objet cours complé
  currentSectionIndex, //index de la section actuellement affiché
  setCurrentSectionIndex, // fonction pour changer la section active
  sectionPages,  // objet stockant la page courante de chaque section
  setSectionPages,  // fonction pour modifier sectionPages
}) {
  const { title, sections } = course;
  const courseId = course.id || t("courseIdDefault");
  const { t } = useTranslation("courses"); //taduction

  const LESSONS_PER_PAGE = 2; //nombre de leçon affiché par page
  const section = sections[currentSectionIndex] || { lessons: [], ordre: 0 };
  const lessons = section?.lessons || []; //leçons de la section
  const totalLessonPages = Math.ceil(lessons.length / LESSONS_PER_PAGE); //total pages
  const currentLessonPage = sectionPages?.[currentSectionIndex] ?? 0; //page actuelle
  const currentLessons = lessons.slice(
    currentLessonPage * LESSONS_PER_PAGE,
    currentLessonPage * LESSONS_PER_PAGE + LESSONS_PER_PAGE
  ); //leçon a afficher sur la page actuelle

  // Navigation entre pages et sections
  const goToLessonPage = (page) => {
    //met a jour la page de la section active
    setSectionPages((prev) => ({ ...prev, [currentSectionIndex]: page }));
  };

  const nextLessonPage = () => {
    if (currentLessonPage < totalLessonPages - 1) {
      //passer a la leçon suivante dans la mm section
      goToLessonPage(currentLessonPage + 1);
    } else if (currentSectionIndex < sections.length - 1) {
      //si derniere page de section, passer a la section suivante
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      setSectionPages((prev) => ({ ...prev, [nextIndex]: 0 }));
    }
  };

  const prevLessonPage = () => {
    if (currentLessonPage > 0) {
      //page precedante dans la mm section
      goToLessonPage(currentLessonPage - 1);
    } else if (currentSectionIndex > 0) {
      //premiere page de la section, passer a la section precedante
      const prevIndex = currentSectionIndex - 1;
      setCurrentSectionIndex(prevIndex);
      //aller a la derniere page de la section precedente
      const totalPrevPages = Math.ceil(sections[prevIndex].lessons.length / LESSONS_PER_PAGE);
      setSectionPages((prev) => ({ ...prev, [prevIndex]: totalPrevPages - 1 }));
    }
  };

  //verifie si on est sur la derniere page de la derniere section
  const isLastPage =
    currentSectionIndex === sections.length - 1 &&
    currentLessonPage === totalLessonPages - 1;

  return (
    <div className="bg-card rounded-3xl border border-blue/20 p-4 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="px-2 mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-muted">{title}</h1>
        {/* Infos section */}
        <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
          <span className="flex items-center gap-1 text-muted font-medium">
            <BookOpen size={14} className="sm:w-4 sm:h-4" /> {t("chapter")} {section.ordre} / {sections.length}
          </span>
        </div>
        {/* Durée du cours */}
        <p>{course.duration}</p>
      </div>

  {/* =====================
          Affichage des leçons
      ===================== */}
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
          <p className="text-center text-sm sm:text-base text-gray-500 mt-4"> {t("leconNondispo")}</p>
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
          {isLastPage ? t("finish")  : t("ChapitreSuiv")}
          {!isLastPage && <ChevronRight size={14} className="sm:w-4 sm:h-4" />}
        </button>
      </div>

      {isLastPage && (
        <div className="mb-4 p-4 text-center">
          <p className="text-green-700 font-semibold text-sm sm:text-base">{t("coursTermine")}!</p>
        </div>
      )}
    </div>
  );
}