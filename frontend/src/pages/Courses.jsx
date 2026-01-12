import React, { useState, useContext, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext.jsx";
import UserCircle from "../components/common/UserCircle.jsx";
import ContentSearchBar from "../components/common/ContentSearchBar.jsx";
import CoursesSidebarItem from "../components/ui/CourseSidebarItem.jsx";
import CourseContent from "../components/ui/CourseContent.jsx";
import HeadMascotte from "../components/ui/HeadMascotte.jsx";
import api from "../services/courseService";
import progressionService from "../services/progressionService";
import CourseContext from "../context/CourseContext";
import { useNavigate } from "react-router-dom";



export default function Courses() {
  const { t, i18n } = useTranslation("courses");
  const { toggleDarkMode } = useContext(ThemeContext);
  const { id: coursId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  //Verifer pour l'ia 
  const [courseAiEnabled, setCourseAiEnabled] = useState(true);

  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";
  const userId = userData?.user_id || userData?.id_utilisateur || userData?.id || null;
  const userRole = userData?.role || "";

  const [sections, setSections] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [courseProgress, setCourseProgress] = useState(0);
  const [initialLessonPage, setInitialLessonPage] = useState(0);
  const currentCourse = sections.length > 0
    ? { id: coursId, title, description, level, duration, sections }
    : null;


  // **NOUVEAU** pour gérer la page par section
  const [sectionPages, setSectionPages] = useState({});

  const lastLessonId = location.state?.lastLessonId;

  // Marquer une leçon comme visitée
  const markLessonVisited = async (lessonId) => {
    try {
      // Appel backend pour marquer la leçon
      const res = await progressionService.completeLesson(lessonId);

      // Mettre à jour la progression globale du cours
      if (res?.course_progress !== undefined) {
        setCourseProgress(res.course_progress);
      }

      // Mettre à jour localement la leçon comme visitée
      setSections(prev =>
        prev.map((sec) => ({
          ...sec,
          lessons: sec.lessons.map((l) =>
            l.id === lessonId ? { ...l, visited: true } : l
          ),
        }))
      );
    } catch (err) {
      console.error("Erreur lors du marquage de la leçon :", err);
    }
  };


  useEffect(() => {
    if (!coursId) return;

    const fetchCourse = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await api.get(`courses/courses/${coursId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setTitle(data.titre_cour);
        setDescription(data.description);
        setDuration(data.duration);
        setLevel(data.niveau_cour);

        const fetchedSections = (data.sections || []).map((sec) => ({
          id: sec.id_section,
          title: sec.titre_section,
          description: sec.description || "",
          open: true,
          ordre: sec.ordre,
          lessons: (sec.lecons || []).map((lec) => ({
            id: lec.id_lecon,
            title: lec.titre_lecon,
            content: lec.contenu_lecon,
            type: lec.type_lecon,
            visited: lec.visited,
            preview:
              lec.type_lecon === "image"
                ? `http://localhost:8000/media/${lec.contenu_lecon.replace(/\\/g, "/")}`
                : null,
          })),
        }));

        /* POSITIONNEMENT AUTOMATIQUE */
        if (lastLessonId) {
          const LESSONS_PER_PAGE = 2;
          for (let secIndex = 0; secIndex < fetchedSections.length; secIndex++) {
            const lessons = fetchedSections[secIndex].lessons;
            const lessonIndex = lessons.findIndex((l) => l.id === lastLessonId);
            if (lessonIndex !== -1) {
              setCurrentSectionIndex(secIndex);
              setInitialLessonPage(Math.floor(lessonIndex / LESSONS_PER_PAGE));
              setSectionPages({ [secIndex]: Math.floor(lessonIndex / LESSONS_PER_PAGE) });
              break;
            }
          }
        }

        setSections(fetchedSections);
      } catch (err) {
        console.error("Erreur chargement cours :", err.response?.data || err);
      }
    };

    fetchCourse();
  }, [coursId, lastLessonId]);

  const updateSectionProgress = (sectionIndex, lessonId) => {
    setSections((prev) =>
      prev.map((sec, i) => {
        if (i !== sectionIndex) return sec;

        const updatedLessons = sec.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, visited: true } : lesson
        );

        const visitedCount = updatedLessons.filter((l) => l.visited).length;
        const progress = Math.round((visitedCount / updatedLessons.length) * 100);

        return {
          ...sec,
          lessons: updatedLessons,
          progress,
          completed: progress === 100,
        };
      })
    );
  };

useEffect(() => {
  if (!coursId  || !userId) return;
  if(userRole !== "etudiant") return;
  const checkAIStatusForCourse = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/spaces/cours/${coursId}/student/${userId}/check/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erreur vérification IA pour le cours");

      const data = await res.json();

      // si un espace commun existe et que ai_enabled === false => IA désactivée
      if (data.same_space) {
        const disabled = data.spaces.some(space => space.ai_enabled === false);
        setCourseAiEnabled(!disabled);
      } else {
        setCourseAiEnabled(true);
      }
    } catch (err) {
      console.error("Erreur vérification IA pour le cours :", err);
      setCourseAiEnabled(true); // fallback : IA activée
    }
  };

  checkAIStatusForCourse();
}, [coursId, userId]);
console.log({courseAiEnabled});

  return (
    <CourseContext.Provider
      value={{
        id: coursId,
        title,
        description,
        level,
        duration,
        sections,
      }}
    >
      <div className="w-full bg-surface flex flex-col items-center">
        <header className="w-full max-w-7xl flex flex-col gap-4 py-6 px-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-muted md:ml-10">{t("title")}</h1>
          <div className="hidden sm:flex sm:flex-row w-full gap-3 md:gap-4 items-center md:w-auto">
            <div className="relative w-full sm:w-64 md:w-80">
              <ContentSearchBar />
            </div>
            <HeadMascotte
  courseData={
    sections.length > 0
      ? {
          id: coursId,
          title,
          description,
          level,
          duration,
          sections,
        }
      : null
  }
  aiEnabled={courseAiEnabled} // <-- nouveau prop
/>




            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => i18n.changeLanguage(lang)}
            />
          </div>
        </header>

        <div className="w-full max-w-7xl px-4 pb-10 flex flex-col lg:flex-row gap-6 relative">
          <CoursesSidebarItem
            sections={sections}
            currentSectionIndex={currentSectionIndex}
            setCurrentSectionIndex={setCurrentSectionIndex}
          />
          <CourseContent
            course={{ title, description, level, duration, sections, id: coursId }}
            currentSectionIndex={currentSectionIndex}
            setCurrentSectionIndex={setCurrentSectionIndex}
            setSections={setSections}
            sectionPages={sectionPages}
            setSectionPages={setSectionPages}
            currentLessonPage={initialLessonPage}
            setCurrentLessonPage={setInitialLessonPage}
            updateSectionProgress={updateSectionProgress}
            markLessonVisited={markLessonVisited} // <-- ici
          />

        </div>
      </div>
    </CourseContext.Provider>
  );
}