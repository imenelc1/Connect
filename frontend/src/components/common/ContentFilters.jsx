import { useTranslation } from "react-i18next";
import { useState } from "react";
import ModernDropdown from "./ModernDropdown";

export default function ContentFilters({
  showCompletedFilter,
  onFilterChange,
  activeFilter,
  userRole,
  type = "courses",
  categoryFilter,
  setCategoryFilter,
  hideCategoryFilter = false,
  onCompletedChange
}) {
  const { t } = useTranslation("filters");
  //niveaux possible
  const levels = ["ALL", "Débutant", "Intermédiaire", "Avancé"];

  const [completedStatus, setCompletedStatus] = useState(""); //pour le filtre completé/non complété
  const [courseFilter, setCourseFilter] = useState("");
  const [exerciseStatus, setExerciseStatus] = useState("");


  // TEXTES DYNAMIQUES SELON LE TYPE
  const labels = {
    courses: {
      my: t("myCourses"),
      all: t("allCourses"),
      placeholder: t("myCourses"),
    },
    exercises: {
      my: t("myExercises"),
      all: t("allExercises"),
      placeholder: t("myExercises"),
    },
    quizzes: {
      my: t("myQuizzes"),
      all: t("allQuizzes"),
      placeholder: t("myQuizzes"),
    }
  };

  const current = labels[type]; //labels dynamique selon le type courant


  return (
    <div className="w-full flex justify-center mt-2 sm:mt-8">
      <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-4">

        {/* NIVEAUX */}
        <div className="flex justify-center gap-1 sm:gap-4 
                bg-primary/50 rounded-full px-2 py-1 sm:px-6 sm:py-2 
                text-xs sm:text-sm font-semibold shadow-inner
                overflow-x-auto">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => onFilterChange(lvl)}
              className={`px-2 py-1 sm:px-4 sm:py-1.5 transition-all duration-300 rounded-full font-bold sm:text-sm ${lvl === activeFilter
                  ? "bg-primary text-white shadow-md"
                  : "text-white hover:text-primary"
                }`}
            >
              {lvl === "ALL" ? t("allLevels") : t(`levels.${lvl}`)}
            </button>
          ))}
        </div>

        {/* ÉTAT DE COMPLÉTION */}
        {showCompletedFilter && (
          <ModernDropdown
            value={completedStatus}
            onChange={(value) => {
              setCompletedStatus(value);
              onCompletedChange?.(value);
            }}
            placeholder={t("status.all")}
            options={[
              { value: "", label: t("status.all") }, //tous
              { value: "completed", label: t("status.completed") }, //complété
              { value: "not_completed", label: t("status.notCompleted") }, //non complété
            ]}
            className="w-full sm:w-40"
          />
        )}

        {/* FILTRE ÉTAT DES EXERCICES */}
        {type === "exercises" && userRole === "etudiant" && (
          <ModernDropdown
            value={activeFilter} // ← utiliser la valeur active depuis le parent
            onChange={(value) => {
              onCompletedChange?.(value);
            }}
            placeholder={t("status.all")}
            options={[
              { value: "ALL", label: t("status.all") },
              { value: "soumis", label: t("status.submitted") }, //soumis
              { value: "brouillon", label: t("status.draft") }, //brouillon
            ]}
            className="w-full sm:w-40"
          />
        )}


        {/* CATÉGORIE */}
        {!hideCategoryFilter && (userRole === "enseignant" || userRole === "etudiant") && (
          <ModernDropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder={current.placeholder}
            options={[
              { value: "mine", label: current.my },
              { value: "all", label: current.all },
            ]}
            className="w-full sm:w-40"
          />
        )}

      </div>
    </div>


  );
}