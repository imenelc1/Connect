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
import { getCurrentUserId } from "../hooks/useAuth";

import { useNavigate } from "react-router-dom";


const gradientMap = {
  Débutant: "bg-grad-2",
  Intermédiaire: "bg-grad-3",
  Avancé: "bg-grad-4",
};


export default function AllQuizzesPage() {
  const token = localStorage.getItem("access_token");
  const currentUserId = getCurrentUserId();
  const [quizzes, setQuizzez] = useState([]);


  useEffect(() => {
    fetch("http://localhost:8000/api/quiz/api/quiz/")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({
          id: c.exercice?.id_exercice,
          title: c.exercice?.titre_exo,
          description: c.exercice?.enonce,
          level: c.exercice?.niveau_exercice_label, // ATTENTION : django = 'beginner' ? 'intermediate' ?
          //levelLabel: t(`levels.${c.niveau_cour_label}`),
          duration: c.exercice?.duration_readable,
          author: c.exercice?.utilisateur_name,
          activer:c.activerDuration,
          duration: c.duration_minutes,
          initials: c.exercice?.utilisateur_name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase(),
          isMine: c.exercice?.utilisateur === currentUserId //NEWDED GHR ISMINE //
        }));
        setQuizzez(formatted);
      })
      .catch(err => console.error("Erreur chargement quiz :", err));
  }, []);






  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const { t } = useTranslation("allQuizzes");
const navigate = useNavigate();

  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();

  const [filterLevel, setFilterLevel] = useState("ALL");
  /*const filteredList =
    filterLevel === "ALL"
      ? quizzes
      : quizzes.filter((q) => q.level === filterLevel);*/

  const [categoryFilter, setCategoryFilter] = useState("all"); // "mine" ou "all"

 let filteredList =

    // 1️⃣ Filtrer par niveau
    filterLevel === "ALL"
      ? quizzes
      : quizzes.filter((q) => q.level === filterLevel);

  // 2️⃣ Filtrer par catégorie ("mine" ou "all") pour enseignants
  if (userRole === "enseignant" && categoryFilter === "mine") {
    filteredList = filteredList.filter((q) => q.isMine);
  }





  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const handleDeleteQuiz = async (exoId) => {
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
      setQuizzez(prev => prev.filter(c => c.id !== exoId));
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-muted">{t("quizzesTitle")}</h1>
        </div>

        <ContentSearchBar />

        <div className="mt-6 mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <ContentFilters
            type="quizzes"
            userRole={userRole}
            onFilterChange={setFilterLevel}   // ✔️ correction
            activeFilter={filterLevel}  
            categoryFilter={categoryFilter}        // ← bien passer le state
            setCategoryFilter={setCategoryFilter}      // ✔️ correction
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
              onDelete={handleDeleteQuiz}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
