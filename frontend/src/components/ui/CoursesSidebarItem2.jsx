import React from "react";
import { useTranslation } from "react-i18next";

export default function CoursesSidebarItem2({
  
  sections,
  currentSectionIndex,
  setCurrentSectionIndex
}) {
  if (!Array.isArray(sections)) sections = [];

  const selectSection = (index) => {
    setCurrentSectionIndex(index);
  };
   const {t} = useTranslation("courses");

  return (
    <aside className="
      w-full 
      sm:w-[230px]
      lg:w-[250px]
      flex-shrink-0
      bg-card 
      border border-blue/20 
      rounded-3xl 
      p-4 
      space-y-4 
      overflow-y-auto 
      max-h-[80vh]
    ">
      {sections.map((section, i) => {
        const isActive = i === currentSectionIndex;

        return (
          <div
            key={`${section.id}-${i}`}
            onClick={() => selectSection(i)}
            className={`p-4 rounded-2xl shadow-md border transition cursor-pointer ${
              isActive ? "bg-grad-2 border-blue text-muted" : "bg-grad-3 border-blue/10 text-muted"
            }`}
          >
            <h2 className="text-[15px] font-semibold">
              {section.title ||  t("titleMissing")}
            </h2>
          </div>
        );
      })}
    </aside>
  );
}
