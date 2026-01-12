import React from "react";
import { CheckCircle } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { useTranslation } from "react-i18next";


export default function CoursesSidebarItem({ sections, currentSectionIndex, setCurrentSectionIndex }) {
    const {t} = useTranslation("courses");
  if (!Array.isArray(sections)) sections = [];

  const toggleSection = (index) => {
    setCurrentSectionIndex(index);
  };

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
        const sectionProgress = section.lessons?.length
          ? Math.round((section.lessons.filter((l) => l.visited).length / section.lessons.length) * 100)
          : 0;

        return (
          <div
            key={section.id || i}
            onClick={() => toggleSection(i)}
            className={`p-4 rounded-2xl shadow-md border transition cursor-pointer ${
              isActive ? "bg-grad-2 border-blue text-muted" : "bg-grad-3 border-blue/10 text-muted"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">{section.title || t("titleMissing")}</h2>
              {sectionProgress === 100 && <CheckCircle className="w-5 h-5 text-purple" />}
            </div>
            <div className="mt-2">
              <ProgressBar value={sectionProgress} title="" />
            </div>
          </div>
        );
      })}
    </aside>
  );
}
