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
  hideCategoryFilter = false // <-- Nouvelle prop pour cacher le filtre catégorie
}) {
  const { t } = useTranslation("filters");
  const levels = ["ALL", "Débutant", "Intermédiaire", "Avancé"];

  const [completedStatus, setCompletedStatus] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

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

  const current = labels[type];

  return (
    <div className="w-full flex justify-center mt-8">
      <div className="flex items-center gap-4 flex-wrap">

        {/* NIVEAUX */}
        <div className="flex bg-primary/20 rounded-full px-6 py-2 gap-4 font-semibold shadow-inner text-sm">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => onFilterChange(lvl)}
              className={`px-4 py-1.5 transition-all duration-300 rounded-full text-white font-bold text-sm${
                lvl === activeFilter
                  ? "text-white bg-primary shadow-md"
                  : "text-primary/70 hover:text-primary"
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
            onChange={setCompletedStatus}
            placeholder={t("status.all")}
            options={[
              { value: "", label: t("status.all") },
              { value: "completed", label: t("status.completed") },
              { value: "not_completed", label: t("status.notCompleted") },
            ]}
          />
        )}

        {/* CATÉGORIE : cachée si hideCategoryFilter est true */}
        {!hideCategoryFilter && (userRole === "enseignant" || userRole === "etudiant") && (
          <ModernDropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder={current.placeholder}
            options={[
              { value: "mine", label: current.my },
              { value: "all", label: current.all },
            ]}
          />

        )}

      </div>
    </div>
  );
}
