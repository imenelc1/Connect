import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { Plus,Bell } from "lucide-react";
import ContentCard from "../components/common/ContentCard";
import Button from "../components/common/Button";
import ContentFilters from "../components/common/ContentFilters";
import ContentSearchBar from "../components/common/ContentSearchBar";
import { useTranslation } from "react-i18next";
import UserCircle from "../components/common/UserCircle";
import ThemeButton from "../components/common/ThemeButton";
import ThemeContext from "../context/ThemeContext";
import { useContext } from "react";

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
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const { t } = useTranslation("allcourses");
const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();

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

  return (
    <div className="flex bg-surface min-h-screen">
      <Navbar />
<UserCircle initials={initials} />
<div
  className="fixed top-6 right-[88px] w-12 h-12 rounded-full bg-white 
             text-gray-700 shadow-lg flex items-center justify-center 
             cursor-pointer hover:bg-gray-100 transition z-50"
>
    <ThemeButton onClick={toggleDarkMode} />

  <Bell size={22} strokeWidth={1.8} />
</div>


      <main
        className="flex-1 p-4 md:p-8 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Top */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{t("coursesTitle")}</h1>

        {userRole === "enseignant" && (
          <Button
            variant="courseStart"
            className="!w-full mr-40 sm:!w-auto px-6 flex items-center gap-2"
          >
            <Plus size={18} />
            {t("createCourseBtn")}
          </Button>
        )}
      </div>
        {/* Search */}
        <ContentSearchBar placeholder={t("searchPlaceholder")} />


        {/* Filters */}
        <div className="mt-6 mb-6">
       <ContentFilters
  showCompletedFilter={userRole === "student"}
  onFilterChange={setFilterLevel}
  activeFilter={filterLevel}
/>
      </div>

        {/* Cards */}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
        {filteredCourses.map((item, idx) => (
  <ContentCard
    key={idx}
    className={gradientMap[item.level] ?? "bg-grad-1"}
    item={{
      ...item,
      level: t(`levels.${item.level}`) // traduction du niveau
    }}
    role={userRole}
    showProgress={userRole === "student"}
  />
))}

      </div>
      </main>
    </div>
  );
}
