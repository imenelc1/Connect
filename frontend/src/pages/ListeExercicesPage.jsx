import React, { useContext, useState } from "react";
import CoursesSidebarItem from "../components/ui/CourseSidebarItem";
import { Menu } from "lucide-react";
import Button from "../components/common/Button";
import ContentSearchBar from "../components/common/ContentSearchBar";
import HeadMascotte from "../components/ui/HeadMascotte";
import IaAssistant from "../components/ui/IaAssistant";
import UserCircle from "../components/common/UserCircle";
import ThemeContext from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

// -------------------------------
// 1. Exercices stockés en CONSTANTE
// -------------------------------
const EXERCISES = [
  { id: 1, title: "Somme de deux nombres", description: "Lire un entier et afficher s’il est pair ou impair.", level: "beginner", language: "C" },
  { id: 2, title: "Boucles et itérations", description: "Afficher les 10 premiers nombres naturels.", level: "intermediate", language: "Python" },
  { id: 3, title: "Manipulation des tableaux", description: "Trier un tableau en ordre croissant.", level: "advanced", language: "Java" },
  { id: 4, title: "Conditions imbriquées", description: "Trouver le plus grand de trois nombres.", level: "beginner", language: "C" },
  { id: 5, title: "Fonctions et modularité", description: "Créer une fonction qui calcule une moyenne.", level: "intermediate", language: "C++" }
];

// -------------------------------
// 2. Mapping des gradients
// -------------------------------
const LEVEL_GRADIENT = {
  beginner: "bg-grad-2",
  intermediate: "bg-grad-3",
  advanced: "bg-grad-4"
};

export default function ExercisesPage() {

  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-full min-h-screen bg-surface">

      {/* ================= HEADER ================= */}
      <header className="w-full bg-surface py-6 px-6 shadow-sm">

        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* LEFT : Back + Exercises */}
          <div className="flex items-center gap-2">


            <h1 className="text-xl md:text-2xl font-semibold text-blue">
              Exercises
            </h1>
          </div>



          {/* RIGHT SECTION */}
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

        {/* SIDEBAR (Desktop) */}
        <div className="hidden md:block w-[300px] p-4 border-r border-blue/10 bg-surface">
          <CoursesSidebarItem />
        </div>

        {/* SIDEBAR (Mobile collapsé) */}
        {collapsed && (
          <div className="sm:hidden absolute z-50 w-[250px] bg-background border-r shadow-xl h-full p-4">
            <CoursesSidebarItem />
          </div>
        )}

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 space-y-6 px-2 md:px-6 py-4">

          <h1 className="text-center text-xl font-semibold text-textc mt-2">
            Les Bases de l’algorithmique
          </h1>

          <div className="mt-4 space-y-6 bg-background p-6 rounded-2xl shadow-md">


            {EXERCISES.map((ex) => (
              <div key={ex.id}
                className={`p-5 rounded-2xl shadow border border-blue/10 ${LEVEL_GRADIENT[ex.level]}`}>

                <h2 className="font-semibold text-[15px]">
                  Exercice {ex.id} — {ex.title}
                </h2>

                <p className="text-xs text-grayc mt-1">
                  {ex.description}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[10px] bg-blue/10 text-blue px-3 py-1 rounded-full">
                    {ex.level}
                  </span>

                  <span className="text-[10px] bg-purple/10 text-purple px-3 py-1 rounded-full">
                    {ex.language}
                  </span>
                </div>

                <Button
                  variant="courseStart"
                  text="Do the exercise"
                  className="mt-4 px-6 h-9 text-sm bg-blue text-white rounded-full mx-auto block !w-fit"
                  onClick={() => navigate(`/start-exercise/${ex.id}`)}
                />



              </div>
            ))}

          </div>
        </main>
      </div>
    </div>
  );
}
