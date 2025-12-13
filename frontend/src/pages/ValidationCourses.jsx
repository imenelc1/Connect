import React, { useState } from "react";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import { useTranslation } from "react-i18next";
import { Eye, CheckCircle, XCircle, BookOpen } from "lucide-react";

export default function ValidationCourses() {
  const { t, i18n } = useTranslation("ValidationCourses");
  const userData = JSON.parse(localStorage.getItem("user")) || {};

  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const [activeTab, setActiveTab] = useState("pending");

  const coursesMock = {
    pending: [
      {
        id: 1,
        title: "Algorithmes de tri avancés",
        desc: "Tri rapide, fusion, par tas et comparaisons",
        instructor: "Prof. Jean Moreau",
        submitted: "1 Nov 2024",
        level: "Intermédiaire",
        status: "En attente",
      },
      {
        id: 2,
        title: "Programmation système Unix",
        desc: "Processus, threads et communication inter-processus",
        instructor: "Prof. Jean Moreau",
        submitted: "30 Oct 2024",
        level: "Avancé",
        status: "En attente",
      },
    ],
    approved: [],
    rejected: [],
  };

  const courses = coursesMock[activeTab];

  return (
    <div className="w-full min-h-screen flex bg-surface">
      {/* SIDEBAR */}
      <div className="hidden lg:block w-64 min-h-screen">
        <Navbar />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col p-4 md:p-8 lg:p-10 gap-8">

        {/* TOP RIGHT USER ICON */}
        <div className="flex justify-end">
          <UserCircle initials={initials} onChangeLang={(lang) => i18n.changeLanguage(lang)}  showDarkMode={false} />
        </div>

        {/* TITLE */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textc">{t("title")}</h1>
          <p className="text-grayc">{t("subtitle")}</p>
        </div>

        {/* TABS RESPONSIVE */}
        <div className="flex overflow-x-auto gap-3 bg-gray-100 p-2 rounded-full w-max max-w-full shadow-sm">
          {["pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 whitespace-nowrap rounded-full text-sm font-medium transition
                ${activeTab === tab ? "bg-white shadow text-textc" : "text-gray-500 hover:text-textc"}
              `}
            >
              {t(`tabs.${tab}`)} ({coursesMock[tab].length})
            </button>
          ))}
        </div>

        {/* COURSES LIST */}
        <div className="flex flex-col gap-6">
          {courses.length === 0 ? (
            <p className="text-gray-500 italic">{t("empty")}</p>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="w-full bg-card border border-gray-200 rounded-3xl shadow-card 
                           p-4 md:p-6 flex flex-col sm:flex-row gap-4 md:gap-6"
              >
                {/* ICON */}
                <div className="bg-primary/10 rounded-2xl p-3 md:p-4 flex items-center justify-center sm:self-start">
                  <BookOpen className="text-primary" size={36} />
                </div>

                {/* CONTENT */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                    <h2 className="text-lg md:text-xl font-semibold text-textc">{course.title}</h2>

                    <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full w-fit">
                      {course.status}
                    </span>

                    <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full w-fit">
                      {course.level}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm md:text-base">{course.desc}</p>

                  <p className="text-xs md:text-sm text-gray-500">
                    {t("by")} <span className="font-medium">{course.instructor}</span> • {t("submitted")} {course.submitted}
                  </p>

                  {/* ACTION BUTTONS — RESPONSIVE */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-full shadow hover:opacity-90">
                      <Eye size={16} /> {t("buttons.inspect")}
                    </button>

                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary rounded-full hover:bg-primary/20">
                      <CheckCircle size={16} /> {t("buttons.approve")}
                    </button>

                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-400 rounded-full hover:bg-red-100">
                      <XCircle size={16} /> {t("buttons.reject")}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
