import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext.jsx";
import UserCircle from "../components/common/UserCircle.jsx";
import ContentSearchBar from "../components/common/ContentSearchBar.jsx";
import CoursesSidebarItem from "../components/ui/CourseSidebarItem.jsx";
import CourseContent from "../components/ui/CourseContent.jsx";
import HeadMascotte from "../components/ui/HeadMascotte.jsx";
import IaAssistant from "../components/ui/IaAssistant.jsx";
import api from "../services/courseService";

export default function VoirCoursAdmin() {
  const { t, i18n } = useTranslation("courses");
  const { toggleDarkMode } = useContext(ThemeContext);
  const { id_cours: coursId } = useParams();

  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";

  const [sections, setSections] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

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
            preview:
              lec.type_lecon === "image"
                ? `${import.meta.env.VITE_API_BASE}/media/${lec.contenu_lecon.replace(/\\/g, "/")}`
                : null,
          })),
        }));

        setSections(fetchedSections);
      } catch (err) {
        console.error("Erreur chargement cours :", err.response?.data || err);
      }
    };

    fetchCourse();
  }, [coursId]);

  return (
    <div className="w-full bg-surface flex flex-col items-center">
      <header className="w-full max-w-7xl flex flex-col gap-4 py-6 px-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-muted md:ml-10">{title}</h1>
        <div className="hidden sm:flex sm:flex-row w-full gap-3 md:gap-4 items-center md:w-auto">
          <div className="relative w-full sm:w-64 md:w-80">
            <ContentSearchBar />
          </div>
          <IaAssistant />
          <HeadMascotte />
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
           markLessonVisited={() => {}}
           updateSectionProgress={() => {}}
        />
      </div>
    </div>
  );
}
