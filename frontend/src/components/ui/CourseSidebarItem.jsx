import React from "react";
import { CheckCircle } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function CoursesSidebarItem({ mobileOpen = true }) {
  const courses = [
    { title: "Introduction au langage C", duration: "8 chapitres · 2h 30min", progress: 100, completed: true, active: true },
    { title: "Variables et types de données", duration: "8 chapitres · 2h 30min", progress: 40, completed: false, active: false },
    { title: "Structures de contrôle", duration: "8 chapitres · 2h 30min", progress: 20, completed: false, active: false },
    { title: "Fonctions et procédures", duration: "8 chapitres · 2h 30min", progress: 10, completed: false, active: false },
    { title: "Tableaux et chaînes", duration: "8 chapitres · 2h 30min", progress: 0, completed: false, active: false },
    { title: "Pointeurs", duration: "8 chapitres · 2h 30min", progress: 0, completed: false, active: false },
  ];

  return (
    <aside
      className={`w-full sm:w-[280px] bg-card border border-blue/20 rounded-3xl p-4 space-y-4`}
    >
      {courses.map((course, i) => (
        <div
          key={i}
          className={`p-4 rounded-2xl shadow-md border transition cursor-pointer ${
            course.active
              ? "bg-grad-2 border-blue text-muted"
              : "bg-grad-3 border-blue/10 text-muted"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">{course.title}</h2>
            {course.completed && <CheckCircle className="w-5 h-5 text-purple" />}
          </div>
          <p className="text-xs text-grayc mt-1">{course.duration}</p>
          <ProgressBar progress={course.progress} title="" />
        </div>
      ))}
    </aside>
  );
}
