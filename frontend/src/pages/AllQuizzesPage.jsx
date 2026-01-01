import React, { useEffect, useState, useContext, useMemo } from "react";
import Navbar from "../components/common/NavBar";
import { Plus } from "lucide-react";
import ContentCard from "../components/common/ContentCard";
import Button from "../components/common/Button";
import ContentFilters from "../components/common/ContentFilters";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import { useTranslation } from "react-i18next";
import NotificationBell from "../components/common/NotificationBell";
import { getCurrentUserId } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const gradientMap = {
  Débutant: "bg-grad-2",
  Intermédiaire: "bg-grad-3",
  Avancé: "bg-grad-4",
};

export default function AllQuizzesPage() {
  const token = localStorage.getItem("token");
  const currentUserId = getCurrentUserId();
  const navigate = useNavigate();
  const { t } = useTranslation("allQuizzes");
  const { toggleDarkMode } = useContext(ThemeContext);

  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();

  const [quizzes, setQuizzes] = useState([]);
  const [tentativesByQuiz, setTentativesByQuiz] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const getGridCols = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  // 🔹 Fetch quizzes depuis le backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchQuizzes = async () => {
      try {
        const url = `http://localhost:8000/api/quiz/api/quiz?search=${searchTerm}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        const formatted = data.map(c => ({
          id: c.exercice?.id_exercice,
          quizId: c.id,
          title: c.exercice?.titre_exo,
          description: c.exercice?.enonce,
          level: c.exercice?.niveau_exercice_label,
          categorie: c.exercice?.categorie,
          author: c.exercice?.utilisateur_name,
          author_id: c.exercice?.utilisateur,
          visibilite_exo: c.exercice?.visibilite_exo,
          initials: c.exercice?.utilisateur_name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase(),
          isMine: c.exercice?.utilisateur === currentUserId,
          nbMax_tentative: c.nbMax_tentative,
          delai_entre_tentatives: c.delai_entre_tentatives,
          activer: c.activerDuration,
          duration: c.duration_minutes,
          visible: c.exercice?.visibilite_exo === true || c.exercice?.utilisateur === currentUserId,
        }));

        setQuizzes(formatted);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    };

    fetchQuizzes();
    return () => controller.abort();
  }, [searchTerm, currentUserId]);

  // 🔹 Fetch tentatives pour chaque quiz
  useEffect(() => {
    if (!currentUserId || quizzes.length === 0) return;

    const fetchTentatives = async () => {
      try {
        const results = {};
        await Promise.all(
          quizzes.map(async quiz => {
            const res = await fetch(
              `http://localhost:8000/api/quiz/${quiz.quizId}/utilisateur/${currentUserId}/`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            results[quiz.quizId] = data;
          })
        );
        setTentativesByQuiz(results);
      } catch (err) {
        console.error("Erreur chargement tentatives :", err);
      }
    };

    fetchTentatives();
  }, [quizzes, currentUserId, token]);

  // 🔹 Calcul quizzesWithAttempts
  const quizzesWithAttempts = useMemo(() => {
    return quizzes.map(quiz => {
      const tentatives = tentativesByQuiz[quiz.quizId] || [];

      let isBlocked = false;
      let minutesRestantes = 0;
      let tentativesRestantes = null;

      if (quiz.nbMax_tentative > 0) {
        tentativesRestantes = quiz.nbMax_tentative - tentatives.length;
        if (tentativesRestantes <= 0) isBlocked = true;
      }

      if (!isBlocked && tentatives.length > 0 && quiz.delai_entre_tentatives) {
        const last = tentatives[0];
        if (last.date_fin) {
          const lastEnd = new Date(last.date_fin);
          const now = new Date();
          const diffMs =
            lastEnd.getTime() + quiz.delai_entre_tentatives * 60 * 1000 - now.getTime();
          if (diffMs > 0) {
            isBlocked = true;
            minutesRestantes = Math.ceil(diffMs / 60000);
          }
        }
      }

      return { ...quiz, tentatives, isBlocked, minutesRestantes, tentativesRestantes };
    });
  }, [quizzes, tentativesByQuiz]);

  // 🔹 Filtres et recherche finale
  const filteredList = useMemo(() => {
    let list =
      filterLevel === "ALL"
        ? quizzesWithAttempts
        : quizzesWithAttempts.filter(q => q.level === filterLevel);

    if (userRole === "enseignant" && categoryFilter === "mine") {
      list = list.filter(q => q.isMine);
    }
    list = list.filter(q => q.visible);
    return list;
  }, [quizzesWithAttempts, filterLevel, categoryFilter, userRole]);

  // 🔹 Delete quiz
  const handleDeleteQuiz = async (exoId) => {
    if (!window.confirm("Tu es sûr de supprimer cet exercice?")) return;
    try {
      await fetch(`http://localhost:8000/api/exercices/exercice/${exoId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(prev => prev.filter(c => c.id !== exoId));
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      <Navbar />
      <main
        className={`flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden ${
          !isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""
        }`}
      >
        <header className="flex flex-row justify-between items-center gap-3 sm:gap-4 mb-6">
          <h1 className="text-lg sm:text-2xl font-bold text-muted truncate">
            {t("quizzesTitle")}
          </h1>
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
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="mt-6 mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <ContentFilters
            type="quizzes"
            userRole={userRole}
            onFilterChange={setFilterLevel}
            activeFilter={filterLevel}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            showCompletedFilter={userRole === "etudiant"}
          />

          {userRole === "enseignant" && (
            <Button
              variant="courseStart"
              onClick={() => navigate("/create-quiz")}
              className="w-full sm:w-50 md:w-40 lg:w-80 h-10 md:h-12 lg:h-25 mt-6 bg-primary text-white transition-all"
            >
              <Plus size={18} /> {t("createQuizBtn")}
            </Button>
          )}
        </div>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}
        >
          {filteredList.map((quiz) => (
            <ContentCard
              key={quiz.quizId}
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
