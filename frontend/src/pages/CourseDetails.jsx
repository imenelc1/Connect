import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Topbar from "../components/common/TopBar";
import AddModal from "../components/common/AddModel";
import Button from "../components/common/Button";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ContentCard from "../components/common/ContentCard";
import ContentFilters from "../components/common/ContentFilters";
import UserCircle from "../components/common/UserCircle";
import {
  ArrowLeft,
  Users,
  Bell,
  BookOpen,
  NotebookPen,
  FileCheck,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import toast from "react-hot-toast";
import { getCoursesProgress } from "../../src/services/progressionService";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";
import MyCoursesSelect from "../components/ui/MyCoursesSelect";
import MyQuizzesSelect from "../components/ui/MyQuizzesSelect";
import MyExercisesSelect from "../components/ui/MyExercisesSelect";
import ExerciseCard from "../components/common/ExerciseCard";

const gradientMap = {
  Débutant: "bg-grad-2",
  Intermédiaire: "bg-grad-3",
  Avancé: "bg-grad-4",
};

export default function SpaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation("CourseDetails");

  const userData = JSON.parse(localStorage.getItem("user")) || {};

  const userId = userData?.user_id;

  const userRole = userData?.role || "";
  const initials = `${userData?.nom?.[0] || ""}${
    userData?.prenom?.[0] || ""
  }`.toUpperCase();

  const [spaceName, setSpaceName] = useState("");
  const [studentsCount, setStudentsCount] = useState(0);

  const [spaceCourses, setSpaceCourses] = useState([]);
  const [spaceQuizzes, setSpaceQuizzes] = useState([]);
  const [spaceExercises, setSpaceExercises] = useState([]);

  const [myCourses, setMyCourses] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [myExercises, setMyExercises] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [activeProgressFilter, setActiveProgressFilter] = useState("ALL");
  const [activeStep, setActiveStep] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [activeExerciseFilter, setActiveExerciseFilter] = useState("ALL");
  //Etas pour activer, desactiver l'ia
  const [aiEnabledForCourse, setAiEnabledForCourse] = useState(true);
  const [aiEnabledForExercise, setAiEnabledForExercise] = useState(true);

  const steps = [
    { label: t("topbar.course"), icon: BookOpen },
    { label: t("topbar.quizzes"), icon: NotebookPen },
    { label: t("topbar.exercises"), icon: FileCheck },
  ];

  // --- Fetch space details ---
  useEffect(() => {
    if (!id) return;
    fetch(`http://127.0.0.1:8000/api/spaces/${id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSpaceName(data.nom_space || t("defaultSpaceName"));
        setStudentsCount(data.students_count || 0);
      })
      .catch((err) => console.error(t("loadSpaceError"), err));
  }, [id]);

  // --- Fetch space items according to active step ---
  useEffect(() => {
    if (!id) return;

    const fetchItems = async () => {
      try {
        if (activeStep === 1) {
          // Courses
          const allCourses = await getCoursesProgress();
          const res = await fetch(
            `http://127.0.0.1:8000/api/spaces/${id}/courses/`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          const data = await res.json();
          const spaceCoursesIds = data.map((sc) => sc.cours.id_cours);
          setSpaceCourses(
            allCourses
              .filter((c) => spaceCoursesIds.includes(c.id_cours))
              .map((c) => ({
                id: c.id_cours,
                title: c.titre_cour,
                description: c.description,
                level: c.niveau_cour_label,
                author: c.utilisateur_name,
                date: c.date_ajout,
                progress: c.progress ?? 0,
                isMine: c.utilisateur === userData?.id,
              })),
          );
        } else if (activeStep === 2) {
          const res = await fetch(
            `http://127.0.0.1:8000/api/spaces/${id}/quizzes/`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          const data = await res.json();
          const formatted = (data || []).map((q) => ({
            id: q.quiz.exercice?.id_exercice, // EXACT comme AllQuizzesPage
            quizId: q.quiz.id, // IMPORTANT
            title: q.quiz.exercice?.titre_exo,
            description: q.quiz.exercice?.enonce,
            level: q.quiz.exercice?.niveau_exercice_label,
            author: q.quiz.exercice?.utilisateur_name,
            nbMax_tentative: q.quiz.nbMax_tentative,
            delai_entre_tentatives: q.quiz.delai_entre_tentatives,
            duration: q.quiz.duration_minutes,
            activer: q.quiz.activerDuration,
            isMine: q.quiz.exercice?.utilisateur === userData?.id,
            initials: q.quiz.exercice?.utilisateur_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase(),
          }));

          const results = {};

          await Promise.all(
            formatted.map(async (quiz) => {
              const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/quiz/${quiz.quizId}/utilisateur/${userId}/`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                },
              );
              results[quiz.quizId] = await res.json();
            }),
          );

          //  même logique que AllQuizzesPage

          const quizzesWithAttempts = formatted.map((quiz) => {
            const tentatives = results[quiz.quizId] || [];

            let isBlocked = false;
            let minutesRestantes = 0;
            let tentativesRestantes = null;

            if (quiz.nbMax_tentative > 0) {
              tentativesRestantes = quiz.nbMax_tentative - tentatives.length;
              if (tentativesRestantes <= 0) isBlocked = true;
            }

            if (
              !isBlocked &&
              tentatives.length > 0 &&
              quiz.delai_entre_tentatives
            ) {
              const last = tentatives[0];
              if (last.date_fin) {
                const diff =
                  new Date(last.date_fin).getTime() +
                  quiz.delai_entre_tentatives * 60000 -
                  Date.now();

                if (diff > 0) {
                  isBlocked = true;
                  minutesRestantes = Math.ceil(diff / 60000);
                }
              }
            }

            const isFinished =
              tentatives.length > 0 &&
              tentatives.some((t) => t.terminer === true);

            return {
              ...quiz,
              tentatives,
              isBlocked,
              tentativesRestantes,
              minutesRestantes,
              isFinished,
            };
          });

          setSpaceQuizzes(quizzesWithAttempts);
        } else if (activeStep === 3) {
          // Exercises
          const res = await fetch(
            `http://127.0.0.1:8000/api/spaces/${id}/exercises/`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          const data = await res.json();
          setSpaceExercises(
            (data || [])
              .filter((e) => e.exercice)
              .map((e) => ({
                id: e.exercice.id_exercice,
                title: e.exercice.titre_exo,
                description: e.exercice.enonce,
                level: e.exercice.niveau_exercice_label,
                author: e.exercice.utilisateur_name || t("unknownAuthor"),

                date: e.exercice.date_creation || "",
                categorie: e.exercice.categorie,
                progress: e.progress ?? 0,
                isMine: e.exercice.utilisateur === userData?.id,
              })),
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchItems();
  }, [id, activeStep, userId]);

  // --- Fetch my items for modal ---
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchMyCourses = fetch(
      `http://127.0.0.1:8000/api/spaces/my-courses/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ).then((res) => res.json());

    const fetchMyQuizzes = fetch(
      `http://127.0.0.1:8000/api/spaces/my-quizzes/?space_id=${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ).then((res) => res.json());

    const fetchMyExercises = fetch(
      `http://127.0.0.1:8000/api/spaces/my-exercises/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ).then((res) => res.json());

    Promise.all([fetchMyCourses, fetchMyQuizzes, fetchMyExercises])
      .then(([coursesData, quizzesData, exercisesData]) => {
        setMyCourses(
          (coursesData || []).map((c) => ({
            id: c.id_cours,
            title: c.titre_cour,
            description: c.description,
            level: c.niveau_cour_label,
            author: c.utilisateur_name,
          })),
        );

        setMyQuizzes(
          (quizzesData || [])
            .filter((q) => q.id && q.exercice) // <-- ajouter q.exercice
            .map((q) => ({
              id: q.id,
              title: q.exercice.titre_exo?.trim() || t("noTitle"),
              description: q.exercice.enonce || "",
              level: q.exercice.niveau_exercice_label || "",
              author: q.exercice.utilisateur_name || "",
            })),
        );

        setMyExercises(
          (exercisesData || [])
            .filter((e) => e.id_exercice)
            .map((e) => ({
              id: e.id_exercice,
              title: e.titre_exo?.trim() || t("noTitle"), // ← utiliser e.titre_exo
              description: e.enonce || "",
              level: e.niveau_exercice_label || "",
              author: e.utilisateur_name || "",
            })),
        );
      })
      .catch((err) => console.error(t("fetchItemsError"), err));
  }, []);

  // --- Unified handle add item ---
  // --- Unified handle add item ---
  const handleAddItem = (selectedItemId) => {
    const idToSend = Number(selectedItemId);
    if (!idToSend) {
      toast.error(t("selectItemFirst"));
      return;
    }

    let alreadyAdded = false;
    let url = "";
    let bodyKey = "";
    let mapNewItem = null;

    // 👇 payload envoyé au backend
    let body = {};

    if (activeStep === 1) {
      // --- Courses ---
      alreadyAdded = spaceCourses.some((c) => c.id === idToSend);
      url = `http://127.0.0.1:8000/api/spaces/${id}/courses/`;
      bodyKey = "cours";

      body = {
        cours: idToSend,
        ai_enabled: aiEnabledForCourse, // ✅ IA cours
      };

      mapNewItem = (newItem) => ({
        id: newItem.cours.id_cours,
        title: newItem.cours.titre_cour,
        description: newItem.cours.description,
        level: newItem.cours.niveau_cour_label,
        author: newItem.cours.utilisateur_name,
        date: newItem.cours.date_ajout,
        progress: 0,
        isMine: true,
      });
    } else if (activeStep === 2) {
      // --- Quizzes ---
      alreadyAdded = spaceQuizzes.some((c) => c.id === idToSend);
      url = `http://127.0.0.1:8000/api/spaces/${id}/quizzes/`;
      bodyKey = "quiz";

      body = {
        quiz: idToSend, // ❌ pas d’IA ici (pour l’instant)
      };

      mapNewItem = (newItem) => ({
        id: newItem.quiz.exercice?.id_exercice,
        quizId: newItem.quiz.id,
        title: newItem.quiz.exercice?.titre_exo || t("noTitle"),
        description: newItem.quiz.exercice?.enonce || "",
        level: newItem.quiz.exercice?.niveau_exercice_label || "",
        author: newItem.quiz.exercice?.utilisateur_name || t("unknownAuthor"),
        date: newItem.quiz.exercice?.date_creation || "",
        progress: 0,
        isMine: true,
      });
    } else if (activeStep === 3) {
      // --- Exercises ---
      alreadyAdded = spaceExercises.some((c) => c.id === idToSend);
      url = `http://127.0.0.1:8000/api/spaces/${id}/exercises/`;
      bodyKey = "exercice";

      body = {
        exercice: idToSend,
        ai_enabled: aiEnabledForExercise, // ✅ IA exercice
      };

      mapNewItem = (newItem) => ({
        id: newItem.exercice.id_exercice,
        title: newItem.exercice.titre_exo || t("noTitle"),
        description: newItem.exercice.enonce || "",
        level: newItem.exercice.niveau_exercice_label || "",
        author: newItem.exercice.utilisateur_name || t("unknownAuthor"),
        date: newItem.exercice.date_creation || "",
        categorie: newItem.exercice.categorie,
        progress: 0,
        isMine: true,
      });
    }

    if (alreadyAdded) {
      toast.error(t("alreadyAdded"));
      return;
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add item");
        return res.json();
      })
      .then((newItem) => {
        const itemMapped = mapNewItem(newItem);

        if (activeStep === 1) setSpaceCourses((prev) => [...prev, itemMapped]);
        else if (activeStep === 2)
          setSpaceQuizzes((prev) => [...prev, itemMapped]);
        else if (activeStep === 3)
          setSpaceExercises((prev) => [...prev, itemMapped]);

        toast.success(t("addedSuccessfully"));
        setOpenModal(false);
        setSelectedItemId("");

        // 🔄 reset des checkbox
        setAiEnabledForCourse(true);
        setAiEnabledForExercise(true);
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("addFailed"));
      });
  };
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  useEffect(() => {
    if (!id || activeStep !== 3) return;
    const fetchExercises = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/spaces/${id}/exercises/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();

        const exercises = (data || []).filter((e) => e.exercice);

        const exercisesWithState = await Promise.all(
          exercises.map(async (ex) => {
            try {
              const resTent = await fetch(
                `http://127.0.0.1:8000/api/dashboard/${ex.exercice.id_exercice}/utilisateur/${userId}/tentatives/`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                },
              );
              const tentatives = resTent.ok ? await resTent.json() : [];
              console.log("tentatives", tentatives);

              const lastTentative =
                tentatives.sort(
                  (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at),
                )[0] || null;
              const etat = lastTentative?.etat || "brouillon";
              const progress = etat === "soumis" ? 100 : lastTentative ? 50 : 0;

              return {
                id: ex.exercice.id_exercice,
                title: ex.exercice.titre_exo,
                description: ex.exercice.enonce,
                level: ex.exercice.niveau_exercice_label,
                author: ex.exercice.utilisateur_name || t("unknownAuthor"),
                date: ex.exercice.date_creation,
                categorie: ex.exercice.categorie,
                etat,
                progress,
                isMine: ex.exercice.utilisateur === userData?.id,
                tentatives,
              };
            } catch (err) {
              console.error(err);
              return {
                ...ex.exercice,
                progress: 0,
                etat: "brouillon",
                tentatives: [],
              };
            }
          }),
        );

        setSpaceExercises(exercisesWithState);
      } catch (err) {
        console.error(t("fetchExercisesError"), err);
      }
    };

    fetchExercises();
  }, [id, activeStep, userId]);

  const itemsToDisplay =
    activeStep === 1
      ? spaceCourses
      : activeStep === 2
        ? spaceQuizzes
        : spaceExercises;
  const filteredItems = itemsToDisplay
    // 🔹 Filtre par niveau
    .filter((item) => {
      if (activeStep === 3) {
        // Pour les exercices, utiliser le niveau sélectionné
        return filterLevel === "ALL" || item.level === filterLevel;
      } else {
        return filterLevel === "ALL" || item.level === filterLevel;
      }
    })
    // 🔹 Filtre par état/progress
    .filter((item) => {
      if (userRole !== "etudiant") return true;

      if (activeStep === 1) {
        if (activeProgressFilter === "completed") return item.progress === 100;
        if (activeProgressFilter === "not_completed")
          return item.progress < 100;
      }

      if (activeStep === 2) {
        if (activeProgressFilter === "completed")
          return item.isFinished === true;
        if (activeProgressFilter === "not_completed") return !item.isFinished;
      }

      if (activeStep === 3) {
        switch (activeExerciseFilter) {
          case "soumis":
            return item.etat === "soumis";
          case "brouillon":
            return item.etat === "brouillon";
          case "ALL":
          default:
            return true;
        }
      }

      return true;
    })
    // 🔹 Recherche texte
    .filter((item) => {
      if (!searchTerm.trim()) return true;

      const search = searchTerm.toLowerCase();

      return (
        item.title?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.author?.toLowerCase().includes(search)
      );
    });

  const modalItems =
    activeStep === 1 ? myCourses : activeStep === 2 ? myQuizzes : myExercises;

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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="text-muted font-medium hover:underline flex items-center gap-1"
            onClick={() => navigate("/Spaces")}
          >
            <ArrowLeft size={16} /> {t("backToSpaces")}
          </button>

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
        </div>

        {/* Space Info + Search */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <h2 className="text-4xl font-semibold text-muted">{spaceName}</h2>
          <div className="w-full md:w-[400px]">
            <ContentSearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-card text-muted font-semibold px-4 py-2 rounded-md">
            <Users size={16} /> {studentsCount} {t("students")}
          </div>
        </div>

        <Topbar
          steps={steps}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          className="flex justify-between"
        />

        {/* Filters + Add Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <ContentFilters
            type={
              activeStep === 1
                ? "courses"
                : activeStep === 2
                  ? "quizzes"
                  : "exercises"
            }
            userRole={userRole}
            activeFilter={filterLevel} // ← filtre NIVEAU
            onFilterChange={setFilterLevel} // ← met à jour filterLevel
            showCompletedFilter={
              userRole === "etudiant" && (activeStep === 1 || activeStep === 2)
            }
            onCompletedChange={
              activeStep === 3
                ? setActiveExerciseFilter // ← filtre ÉTAT pour exos
                : setActiveProgressFilter // ← filtre ÉTAT pour cours/quizzes
            }
            hideCategoryFilter={true}
          />

          {userRole === "enseignant" && (
            <Button
              variant="courseStart"
              className="w-full sm:w-50 md:w-[200px] lg:w-70 h-10 md:h-12 lg:h-10 mt-4 sm:mt-0 px-5 py-6 bg-grad-1 text-white transition-all flex items-center gap-2 justify-center whitespace-nowrap"
              onClick={() => setOpenModal(true)}
            >
              <Plus size={18} />
              {activeStep === 1
                ? t("addCourse")
                : activeStep === 2
                  ? t("addQuiz")
                  : activeStep === 3
                    ? t("addExo")
                    : null}
            </Button>
          )}
        </div>

        {/* Items Grid */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${
              window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3
            }, minmax(0, 1fr))`,
          }}
        >
          {/* COURSES & QUIZZES */}
          {activeStep !== 3 &&
            filteredItems.map((item) => (
              <ContentCard
                key={`${activeStep}-${item.id}`}
                course={{
                  ...item,
                  initials: item.author
                    ? item.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "",
                  duration: item.date ? `${t("createdOn")} ${item.date}` : "",
                }}
                role={userRole}
                showProgress={userRole === "etudiant" && activeStep === 1}
                type={activeStep === 1 ? "course" : "quiz"}
                className={gradientMap[item.level] ?? "bg-grad-1"}
                onDelete={(id) => {
                  if (activeStep === 1)
                    setSpaceCourses(spaceCourses.filter((c) => c.id !== id));
                  else if (activeStep === 2)
                    setSpaceQuizzes(spaceQuizzes.filter((c) => c.id !== id));
                }}
                onClick={() => {
                  if (userRole === "etudiant") {
                    if (activeStep === 1) navigate(`/courses/${item.id}/start`);
                    else navigate(`/quizzes/${item.id}/start`);
                  } else {
                    if (activeStep === 1) navigate(`/courses/${item.id}`);
                    else navigate(`/quizzes/${item.id}`);
                  }
                }}
              />
            ))}

          {/* EXERCISES */}
          {activeStep === 3 &&
            filteredItems.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onDelete={() =>
                  setSpaceExercises((prev) =>
                    prev.filter((e) => e.id !== exercise.id),
                  )
                }
                onClick={() => navigate(`/exercises/${exercise.id}`)}
              />
            ))}
        </div>

        {/* Add Modal */}
        {openModal && (
          <AddModal
            open={openModal}
            onClose={() => {
              setOpenModal(false);
              setSelectedItemId("");
            }}
            title={t("addItem")}
            subtitle={t("selectItemToAdd")}
            submitLabel={t("addButton")}
            onSubmit={() => handleAddItem(selectedItemId)}
            fields={[
              {
                label: t("selectItemLabel"),
                element: (() => {
                  switch (activeStep) {
                    case 1:
                      return (
                        <>
                          <MyCoursesSelect
                            items={myCourses} // LES COURS DE L'UTILISATEUR
                            selectedItemId={selectedItemId}
                            onChange={setSelectedItemId}
                            existingItems={spaceCourses} // COURS déjà dans l'espace
                          />

                          {/*  Checkbox IA cours */}
                          <label className="flex items-center gap-2 mt-4 text-sm text-muted">
                            <input
                              type="checkbox"
                              checked={aiEnabledForCourse}
                              onChange={(e) =>
                                setAiEnabledForCourse(e.target.checked)
                              }
                            />
                            {t("enableAI_course")}
                          </label>
                        </>
                      );
                    case 2:
                      return (
                        <MyQuizzesSelect
                          items={myQuizzes} // SEULEMENT LES QUIZZES DE L'UTILISATEUR non ajoutés
                          selectedItemId={selectedItemId}
                          onChange={setSelectedItemId}
                          existingItems={spaceQuizzes} // QUIZZES déjà dans l'espace
                        />
                      );
                    case 3:
                      return (
                        <>
                          <MyExercisesSelect
                            items={myExercises} // SEULEMENT LES EXERCICES DE L'UTILISATEUR
                            selectedItemId={selectedItemId}
                            onChange={setSelectedItemId}
                            existingItems={spaceExercises} // EXERCICES déjà dans l'espace
                          />
                          {/*  Checkbox IA exercices */}
                          <label className="flex items-center gap-2 mt-4 text-sm text-muted">
                            <input
                              type="checkbox"
                              checked={aiEnabledForExercise}
                              onChange={(e) =>
                                setAiEnabledForExercise(e.target.checked)
                              }
                            />
                            {t("enableAI_exercise")}
                          </label>
                        </>
                      );
                    default:
                      return null;
                  }
                })(),
              },
            ]}
          />
        )}
      </main>
    </div>
  );
}