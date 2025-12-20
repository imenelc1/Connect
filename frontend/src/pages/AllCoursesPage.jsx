import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/common/NavBar.jsx";
import { Plus, Bell } from "lucide-react";
import ContentCard from "../components/common/ContentCard";
import Button from "../components/common/Button.jsx";
import ContentFilters from "../components/common/ContentFilters";
import ContentSearchBar from "../components/common/ContentSearchBar";
import { useTranslation } from "react-i18next";
import UserCircle from "../components/common/UserCircle";
import i18n from "../i18n";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext.jsx";
import { getCurrentUserId } from "../hooks/useAuth";
import progressionService from "../services/progressionService";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";

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
  const [courseProgress, setCourseProgress] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation("allcourses");
  const { toggleDarkMode } = useContext(ThemeContext);


  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const initials = `${userData?.nom?.[0] || ""}${
    userData?.prenom?.[0] || ""
  }`.toUpperCase();

  const [filterLevel, setFilterLevel] = useState("ALL");
  let filteredCourses =
    filterLevel === "ALL"
      ? courses
      : courses.filter((course) => course.level === filterLevel);

  // 2️⃣ Filtrer par catégorie ("mine" ou "all") pour enseignants
  if (userRole === "enseignant" && categoryFilter === "mine") {
    filteredCourses = filteredCourses.filter((course) => course.isMine);
  }



  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Tu es sûr de supprimer ce cours ?")) return;
    try {
      await fetch(
        `http://localhost:8000/api/courses/cours/${courseId}/delete/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur lors de la suppression");
    }
  };

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

 useEffect(() => {
  const fetchProgress = async () => {
    try {
      const data = await progressionService.getCoursesProgress();
      console.log(
  data.map((c) => c.niveau_cour_label)
);

      const formatted = data.map((c) => ({
        id: c.id_cours,
        title: c.titre_cour,
        description: c.description,
        level: c.niveau_cour_label,
        duration: c.duration_readable,
        author: c.utilisateur_name,
        initials: c.utilisateur_name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
        isMine: c.utilisateur === currentUserId,
        progress: c.progress ?? 0,
        action: c.action,
        lastLessonId: c.last_lesson_id,

      }));

      setCourses(formatted);
    } catch (err) {
      console.error("Erreur chargement cours :", err);
    }
  };

  fetchProgress();
}, [currentUserId]);

  const handleCompleteLesson = async (lessonId) => {
    try {
      const data = await progressionService.completeLesson(lessonId);
      setCourses((prev) =>
        prev.map((c) =>
          c.id === data.cours_id ? { ...c, progress: data.avancement_cours } : c
        )
      );
    } catch (err) {
      console.error("Erreur completion leçon :", err);
      alert("Impossible de compléter la leçon");
    }
  };

  return (
    <div className="flex min-h-screen bg-surface dark:bg-gray-900">
      <Navbar />
      
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
      <main
        className="flex-1 p-4 md:p-8 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-muted">{t("coursesTitle")}</h1>
        </div>
        <ContentSearchBar />
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
<div
  className="grid gap-6"
  style={{
    gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))`,
  }}
>
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
              navigate(`/course/${course.id_cours}/lesson/first`);
            } else if (course.action === "continue") {
              navigate(
                `/course/${course.id_cours}/lesson/${course.last_lesson_id}`
              );
            } else if (course.action === "restart") {
              navigate(`/course/${course.id_cours}/lesson/first`);
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