import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function ContentFilters({ showCompletedFilter, onFilterChange, activeFilter, userRole }) {
  const { t } = useTranslation("filters"); // Namespace filters
  const levels = ["ALL", "beginner", "intermediate", "advanced"];
  
  const [completedStatus, setCompletedStatus] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  return (
    <div className="w-full flex justify-center mt-6">
      <div className="flex items-center gap-8 flex-wrap">

        {/* Boutons de niveaux */}
        <div className="flex bg-primary/20 rounded-full px-6 py-2 gap-6 font-semibold">
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => onFilterChange(lvl)}
              className={
                lvl === activeFilter
                  ? "text-supp bg-white/20 px-3 py-1 rounded-full transition"
                  : "text-grayc hover:text-supp transition px-3 py-1 rounded-full"
              }
            >
              {lvl === "ALL" ? t("allLevels") : t(`levels.${lvl}`)}
            </button>
          ))}
        </div>

        {/* Filtre de complétion (pour étudiants) */}
        {showCompletedFilter && (
          <select
            value={completedStatus}
            onChange={(e) => setCompletedStatus(e.target.value)}
            className="appearance-none rounded-xl px-4 py-2 bg-white shadow border border-primary/30 text-primary font-medium cursor-pointer focus:ring-2 focus:ring-supp focus:outline-none transition"
          >
            <option value="">{t("status.all")}</option>
            <option value="completed">{t("status.completed")}</option>
            <option value="not_completed">{t("status.notCompleted")}</option>
          </select>
        )}

        {/* Filtre de cours (pour enseignants) */}
        {userRole === "enseignant" && (
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-xl px-4 py-2 shadow bg-white border border-primary/30 text-primary font-medium cursor-pointer focus:ring-2 focus:ring-supp focus:outline-none transition"
          >
            <option value="myCourses">{t("myCourses")}</option>
            <option value="allCourses">{t("allCourses")}</option>
          </select>
        )}

      </div>
    </div>
  );
}
