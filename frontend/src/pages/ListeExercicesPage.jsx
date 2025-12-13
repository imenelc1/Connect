import React, { useContext, useState, useEffect } from "react";
import CoursesSidebarItem from "../components/ui/CourseSidebarItem";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/common/Button";
import ContentSearchBar from "../components/common/ContentSearchBar";
import HeadMascotte from "../components/ui/HeadMascotte";
import IaAssistant from "../components/ui/IaAssistant";
import UserCircle from "../components/common/UserCircle";
import ThemeContext from "../context/ThemeContext";
import api from "../services/courseService";
// Mapping des gradients par niveau
const LEVEL_GRADIENT = {
  debutant: "bg-grad-2",
  intermediaire: "bg-grad-3",
  avance: "bg-grad-4"
};

export default function ExercisesPage() {
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { coursId } = useParams(); // récupère l'ID du cours depuis l'URL

  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";

  const [collapsed, setCollapsed] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
useEffect(() => {
    if (!coursId) return;

    const fetchCourse = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await api.get(`courses/courses/${coursId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setTitle(data.titre_cour);
  

      
      
      } catch (err) {
        console.error("Erreur chargement cours :", err.response?.data || err);
      }
    };

    fetchCourse();
  }, [coursId]);

  useEffect(() => {

    const fetchExercises = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/exercices/cours/${coursId}/exercices/`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des exercices");
        }
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [coursId]);






  return (
    <div className="w-full min-h-screen bg-surface">

      {/* ================= HEADER ================= */}
      <header className="w-full bg-surface py-6 px-6 shadow-sm">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-semibold text-blue">
              Exercises
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block w-96">
              <ContentSearchBar />
            </div>
            <IaAssistant />
            <HeadMascotte />
            <UserCircle initials={initials} onToggleTheme={toggleDarkMode} />
          </div>
        </div>
      </header>

      {/* ================= LAYOUT ================= */}
      <div className="w-full flex">
        <div className="hidden md:block w-[300px] p-4 border-r border-blue/10 bg-surface">
          <CoursesSidebarItem />
        </div>

        {collapsed && (
          <div className="sm:hidden absolute z-50 w-[250px] bg-background border-r shadow-xl h-full p-4">
            <CoursesSidebarItem />
          </div>
        )}

        <main className="flex-1 space-y-6 px-2 md:px-6 py-4">
          
          <h1 className="text-center text-xl font-semibold text-textc mt-2">
            { title }
          </h1>

    

          <div className="mt-4 space-y-6 bg-background p-6 rounded-2xl shadow-md">
            {loading ? (
              <p className="text-center text-grayc">Chargement des exercices...</p>
            ) : exercises.length === 0 ? (
              <p className="text-center text-grayc">Aucun exercice disponible.</p>
            ) : (
              exercises.map((ex, index) => (
                <div key={ex.id_exercice} className={`p-5 rounded-2xl shadow border border-blue/10 ${LEVEL_GRADIENT[ex.niveau_exo]}`}>
                  <h2 className="font-semibold text-[15px]">
                    Exercice {index + 1} — {ex.titre_exo}
                  </h2>
                  <p className="text-xs text-grayc mt-1">{ex.enonce}</p>
                 <div className="flex items-center gap-3 mt-3">
  <span className="text-[10px] bg-blue/10 text-blue px-3 py-1 rounded-full">
    {ex.niveau_exo}
  </span>

  <span className="text-[10px] bg-purple/10 text-purple px-3 py-1 rounded-full">
    {ex.categorie}
  </span>
</div>

                  <Button
  variant="courseStart"
  text="Do the exercise"
  className="mt-4 px-6 h-9 text-sm bg-blue text-white rounded-full mx-auto block !w-fit"
  onClick={() => {
    if (ex.categorie === "code") {
      navigate(`/start-exercise/${ex.id_exercice}`);
    } else {
      alert("Cet exercice n'est pas de type code."); 
    }
  }}
/>

                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
