import React, { useEffect, useState, useContext } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../hooks/useAuth";
import progressionService from "../services/progressionService";
import ThemeContext from "../context/ThemeContext.jsx";

//Les les composants personalisé
import Navbar from "../components/common/Navbar.jsx";
import ContentCard from "../components/common/ContentCard";
import Button from "../components/common/Button.jsx";
import ContentFilters from "../components/common/ContentFilters";
import ContentSearchBar from "../components/common/ContentSearchBar";
import UserCircle from "../components/common/UserCircle";
import NotificationBell from "../components/common/NotificationBell";

//couleur du fond selon le niveau du cours
const gradientMap = {
  Débutant: "bg-grad-2",
  Intermédiaire: "bg-grad-3",
  Avancé: "bg-grad-4",
};

export default function AllCoursesPage() {
  //token et l'utilisateur courant
  const token = localStorage.getItem("token");
  const currentUserId = getCurrentUserId();

  //etats des filtres et recherche
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");

  //responsivité et sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [completedFilter, setCompletedFilter] = useState("");
  
  //liste des cours
  const [courses, setCourses] = useState([]);

  const navigate = useNavigate();
  const { t } = useTranslation("contentPage"); //traduction
  const { toggleDarkMode } = useContext(ThemeContext);

  //recuperer l'utilisateur depuis localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  //initials pour l'avatar
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();

  // recuperer les cours + progression des utilisateurs
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await progressionService.getCoursesProgress();
        //normaliser les données backend => frontend
        const formatted = data.map((c) => {
          const nom = c.utilisateur_name || t("unknownName");

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
        console.error(t("errors.loadCourses"), err);

      }
    };

    fetchCourses();
  }, [currentUserId]);

  // supprimer un cours
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm(t("confirmDeleteCourse"))) return;

    try {
      await fetch(`https://connect-1-t976.onrender.com/api/courses/cours/${courseId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error(t("errors.deleteCourse"), err);
      alert(t("errors.deleteCourse"));

    }
  };

  // gestion de resize ecran
  useEffect(() => {
    const resizeHandler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  // l'etat de la sidebar
  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 60 : 240;
  const getGridCols = () => (windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3); //nombre de colonnes de la grille

  // filtres combiné (visibilité+ niveau + recherche)
  let filteredCourses = courses
  .filter((c) => c.visible)
  .filter((c) => filterLevel === "ALL" || c.level === filterLevel)
  .filter((c) => {
    if (completedFilter === "completed") return c.progress === 100;
    if (completedFilter === "not_completed") return c.progress < 100;
    return true;
  })
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
      {/* Contenu principal */}
      <main className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
        {/* Header */}
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

        {/* Recherche */}
        <ContentSearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        {/* Filtres + bouton création */}
        <div className="mt-6 mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <ContentFilters
            type="courses"
            userRole={userRole}
            activeFilter={filterLevel}
            onFilterChange={setFilterLevel}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            showCompletedFilter={userRole === "etudiant"}
            onCompletedChange={setCompletedFilter} 
          />
          {/* button creation seulement si l'utilisateur=enseignant*/}
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

          {/* Liste des cours */}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
          {filteredCourses.map((course, idx) => (
            <ContentCard
              key={course.id}
              className={gradientMap[course.level]}
              course={course}
              role={userRole}
              showProgress={userRole === "etudiant"}
              onDelete={handleDeleteCourse}
            >
               {/* Bouton action étudiant selon la progression*/}
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
