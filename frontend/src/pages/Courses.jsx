import React from "react";
import { ChevronLeft, ChevronDown, Search } from "lucide-react";
import CoursesSidebar from "../components/ui/CourseSidebarItem";
import CourseContent from "../components/ui/CourseContent";
import { MdAutoAwesome } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Mascotte from "../assets/6.svg";
import { useContext } from "react";
import UserCircle from "../components/common/UserCircle";

import ThemeContext from "../context/ThemeContext";

export default function Courses() {
  const { t, i18n } = useTranslation("courses");

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  const { toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="w-full bg-background flex flex-col items-center">
      {/* HEADER */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 px-4">
        <UserCircle onToggleTheme={toggleDarkMode}/>
        
        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted shadow rounded-full flex items-center justify-center border border-blue/20 cursor-pointer">
            <ChevronLeft className="text-blue" size={22} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-muted">{t("title")}</h1>
        </div>

        {/* Right section */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">

          {/* Search */}
          <div className="relative w-full sm:w-64 md:w-80">
            <input
              placeholder={t("search")}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-blue/30 shadow-sm focus:outline-none"
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* IA Assistant */}
          <button className="flex items-center gap-2 bg-blue hover:bg-blue/90 text-white px-4 py-2 rounded-xl shadow w-full sm:w-auto">
            <MdAutoAwesome size={20} />
            {t("assistant")}
          </button>

          {/* Mascotte */}
          <img src={Mascotte} alt="Mascotte" className="w-10 h-10 hidden sm:block" />

          {/* My Courses */}
          <button className="flex items-center gap-2  px-4 py-2 rounded-xl border shadow text-muted w-full sm:w-auto">
            {t("myCourses")} <ChevronDown size={18} />
          </button>

          {/* Language */}
          <button
            onClick={toggleLanguage}
            className="bg-white hover:bg-blue/10 text-blue px-4 py-2 rounded-xl border shadow w-full sm:w-auto"
          >
            {i18n.language === "fr" ? "EN" : "FR"}
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-start gap-6 px-4 pb-10">
        <CoursesSidebar />
        <CourseContent t={t} />
      </div>
    </div>
  );
}