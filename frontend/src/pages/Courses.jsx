import React, { useState, useContext } from "react";
import { Menu } from "lucide-react";
import CoursesSidebarItem from "../components/ui/CourseSidebarItem.jsx";
import CourseContent from "../components/ui/CourseContent.jsx";
import { useTranslation } from "react-i18next";
import UserCircle from "../components/common/UserCircle.jsx";
import ThemeContext from "../context/ThemeContext.jsx";
import HeadMascotte from "../components/ui/HeadMascotte.jsx";
import IaAssistant from "../components/ui/IaAssistant.jsx";
import ContentSearchBar from "../components/common/ContentSearchBar.jsx";
import api from "../services/courseService";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { getCurrentUserId } from "../hooks/useAuth";

export default function Courses() {
  const { t, i18n } = useTranslation("courses");
  const { toggleDarkMode } = useContext(ThemeContext);

  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";

  const [collapsed, setCollapsed] = useState(false);

  const { id: coursId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
const [sections, setSections] = useState([
    {
      id: 1,
      title: "",
      description: "", // ⭐ AJOUTÉ
      open: true,
      ordre:"",
      lessons: [{ id: 1, title: "", content: "" }], // ⭐ AJOUTÉ
    },
  ]);

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
            preview: lec.type_lecon === "image"
  ? `http://localhost:8000/media/${lec.contenu_lecon.replace(/\\/g, "/")}`
  : null
          })),
        }));

        setSections(fetchedSections);
      } catch (err) {
        console.error("Erreur chargement cours :", err.response?.data || err);
      }
    };

    fetchCourse();
  }, [coursId]);
  console.log( coursId,title,+"niii //", description);




  return (
    <div className="w-full bg-surface flex flex-col items-center">

      {/* HEADER */}
      <header className="w-full max-w-7xl flex flex-col gap-4 py-6 px-4 md:flex-row md:items-center md:justify-between">

        {/* TITLE */}
        <h1 className="text-2xl md:text-3xl font-bold text-muted md:ml-10">
          {t("title")}
        </h1>

        {/* ROW MOBILE : SEARCH + CHAPITRES */}
        <div className="flex w-full items-center gap-3 sm:hidden">
          {/* SEARCH */}
         
            <ContentSearchBar />
          

          {/* CHAPTER BUTTON */}
          <button
            className="bg-blue text-white px-3 py-2 rounded-xl flex items-center gap-1 whitespace-nowrap"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu size={18} />
            {t("chapters")}
          </button>
        </div>

        {/* DESKTOP ROW */}
        <div className="hidden sm:flex sm:flex-row w-full gap-3 md:gap-4 items-center md:w-auto">
          {/* SEARCH DESKTOP */}
          <div className="relative w-full sm:w-64 md:w-80">
            <input
              placeholder={t("search")}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-blue/30 shadow-sm"
            />
          </div>

          {/* ICONS */}
          <IaAssistant />
          <HeadMascotte />

          <UserCircle
            initials={initials}
            onToggleTheme={toggleDarkMode}
            onChangeLang={(lang) => i18n.changeLanguage(lang)}
          />
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="w-full max-w-7xl px-4 pb-10 flex flex-col lg:flex-row gap-6 relative">
        {/* SIDEBAR */}
        <div className={`${collapsed ? "hidden lg:block" : "block"}`}>
          
<CoursesSidebarItem
  sections={sections}
  currentSectionIndex={currentSectionIndex}
  setCurrentSectionIndex={setCurrentSectionIndex}
/>
        </div>

        {/* CONTENT */}
       
<CourseContent
  course={{ title, description, level, duration, sections }}
  currentSectionIndex={currentSectionIndex}
  setCurrentSectionIndex={setCurrentSectionIndex}
/>
      </div>
    </div>
  );
}
