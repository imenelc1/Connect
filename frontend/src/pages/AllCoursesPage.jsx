import React, { useEffect, useState } from "react";
import Navbar from "../components/common/NavBar";
import { Plus,Bell } from "lucide-react";
import ContentCard from "../components/common/ContentCard";
import Button from "../components/common/Button";
import ContentFilters from "../components/common/ContentFilters";
import ContentSearchBar from "../components/common/ContentSearchBar";
import { useTranslation } from "react-i18next";
import UserCircle from "../components/common/UserCircle";
import i18n from "../i18n";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
const courses = [
  {
    title: "Structures de Données",
    description: "Explorez les arbres, graphes, tables de hachage et structures de données complexes.",
    level: "beginner",
    duration: "1h 30min",
    author: "Dr. Cheikh Farid",
    initials: "C.F",
    isMine: true,
  },
  {
    title: "Algorithmes Avancés",
    description: "Optimisation, complexité, et techniques avancées pour résoudre des problèmes complexes.",
    level: "advanced",
    duration: "2h 15min",
    author: "Dr. Alice Benali",
    initials: "A.B",
    isMine: false,
  },
  {
    title: "Systèmes Informatiques",
    description: "Architecture, compilation et fonctionnement interne d’un système moderne.",
    level: "intermediate",
    duration: "2h 15min",
    author: "Dr. Alice Benali",
    initials: "A.B",
    isMine: true,
  },
];

const gradientMap = {
  beginner: "bg-grad-2",
  intermediate: "bg-grad-3",
  advanced: "bg-grad-4",
};



export default function AllCoursesPage() {
  const { t } = useTranslation("allcourses");

const storedUser = localStorage.getItem("user");

//  Si storedUser est null, vide ou "undefined", on renvoie null
const userData =
  storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

const userRole = userData?.role ?? null;
const initials = userData
  ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
  : "";

  const navigate = useNavigate();

  const [filterLevel, setFilterLevel] = useState("ALL");
  const filteredCourses =
    filterLevel === "ALL"
      ? courses
      : courses.filter((course) => course.level === filterLevel);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  useEffect(() => {
    const resizeHandler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 60 : 240;

  // Définition dynamique du nombre de colonnes
  const getGridCols = () => {
    if (windowWidth < 640) return 1; // mobile
    if (windowWidth < 1024) return 2; // tablette
    if (sidebarCollapsed) return 3; // desktop sidebar fermé
    return 3; // desktop sidebar ouvert (fixé pour garder taille ancienne version)
  };

  const { toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="flex bg-surface min-h-screen">
      <Navbar />
{/* Header Right Controls */}
<div className="fixed top-6 right-6 flex items-center gap-4 z-50">

  {/* Notification Icon */}
  <div className="bg-bg w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-sm">
    <Bell size={18} />
  </div>

  {/* User Circle */}
  <div className="flex items-center">
    <UserCircle
      initials={initials}
      onToggleTheme={toggleDarkMode}
      onChangeLang={(lang) => i18n.changeLanguage(lang)}
    />
  </div>

</div>



      <main
        className="flex-1 p-4 md:p-8 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Top */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-muted">{t("coursesTitle")}</h1>

      </div>
        {/* Search */}
        <ContentSearchBar  />

        {/* Filters */}
        <div className="mt-6 mb-6 flex flex-col sm:flex-row  px-2 sm:px-0 md:px-6 lg:px-2 justify-between gap-4 hover:text-grad-1 transition">
        <ContentFilters
        type="courses"
        userRole={userRole}                  // <-- corrige ici
  activeFilter={filterLevel}           // <- tu utilises filterLevel, pas activeFilter
  onFilterChange={setFilterLevel}      // <- tu as setFilterLevel
  showCompletedFilter={userRole === "etudiant"} // <- correct
        />

        {userRole === "enseignant" && (
          <Button
            variant="courseStart"
            className="w-full sm:w-50 md:w-40 lg:w-80 h-10 md:h-12 lg:h-25 mt-6 bg-primary text-white transition-all"
            onClick={() => navigate("/CoursInfo")}
          >
            <Plus size={18} />
            {t("createCourseBtn")}
          </Button>
        )}

      </div>

        {/* Cards */}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
        {filteredCourses.map((course, idx) => (
          <ContentCard
            key={idx}
            className={gradientMap[course.level] ?? "bg-grad-1"}
            course={course}
            role={userRole}
            showProgress={userRole === "etudiant"}
          />
        ))}
      </div>
      </main>
    </div>
  );
}