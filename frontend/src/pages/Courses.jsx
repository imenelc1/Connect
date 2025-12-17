import React, { useState, useContext, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext.jsx";
import UserCircle from "../components/common/UserCircle.jsx";
import ContentSearchBar from "../components/common/ContentSearchBar.jsx";
import CoursesSidebarItem from "../components/ui/CourseSidebarItem.jsx";
import CourseContent from "../components/ui/CourseContent.jsx";
import HeadMascotte from "../components/ui/HeadMascotte.jsx";
import IaAssistant from "../components/ui/IaAssistant.jsx";
import api from "../services/courseService";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";
export default function Courses() {
  const { t, i18n } = useTranslation("courses");
  const { toggleDarkMode } = useContext(ThemeContext);
  const { id: coursId } = useParams();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const userData = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  const initials = userData ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase() : "";

  const [sections, setSections] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [courseProgress, setCourseProgress] = useState(0);
  const [initialLessonPage, setInitialLessonPage] = useState(0);

  const lastLessonId = location.state?.lastLessonId;

  useEffect(() => {
    if (!coursId) return;

    const fetchCourse = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const res = await api.get(`courses/courses/${coursId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setTitle(data.titre_cour);
        setDescription(data.description);
        setDuration(data.duration);
        setLevel(data.niveau_cour);

        const fetchedSections = (data.sections || []).map(sec => ({
          id: sec.id_section,
          title: sec.titre_section,
          description: sec.description || "",
          open: true,
          ordre: sec.ordre,
          lessons: (sec.lecons || []).map(lec => ({
            id: lec.id_lecon,
            title: lec.titre_lecon,
            content: lec.contenu_lecon,
            type: lec.type_lecon,
            preview:
              lec.type_lecon === "image"
                ? `http://localhost:8000/media/${lec.contenu_lecon.replace(/\\/g, "/")}`
                : null
          }))
        }));

        /* 🔥 POSITIONNEMENT AUTOMATIQUE */
        if (lastLessonId) {
          const LESSONS_PER_PAGE = 2;

          for (let secIndex = 0; secIndex < fetchedSections.length; secIndex++) {
            const lessons = fetchedSections[secIndex].lessons;
            const lessonIndex = lessons.findIndex(l => l.id === lastLessonId);

            if (lessonIndex !== -1) {
              setCurrentSectionIndex(secIndex);
              setInitialLessonPage(Math.floor(lessonIndex / LESSONS_PER_PAGE));
              break; // stop dès qu’on trouve la leçon
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

  return (
    <div className="w-full bg-surface flex flex-col items-center">
      <header className="w-full max-w-7xl flex flex-col gap-4 py-6 px-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-muted md:ml-10">{t("title")}</h1>
        <div className="hidden sm:flex sm:flex-row w-full gap-3 md:gap-4 items-center md:w-auto">
          <div className="relative w-full sm:w-64 md:w-80">
            <ContentSearchBar />
          </div>
          <IaAssistant />
          <HeadMascotte />
           
      <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
        <NotificationBell />
        <UserCircle
          initials={initials}
          onToggleTheme={toggleDarkMode}
          onChangeLang={(lang) => {
            const i18n = window.i18n;
            if (i18n?.changeLanguage) i18n.changeLanguage(lang);
          }}
        />
      </div>
        </div>
      </header>
      <div className="w-full max-w-7xl px-4 pb-10 flex flex-col lg:flex-row gap-6 relative">
        <div className="block">
          <CoursesSidebarItem
            sections={sections}
            currentSectionIndex={currentSectionIndex}
            setCurrentSectionIndex={setCurrentSectionIndex}
          />
        </div>
       <CourseContent
  course={{ title, description, level, duration, sections, id: coursId }}
  currentSectionIndex={currentSectionIndex}
  setCurrentSectionIndex={setCurrentSectionIndex}
  setSections={setSections}
  setCourseProgress={setCourseProgress}
  currentLessonPage={initialLessonPage} // Passe la page initiale
  setCurrentLessonPage={setInitialLessonPage} // Permet de la mettre à jour depuis CourseContent
/>

      </div>
    </div>
  );
}
