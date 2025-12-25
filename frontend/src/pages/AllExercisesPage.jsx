import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/common/NavBar";
import { Plus, Bell } from "lucide-react";
import ContentCard from "../components/common/ContentCard";
import Button from "../components/common/Button";
import ContentFilters from "../components/common/ContentFilters";
import ContentSearchBar from "../components/common/ContentSearchBar";
import { useTranslation } from "react-i18next";
import UserCircle from "../components/common/UserCircle";
import i18n from "../i18n";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext.jsx";
import { getCurrentUserId } from "../hooks/useAuth";
import api from "../services/courseService";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";

import ExerciseCard from "../components/common/ExerciseCard";

const gradientMap = {
  Débutant: "bg-grad-2",
  Intermédiaire: "bg-grad-3",
  Avancé: "bg-grad-4",
};

export default function AllExercisesPage() {
  const token = localStorage.getItem("token");
  const currentUserId = getCurrentUserId();
  const navigate = useNavigate();
  const { t } = useTranslation("allExercises");
  const { toggleDarkMode } = useContext(ThemeContext);

  const [exercises, setExercises] = useState([]);
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();

  // 🔹 Fetch tous les exercices
  useEffect(() => {
    fetch("http://localhost:8000/api/exercices/api/exo/")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return setExercises([]);
        const formatted = data.map(c => ({
          id: c.id_exercice,
          title: c.titre_exo,
          level: c.niveau_exercice_label,
          categorie: c.categorie,
          description: c.enonce,
          author: c.utilisateur_name,
          coursId: c.cours, // pour navigation vers le cours si besoin
          initials: c.utilisateur_name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase(),
          isMine: c.utilisateur === currentUserId
        }));
        setExercises(formatted);
      })
      .catch(err => {
        console.error("Erreur chargement exercices :", err);
        setExercises([]);
      });
  }, [currentUserId]);

  const handleDeleteExo = async (exoId) => {
    if (!window.confirm("Tu es sûr de supprimer cet exercice ?")) return;

    try {
      await fetch(`http://localhost:8000/api/exercices/exercice/${exoId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setExercises(prev => prev.filter(ex => ex.id !== exoId));
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur lors de la suppression");
    }
  };

  // 🔹 Sidebar & resize
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

  // 🔹 Filtrage
  let filteredExercises = filterLevel === "ALL" ? exercises : exercises.filter(ex => ex.level === filterLevel);
  if (userRole === "enseignant" && categoryFilter === "mine") {
    filteredExercises = filteredExercises.filter(ex => ex.isMine);
  }

  return (
    <div className="flex bg-surface min-h-screen">
      <Navbar />
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
        <div className="bg-bg w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-sm">
          <Bell size={18} />
        </div>
        <UserCircle initials={initials} onToggleTheme={toggleDarkMode} onChangeLang={(lang) => i18n.changeLanguage(lang)} />
      </div>

      <main className="flex-1 p-4 md:p-8 transition-all duration-300" style={{ marginLeft: sidebarWidth }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-muted">{t("exercisesTitle")}</h1>
        </div>

        <ContentSearchBar />

        <div className="mt-6 mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <ContentFilters
            type="exercises"
            userRole={userRole}
            activeFilter={filterLevel}
            onFilterChange={setFilterLevel}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            showCompletedFilter={false}
          />

          {userRole === "enseignant" && (
            <Button
              variant="courseStart"
              className="w-full sm:w-50 md:w-40 lg:w-80 h-10 md:h-12 lg:h-25 mt-6 bg-primary text-white transition-all"
              onClick={() => navigate("/new-exercise")}
            >
              <Plus size={18} /> {t("createExerciseBtn")}
            </Button>
          )}
        </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
  {filteredExercises.map((exercise) => (
    <ExerciseCard key={exercise.id} exercise={exercise} />

  ))}
</div>

      </main>
    </div>
  );
}
