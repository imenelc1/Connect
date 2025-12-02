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
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const quizzes = [
  {
    title: "Quiz Structures de Données",
    description: "Testez vos connaissances sur les piles, files, arbres et graphes.",
    level: "beginner",
    duration: "20 questions",
    author: "Dr. Farid",
    initials: "F.D",
    isMine: true,
  },
  {
    title: "Quiz Algorithmique Avancée",
    description: "Un quiz difficile basé sur optimisation et complexité.",
    level: "advanced",
    duration: "25 questions",
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

export default function AllQuizzesPage() {
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const { t } = useTranslation("allQuizzes");
const navigate = useNavigate();

  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();

  const [filterLevel, setFilterLevel] = useState("ALL");
  const filteredList =
    filterLevel === "ALL"
      ? quizzes
      : quizzes.filter((q) => q.level === filterLevel);

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
     {/* Header Right Controls */}
     <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
     
       {/* Notification Icon */}
       <div className="bg-bg w-7 h-7 rounded-full flex items-center justify-center">
                  <Bell size={16} />
       </div>
     
       {/* User Circle */}
       <UserCircle
         initials={initials}
         onToggleTheme={toggleDarkMode}
         onChangeLang={(lang) => i18n.changeLanguage(lang)}
       />
     </div>

      <main
        className="flex-1 p-4 md:p-8 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("quizzesTitle")}</h1>
        </div>

        <ContentSearchBar />

        <div className="mt-6 mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <ContentFilters
            type="quizzes"
  userRole={userRole}
  onFilterChange={setFilterLevel}   // ✔️ correction
  activeFilter={filterLevel}        // ✔️ correction
  showCompletedFilter={userRole === "etudiant"}
          />

          {userRole === "enseignant" && (
            <Button variant="courseStart"
            onClick={() => navigate("/create-quiz")}

             className="w-full sm:w-50 md:w-40 lg:w-80 h-10 md:h-12 lg:h-25 mt-6 bg-primary text-white transition-all">
              <Plus size={18} />
              {t("createQuizBtn")}
            </Button>
          )}
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
          {filteredList.map((quiz, idx) => (
            <ContentCard
              key={idx}
              className={gradientMap[quiz.level]}
              course={quiz}
              role={userRole}
              showProgress={userRole === "etudiant"}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
