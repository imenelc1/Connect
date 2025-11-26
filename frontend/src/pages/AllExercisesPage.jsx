import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/common/Navbar";
import { Plus, Bell } from "lucide-react";
import ContentCard from "../components/common/ContentCard";
import Button from "../components/common/Button";
import ContentFilters from "../components/common/ContentFilters";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import { useTranslation } from "react-i18next";
import ThemeButton from "../components/common/ThemeButton";
const exercises = [
  {
    title: "Exercice sur les Arbres Binaires",
    description: "Résolvez des problèmes sur les arbres binaires, AVL, et parcours.",
    level: "intermediate",
    duration: "45 min",
    author: "Dr. Farid",
    initials: "F.D",
    isMine: true,
  },
  {
    title: "Exercice Programmation Dynamique",
    description: "Apprenez à formuler et résoudre des problèmes classiques de DP.",
    level: "advanced",
    duration: "1h 10 min",
    author: "Dr. Benali",
    initials: "B.A",
    isMine: false,
  },
];

const gradientMap = {
  beginner: "bg-grad-2",
  intermediate: "bg-grad-3",
  advanced: "bg-grad-4",
};

export default function AllExercisesPage() {
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const { t } = useTranslation("allExercises");

  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();

  const [filterLevel, setFilterLevel] = useState("ALL");
  const filteredList =
    filterLevel === "ALL"
      ? exercises
      : exercises.filter((e) => e.level === filterLevel);

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

  const getGridCols = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  const { toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="flex bg-surface min-h-screen">
      <Navbar />
      <UserCircle initials={initials} />

      <div className="fixed top-6 right-[88px] w-12 h-12 rounded-full bg-white text-gray-700 shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition z-50">
        <ThemeButton onClick={toggleDarkMode} />
        <Bell size={22} strokeWidth={1.8} />
      </div>

      <main
        className="flex-1 p-4 md:p-8 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("exercisesTitle")}</h1>
        </div>

        <ContentSearchBar />

        <div className="mt-6 mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <ContentFilters
            showCompletedFilter={userRole === "etudiant"}
            onFilterChange={setFilterLevel}
            activeFilter={filterLevel}
          />

          {userRole === "enseignant" && (
            <Button variant="courseStart" className="w-full sm:w-60">
              <Plus size={18} />
              {t("createExerciseBtn")}
            </Button>
          )}
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
          {filteredList.map((exercise, idx) => (
            <ContentCard
              key={idx}
              className={gradientMap[exercise.level]}
              course={{
                ...exercise,
                level: t(`levels.${exercise.level}`),
              }}
              role={userRole}
              showProgress={userRole === "etudiant"}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
