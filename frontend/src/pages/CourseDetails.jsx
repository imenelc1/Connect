import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/common/NavBar";
import Topbar from "../components/common/TopBar";
import AddModal from "../components/common/AddModel";
import Button from "../components/common/Button";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ContentCard from "../components/common/ContentCard";
import ContentFilters from "../components/common/ContentFilters";
import UserCircle from "../components/common/UserCircle";
import { ArrowLeft, Users, Bell, BookOpen, NotebookPen, FileCheck, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import toast from "react-hot-toast";
import { getCoursesProgress } from "../../src/services/progressionService";
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
  const userRole = userData?.role || "";
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();

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
  const [activeStep, setActiveStep] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");

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
      .then(res => res.json())
      .then(data => {
        setSpaceName(data.nom_space || "My space");
        setStudentsCount(data.students_count || 0);
      })
      .catch(err => console.error("Failed to load space details:", err));
  }, [id]);

  // --- Fetch space items according to active step ---
  useEffect(() => {
    if (!id) return;

    const fetchItems = async () => {
      try {
        if (activeStep === 1) {
          // Courses
          const allCourses = await getCoursesProgress();
          const res = await fetch(`http://127.0.0.1:8000/api/spaces/${id}/courses/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const data = await res.json();
          const spaceCoursesIds = data.map(sc => sc.cours.id_cours);
          setSpaceCourses(
            allCourses
              .filter(c => spaceCoursesIds.includes(c.id_cours))
              .map(c => ({
                id: c.id_cours,
                title: c.titre_cour,
                description: c.description,
                level: c.niveau_cour_label,
                author: c.utilisateur_name,
                date: c.date_ajout,
                progress: c.progress ?? 0,
                isMine: c.utilisateur === userData?.id,
              }))
          );
        } else if (activeStep === 2) {
          // Quizzes
          const res = await fetch(`http://127.0.0.1:8000/api/spaces/${id}/quizzes/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const data = await res.json();
          setSpaceQuizzes(
            (data || []).filter(q => q.quiz).map(q => ({
              id: q.quiz.id,
              title: q.quiz.exercice?.titre_exo || "Sans titre",
              description: q.quiz.exercice?.enonce || "",
              level: q.quiz.exercice?.niveau_exercice_label || "",
              author: q.quiz.exercice?.utilisateur_name || "Inconnu",
              date: q.quiz.exercice?.date_creation || "",
              progress: q.progress ?? 0,
              isMine: q.quiz.exercice?.utilisateur === userData?.id,
            }))
          );
        } else if (activeStep === 3) {
          // Exercises
          const res = await fetch(`http://127.0.0.1:8000/api/spaces/${id}/exercises/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const data = await res.json();
          setSpaceExercises(
            (data || []).filter(e => e.exercice).map(e => ({
              id: e.exercice.id_exercice,
              title: e.exercice.titre_exo,
              description: e.exercice.enonce,
              level: e.exercice.niveau_exercice_label,
              author: e.exercice.utilisateur_name || "Inconnu",
              date: e.exercice.date_creation || "",
              categorie: e.exercice.categorie,
              progress: e.progress ?? 0,
              isMine: e.exercice.utilisateur === userData?.id,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchItems();
  }, [id, activeStep, userData?.id]);

  // --- Fetch my items for modal ---
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchMyCourses = fetch(`http://127.0.0.1:8000/api/spaces/my-courses/`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json());

    const fetchMyQuizzes = fetch(`http://127.0.0.1:8000/api/spaces/my-quizzes/`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json());

    const fetchMyExercises = fetch(`http://127.0.0.1:8000/api/spaces/my-exercises/`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json());

    Promise.all([fetchMyCourses, fetchMyQuizzes, fetchMyExercises])
      .then(([coursesData, quizzesData, exercisesData]) => {
        setMyCourses((coursesData || []).map(c => ({
          id: c.id_cours,
          title: c.titre_cour,
          description: c.description,
          level: c.niveau_cour_label,
          author: c.utilisateur_name,
        })));

        setMyQuizzes((quizzesData || []).filter(q => q.exercice && q.exercice.id_exercice).map(q => ({
          id: q.exercice.id_exercice,
          title: q.exercice.titre_exo?.trim() || "Sans titre",
          description: q.exercice.enonce || "",
          level: q.exercice.niveau_exercice_label || "",
          author: q.exercice.utilisateur_name || "",
        })));

        setMyExercises((exercisesData || []).filter(e => e.id_exercice).map(e => ({
          id: e.id_exercice,
          title: e.titre_exo?.trim() || "Sans titre",
          description: e.enonce || "",
          level: e.niveau_exercice_label || "",
          author: e.utilisateur_name || "",
        })));
      })
      .catch(err => console.error("Failed to fetch my items:", err));
  }, []);

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

  if (activeStep === 1) {
    alreadyAdded = spaceCourses.some(c => c.id === idToSend);
    url = `http://127.0.0.1:8000/api/spaces/${id}/courses/`;
    bodyKey = "cours";
  } else if (activeStep === 2) {
    alreadyAdded = spaceQuizzes.some(c => c.id === idToSend);
    url = `http://127.0.0.1:8000/api/spaces/${id}/quizzes/`;
    bodyKey = "quiz";
  } else if (activeStep === 3) {
    alreadyAdded = spaceExercises.some(c => c.id === idToSend);
    url = `http://127.0.0.1:8000/api/spaces/${id}/exercises/`;
    bodyKey = "exercice";
  }

  if (alreadyAdded) {
    toast.error(t("alreadyAdded"));
    return;
  }

  const body = { [bodyKey]: idToSend };
  console.log("POST to", url, "body:", body);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(body),
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    })
    .then(newItem => {
      if (activeStep === 1) {
        setSpaceCourses([
          ...spaceCourses,
          {
            id: newItem.cours.id_cours,
            title: newItem.cours.titre_cour,
            description: newItem.cours.description,
            level: newItem.cours.niveau_cour_label,
            author: newItem.cours.utilisateur_name,
            date: newItem.cours.date_ajout,
            progress: 0,
            isMine: true,
          },
        ]);
      } else if (activeStep === 2) {
        setSpaceQuizzes([
          ...spaceQuizzes,
          {
            id: newItem.quiz.id,
            title: newItem.quiz.exercice?.titre_exo || "Sans titre",
            description: newItem.quiz.exercice?.enonce || "",
            level: newItem.quiz.exercice?.niveau_exercice_label || "",
            author: newItem.quiz.exercice?.utilisateur_name || "Inconnu",
            date: newItem.quiz.exercice?.date_creation || "",
            progress: 0,
            isMine: true,
          },
        ]);
      } else if (activeStep === 3) {
        setSpaceExercises([
          ...spaceExercises,
          {
            id: newItem.exercice.id_exercice,
            title: newItem.exercice.titre_exo,
            description: newItem.exercice.enonce,
            level: newItem.exercice.niveau_exercice_label,
            author: newItem.exercice.utilisateur_name || "Inconnu",
            date: newItem.exercice.date_creation,
            categorie: newItem.exercice.categorie,
            progress: 0,
            isMine: true,
          },
        ]);
      }

      toast.success(t("addedSuccessfully"));
      setOpenModal(false);
      setSelectedItemId("");
    })
    .catch(err => {
      console.error(err);
      toast.error(t("addFailed"));
    });
};


  const itemsToDisplay = activeStep === 1 ? spaceCourses : activeStep === 2 ? spaceQuizzes : spaceExercises;
  const filteredItems = itemsToDisplay
    .filter(c => filterLevel === "ALL" || c.level === filterLevel)
    .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const modalItems = activeStep === 1 ? myCourses : activeStep === 2 ? myQuizzes : myExercises;

  return (
    <div className="flex w-full bg-surface min-h-screen">
      <Navbar />
      <main className="flex-1 p-6 lg:ml-64 bg-bg min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="text-muted font-medium hover:underline flex items-center gap-1"
            onClick={() => navigate("/Spaces")}
          >
            <ArrowLeft size={16} /> {t("backToSpaces")}
          </button>
          <div className="flex gap-4 items-center">
            <div className="bg-bg w-7 h-7 rounded-full flex items-center justify-center">
              <Bell size={16} />
            </div>
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={lang => i18n.changeLanguage(lang)}
            />
          </div>
        </div>

        {/* Space Info + Search */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <h2 className="text-4xl font-semibold text-muted">{spaceName}</h2>
          <div className="w-full md:w-[400px]">
            <ContentSearchBar
              placeholder={t("searchItems")}
              onChange={setSearchTerm}
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
            type={activeStep === 1 ? "courses" : activeStep === 2 ? "quizzes" : "exercises"}
            userRole={userRole}
            activeFilter={filterLevel}
            onFilterChange={setFilterLevel}
            showCompletedFilter={userRole === "etudiant" && activeStep === 1}
            hideCategoryFilter={true}
          />
          {userRole === "enseignant" && (
            <Button
              variant="courseStart"
              className="w-full sm:w-50 md:w-[200px] lg:w-70 h-10 md:h-12 lg:h-10 mt-4 sm:mt-0 px-5 py-6 bg-grad-1 text-white transition-all flex items-center gap-2 justify-center whitespace-nowrap"
              onClick={() => setOpenModal(true)}
            >
              <Plus size={18} /> {t("addItem")}
            </Button>
          )}
        </div>

        {/* Items Grid */}
       <div
  className="grid gap-6"
  style={{
    gridTemplateColumns: `repeat(${window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3}, minmax(0, 1fr))`,
  }}
>
  {/* COURSES & QUIZZES */}
  {activeStep !== 3 &&
    filteredItems.map(item => (
      <ContentCard
        key={`${activeStep}-${item.id}`}
        course={{
          ...item,
          initials: item.author
            ? item.author
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()
            : "",
          duration: item.date ? `Créé le ${item.date}` : "",
        }}
        role={userRole}
        showProgress={userRole === "etudiant" && activeStep === 1}
        type={activeStep === 1 ? "course" : "quiz"}
        className={gradientMap[item.level] ?? "bg-grad-1"}
        onDelete={id => {
          if (activeStep === 1)
            setSpaceCourses(spaceCourses.filter(c => c.id !== id));
          else if (activeStep === 2)
            setSpaceQuizzes(spaceQuizzes.filter(c => c.id !== id));
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
    filteredItems.map(exercise => (
      <ExerciseCard
        key={exercise.id}
        exercise={exercise}
        onDelete={() =>
          setSpaceExercises(prev =>
            prev.filter(e => e.id !== exercise.id)
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
                element:
                  activeStep === 1 ? (
                    <MyCoursesSelect
                      items={myCourses}
                      selectedItemId={selectedItemId}
                      onChange={setSelectedItemId}
                      existingItems={spaceCourses}
                    />
                  ) : activeStep === 2 ? (
                    <MyQuizzesSelect
                      items={myQuizzes}
                      selectedItemId={selectedItemId}
                      onChange={setSelectedItemId}
                      existingItems={spaceQuizzes}
                    />
                  ) : (
                    <MyExercisesSelect
                      items={myExercises}
                      selectedItemId={selectedItemId}
                      onChange={setSelectedItemId}
                      existingItems={spaceExercises}
                    />
                  ),
              },
            ]}
          />
        )}
      </main>
    </div>
  );
}