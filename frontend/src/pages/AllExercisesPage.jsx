import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/common/NavBar";
import { Plus, Bell } from "lucide-react";
import ContentCard from "../components/common/ContentCard";
import Button from "../components/common/Button";
import ContentFilters from "../components/common/ContentFilters";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import { useTranslation } from "react-i18next";
import ThemeButton from "../components/common/ThemeButton";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../hooks/useAuth";
import api from "../services/courseService";



const gradientMap = {
  Débutant: "bg-grad-2",
  Intermédiaire: "bg-grad-3",
  Avancé: "bg-grad-4",
};



export default function AllCoursesPage() {
  const token = localStorage.getItem("access_token");
  const currentUserId = getCurrentUserId();

  const [exercises, setExercice] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8000/api/exercices/api/exo")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error("Data récupérée n'est pas un tableau :", data);
          setExercice([]); // sécurité
          return;
        }
        const formatted = data.map(c => ({
          id: c.id_exercice,
          title: c.titre_exo,
          level: c.niveau_exercice_label,
          description: c.enonce,
          author: c.utilisateur_name,
          initials: c.utilisateur_name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase(),
          isMine: c.utilisateur === currentUserId
        }));
        setExercice(formatted);
      })
      .catch(err => {
        console.error("Erreur chargement exercices :", err);
        setExercice([]);
      });
  }, []);



  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const { t } = useTranslation("allExercises");
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const navigate = useNavigate();

  const [filterLevel, setFilterLevel] = useState("ALL");
  const filteredexercises =
    filterLevel === "ALL"
      ? exercises
      : exercises.filter((exercise) => exercise.level === filterLevel);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleDeleteExo = async (exoId) => {
    const confirmDelete = window.confirm("Tu es sûr de supprimer cet exercice?");
    if (!confirmDelete) return;

    // Appel API
    try {
      await fetch(`http://localhost:8000/api/exercices/exercice/${exoId}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Mise à jour du state
      setExercice(prev => prev.filter(c => c.id !== exoId));
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
      {/* Header Right Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">

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
        {/* Top */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-muted">{t("exercisesTitle")}</h1>

        </div>
        {/* Search */}
        <ContentSearchBar />

        {/* Filters */}
        <div className="mt-6 mb-6 flex flex-col sm:flex-row  px-2 sm:px-0 md:px-6 lg:px-2 justify-between gap-4 hover:text-grad-1 transition">
          <ContentFilters
            type="exercises"
            userRole={userRole}                  // <-- corrige ici
            activeFilter={filterLevel}           // <- tu utilises filterLevel, pas activeFilter
            onFilterChange={setFilterLevel}      // <- tu as setFilterLevel
            showCompletedFilter={userRole === "etudiant"} // <- correct
          />

          {userRole === "enseignant" && (
            <Button
              variant="courseStart"
              className="w-full sm:w-50 md:w-40 lg:w-80 h-10 md:h-12 lg:h-25 mt-6 bg-primary text-white transition-all"
              onClick={() => navigate("/ListeExercices")}
            >
              <Plus size={18} />
              {t("createExerciseBtn")}
            </Button>
          )}

        </div>

        {/* Cards */}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
          {filteredexercises?.map((exercise, idx) => (
            <ContentCard
              key={idx}
              className={gradientMap[exercise.level] ?? "bg-grad-1"}
              course={exercise}
              type="exercise"
              role={userRole}
              showProgress={userRole === "etudiant"}
              onDelete={handleDeleteExo}
            />
          ))}

        </div>
      </main>
    </div>
  );
}
