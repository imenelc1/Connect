import React from "react";
import { ChevronLeft, ChevronDown, Search } from "lucide-react";
import CoursesSidebar from "../components/ui/CourseSidebarItem";
import CourseContent from "../components/ui/CourseContent";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import UserCircle from "../components/common/UserCircle";
import ThemeContext from "../context/ThemeContext";
import HeadMascotte from "../components/ui/HeadMascotte";
import IaAssistant from "../components/ui/IaAssistant";

export default function Courses() {
  const { t, i18n } = useTranslation("courses");

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  const { toggleDarkMode } = useContext(ThemeContext);

  const storedUser = localStorage.getItem("user");

// Si storedUser est null, vide ou "undefined", on renvoie null
const userData =
  storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

const userRole = userData?.role ?? null;
const initials = userData
  ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
  : "";


  return (
    <div className="w-full bg-background flex flex-col items-center">
      {/* HEADER */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 px-4">    
        {/*Title */}
      
          <h1 className="text-2xl md:text-3xl font-bold text-muted ml-10">{t("title")}</h1>

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
         <div className="flex gap-2 ml-5">
           <IaAssistant />
           <HeadMascotte />
         </div>

          {/* My Courses */}
          <button className="flex items-center gap-2  px-4 py-2 rounded-xl border shadow text-muted w-full sm:w-auto">
            {t("myCourses")} <ChevronDown size={18} />
          </button>

                  {/* User Circle */}
              <UserCircle
                initials={initials}
                onToggleTheme={toggleDarkMode}
                onChangeLang={(lang) => i18n.changeLanguage(lang)}
              />

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
