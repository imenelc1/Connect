import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/common/Navbar.jsx";
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
  const { t } = useTranslation("contentPage");
  const { toggleDarkMode } = useContext(ThemeContext);

  const [exercises, setExercises] = useState([]);
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState("");
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""
    }`.toUpperCase();

  // 🔹 Fetch tous les exercices
  useEffect(() => {
    fetch("http://localhost:8000/api/exercices/api/exo/")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return setExercises([]);
        const formatted = data.map((c) => ({
          id: c.id_exercice,
          title: c.titre_exo,
          level: c.niveau_exercice_label,
          categorie: c.categorie,
          description: c.enonce,
          author: c.utilisateur_name,
          coursId: c.cours, // pour navigation vers le cours si besoin
          initials: c.utilisateur_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          isMine: c.utilisateur === currentUserId,
        }));
        setExercises(formatted);
      })
      .catch((err) => {
        console.error(t("errors.loadExercises"), err);
        setExercises([]);
      });
  }, [currentUserId]);

  //Recherche exercice

  useEffect(() => {
    const controller = new AbortController();

    fetch(`http://localhost:8000/api/exercices/exo?search=${searchTerm}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((c) => ({
          id: c.id_exercice,
          title: c.titre_exo,
          level: c.niveau_exercice_label,
          categorie: c.categorie,
          description: c.enonce,
          author: c.utilisateur_name,
          coursId: c.cours,
          initials: c.utilisateur_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          isMine: c.utilisateur === currentUserId,
        }));
        setExercises(formatted);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });

    return () => controller.abort();
  }, [searchTerm]);

  const handleDeleteExo = async (exoId) => {
    if (!window.confirm(t("confirmDeleteExercise"))) return;

    try {
      await fetch(
        `http://localhost:8000/api/exercices/exercice/${exoId}/delete/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExercises((prev) => prev.filter((ex) => ex.id !== exoId));
    } catch (err) {
      console.error(t("errorDeleteLog"), err);
      alert(t("errorDelete"));
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
  let filteredExercises =
    filterLevel === "ALL"
      ? exercises
      : exercises.filter((ex) => ex.level === filterLevel);
  if (userRole === "enseignant" && categoryFilter === "mine") {
    filteredExercises = filteredExercises.filter((ex) => ex.isMine);
  }

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      <main
        className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}
      >
        <header className="flex flex-row justify-between items-center gap-3 sm:gap-4 mb-6">
          {/* Titre */}
          <h1 className="text-lg sm:text-2xl font-bold text-muted truncate">
            {t("exercisesTitle")}
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

        <ContentSearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))`,
          }}
        >
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              role={userRole} // ENVOI DU RÔLE
              isMine={exercise.isMine} // PROPRIÉTAIRE
              onDelete={handleDeleteExo}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
