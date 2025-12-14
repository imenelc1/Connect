import React from "react";
import { CheckCircle } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function CoursesSidebarItem({ sections = [], currentSectionIndex, setCurrentSectionIndex }) {
  // sections = [] : fallback si sections est undefined ou null

  if (!Array.isArray(sections)) {
    console.warn("CoursesSidebarItem: sections should be an array", sections);
    sections = [];
  }

  return (
    <aside className="w-full sm:w-[280px] bg-card border border-blue/20 rounded-3xl p-4 space-y-4">
      {sections.map((course, i) => (
        <div
          key={course.id || i} // fallback clé si id manquant
          onClick={() => setCurrentSectionIndex(i)}
          className={`p-4 rounded-2xl shadow-md border transition cursor-pointer ${
            i === currentSectionIndex
              ? "bg-grad-2 border-blue text-muted"
              : "bg-grad-3 border-blue/10 text-muted"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">{course.title || "Titre manquant"}</h2>
            {course.completed && <CheckCircle className="w-5 h-5 text-purple" />}
          </div>
          <p className="text-xs text-grayc mt-1">
            {Array.isArray(course.lessons) ? course.lessons.length : 0} leçon
            {Array.isArray(course.lessons) && course.lessons.length > 1 ? "s" : ""}
          </p>
          <ProgressBar progress={course.progress ?? 0} title="" />
        </div>
      ))}
    </aside>
  );
}
