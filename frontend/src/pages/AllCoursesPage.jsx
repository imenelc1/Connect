import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
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
import { getCurrentUserId } from "../hooks/useAuth";




const gradientMap = {
  Débutant: "bg-grad-2",
  Intermédiaire: "bg-grad-3",
  Avancé: "bg-grad-4",
};



export default function AllCoursesPage() {
 const token = localStorage.getItem("access_token");
    const currentUserId = getCurrentUserId();
    const [categoryFilter, setCategoryFilter] = useState("all"); // "mine" ou "all"

  const [courses, setCourses] = useState([]);
useEffect(() => {
  fetch("http://localhost:8000/api/courses/api/cours")
    .then(res => res.json())
    .then(data => {
      
      const formatted = data.map(c => ({
        id:c.id_cours,
        title: c.titre_cour,
        description: c.description,
        level: c.niveau_cour_label,  // ATTENTION : django = 'beginner' ? 'intermediate' ?
        //levelLabel: t(`levels.${c.niveau_cour_label}`),
        duration: c.duration_readable,
        author: c.utilisateur_name,
        initials: c.utilisateur_name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase(),
        isMine: c.utilisateur === currentUserId //NEWDED GHR ISMINE //
      }));
      setCourses(formatted);
    })
    .catch(err => console.error("Erreur chargement cours :", err));
}, []);
    const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const { t } = useTranslation("allcourses");
const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const navigate = useNavigate();

  const [filterLevel, setFilterLevel] = useState("ALL");
  const filteredCourses =
    filterLevel === "ALL"
      ? courses
      : courses.filter((course) => course.level === filterLevel);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

const handleDeleteCourse = async (courseId) => {
  const confirmDelete = window.confirm("Tu es sûr de supprimer ce cours ?");
  if (!confirmDelete) return;

  // Appel API
  try {
    await fetch(`http://localhost:8000/api/courses/cours/${courseId}/delete/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Mise à jour du state
    setCourses(prev => prev.filter(c => c.id !== courseId));
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
<UserCircle initials={initials}  onToggleTheme={toggleDarkMode}
  onChangeLang={(lang) => i18n.changeLanguage(lang)} />
<div
  className="fixed top-6 right-[88px] w-12 h-12 rounded-full bg-white 
             text-gray-700 shadow-lg flex items-center justify-center 
             cursor-pointer hover:bg-gray-100 transition z-50"
>
  <Bell size={22} strokeWidth={1.8} />
</div>


      <main
        className="flex-1 p-4 md:p-8 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Top */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{t("coursesTitle")}</h1>

      </div>
        {/* Search */}
        <ContentSearchBar />

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
            onDelete={handleDeleteCourse} 
          />
        ))}
      </div>
      </main>
    </div>
  );
}