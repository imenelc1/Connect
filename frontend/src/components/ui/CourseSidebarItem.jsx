import React from "react";
import { CheckCircle } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function CoursesSidebarItem({ sections, currentSectionIndex, setCurrentSectionIndex }) {
  return (
    <aside className="w-full sm:w-[280px] bg-card border border-blue/20 rounded-3xl p-4 space-y-4">
      {sections.map((course, i) => (
        <div
          key={course.id}
          onClick={() => setCurrentSectionIndex(i)}
          className={`p-4 rounded-2xl shadow-md border transition cursor-pointer ${
            i === currentSectionIndex
              ? "bg-grad-2 border-blue text-muted"
              : "bg-grad-3 border-blue/10 text-muted"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">{course.title}</h2>
            {course.completed && <CheckCircle className="w-5 h-5 text-purple" />}
          </div>
          <p className="text-xs text-grayc mt-1">
            {course.lessons.length} leçon{course.lessons.length > 1 ? "s" : ""}
          </p>
          <ProgressBar progress={course.progress} title="" />
        </div>
      ))}
    </aside>
  );
}
