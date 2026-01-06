import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/common/Navbar.jsx";
import { Plus } from "lucide-react";
import ContentCard from "../components/common/ContentCard";
import Button from "../components/common/Button.jsx";
import ContentFilters from "../components/common/ContentFilters";
import ContentSearchBar from "../components/common/ContentSearchBar";
import { useTranslation } from "react-i18next";
import UserCircle from "../components/common/UserCircle";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext.jsx";
import { getCurrentUserId } from "../hooks/useAuth";
import progressionService from "../services/progressionService";
import NotificationBell from "../components/common/NotificationBell";

const gradientMap = {
  Débutant: "bg-grad-2",
  Intermédiaire: "bg-grad-3",
  Avancé: "bg-grad-4",
};

export default function AllCoursesPage() {
  const token = localStorage.getItem("token");
  const currentUserId = getCurrentUserId();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const { t } = useTranslation("contentPage");
  const { toggleDarkMode } = useContext(ThemeContext);

  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();

  // Fetch courses + progress
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await progressionService.getCoursesProgress();

        const formatted = data.map((c) => {
          const nom = c.utilisateur_name || "Nom Inconnu";

          // ✅ Initiales Nom + Prénom
          const initials = nom
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          return {
            id: c.id_cours,
            title: c.titre_cour,
            description: c.description,
            level: c.niveau_cour_label,
            duration: c.duration_readable,
            author: nom,
            initials: initials, // ✅ BA, MA, etc
            isMine: c.utilisateur === currentUserId,
            progress: c.progress ?? 0,
            action: c.action,
            lastLessonId: c.last_lesson_id,
            visible: c.visibilite_cour === true || c.utilisateur === currentUserId,
          };
        });



        setCourses(formatted);
      } catch (err) {
        console.error("Erreur chargement cours :", err);
      }
    };

    fetchCourses();
  }, [currentUserId]);

  // Handle delete
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Tu es sûr de supprimer ce cours ?")) return;
    try {
      await fetch(`http://localhost:8000/api/courses/cours/${courseId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur lors de la suppression");
    }
  };

  // Handle window resize
  useEffect(() => {
    const resizeHandler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  // Sidebar collapsed
  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 60 : 240;
  const getGridCols = () => (windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3);

  // Filtered + search
  let filteredCourses = courses
    .filter((c) => c.visible)
    .filter((c) => filterLevel === "ALL" || c.level === filterLevel)
    .filter((c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (userRole === "enseignant" && categoryFilter === "mine") {
    filteredCourses = filteredCourses.filter((c) => c.isMine);
  }

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
                  {/* Sidebar */}
                  <div>
                    <Navbar />
                  </div>
     
      <main className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
                <header className="flex flex-row justify-between items-center gap-3 sm:gap-4 mb-6">
          {/* Titre */}
          <h1 className="text-lg sm:text-2xl font-bold text-muted truncate">
            {t("coursesTitle")}
          </h1>
        
          {/* Notifications + User */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => window.i18n?.changeLanguage(lang)}
            />
          </div>
        </header>
       

        <ContentSearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <div className="mt-6 mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <ContentFilters
            type="courses"
            userRole={userRole}
            activeFilter={filterLevel}
            onFilterChange={setFilterLevel}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            showCompletedFilter={userRole === "etudiant"}
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

        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
          {filteredCourses.map((course, idx) => (
            <ContentCard
              key={idx}
              className={gradientMap[course.level]}
              course={course}
              role={userRole}
              showProgress={userRole === "etudiant"}
              onDelete={handleDeleteCourse}
            >
              {userRole === "etudiant" && (
                <Button
                
                  variant="courseStart"
                  className="mt-2 w-full"
                  
                  onClick={() => {
                    if (course.action === "start") {
                      navigate(`/course/${course.id}/lesson/first`);
                    } else if (course.action === "continue") {
                      navigate(`/course/${course.id}/lesson/${course.lastLessonId}`);
                    } else if (course.action === "restart") {
                      navigate(`/course/${course.id}/lesson/first`);
                    }
                  }}
                >
                  {course.action === "start" && t("startCourse")}
                  {course.action === "continue" && t("continueCourse")}
                  {course.action === "restart" && t("restartCourse")}
                </Button>
              )}
            </ContentCard>
          ))}
        </div>
      </main>
    </div>
  );
}