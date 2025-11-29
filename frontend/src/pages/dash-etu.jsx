import React, { useEffect, useState } from "react";
import Button from "../components/common/Button";
import Cards from "../components/common/Cards-Dash";
import { Search, TrendingDown, CircleCheckBig, Clock3, Book, CirclePlus, FolderPlus, Activity, Bell } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Input from "../components/common/Input";
import Mascotte from "../components/common/Mascotte";
import LearningCurve from "../components/common/LearningCurveEtu";
import NotificationItem from "../components/common/AcivityFeed";
import ProgressBar from "../components/ui/ProgressBar";
import "../styles/index.css";
import UserCircle from "../components/common/UserCircle";
import ThemeContext from "../context/ThemeContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
// Traduction (i18next)
import { useTranslation } from "react-i18next";


// Imports for pie chart
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function Dashboardetu() {
 

 
  const navigate = useNavigate();
  // Récupérer darkMode depuis ThemeContext
  const { toggleDarkMode } = useContext(ThemeContext);
  const { t } = useTranslation("Dashboard");
  const dat = [
    { title: "Emma Wilson completed Python Basics Quiz", date: "2nd of February", day: "Tuesday", time: "11:30 - 12:30" },
    { title: "James Lee submitted Loop Assignment", date: "3rd of February", day: "Wednesday", time: "11:30 - 12:30" },
    { title: "Sophia Chen asked question in Arrays & Strings", date: "5th of February", day: "Tuesday", time: "11:30 - 12:30" },
    { title: "Michael Brown completed Data Structures Course", date: "8th of February", day: "Monday", time: "11:30 - 12:30" },
  ];

  return (
    <div className="flex min-h-screen bg-primary/10">
      {/* Sidebar */}
        <div className={`flex-shrink-0 w-16 sm:w-20 md:w-56`}>
        <Navbar />
      </div>


      {/* Main content */}
 <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 space-y-6">
        {/* Header */}
        <header className="flex flex-row justify-between items-center w-full gap-4">
          {/* Formulaire de recherche */}
          <form className="flex-1 max-w-full lg:max-w-xs lg:ml-16">
            <Input placeholder={t("Dashboard.Search")} icon={<Search />} />
          </form>

          {/* Notifications et avatar */}
          <div className="flex items-center gap-4">
            <div className="bg-bg w-8 h-8 rounded-full flex items-center justify-center">
              <Bell size={20} />
            </div>

            <div className="w-8 h-8 flex items-center justify-center">
              <UserCircle size={22} onToggleTheme={toggleDarkMode}
                onChangeLang={(lang) => i18n.changeLanguage(lang)} />
            </div>
          </div>
        </header>


        {/* Welcome banner */}
        <div className=" relative bg-grad-1 text-white p-6 rounded-3xl shadow-lg flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
            <span className=" absolute top-2 left-4 text-sm opacity-90 ">October 18, 2025</span>

            <h1 className="text-2xl md:text-3xl font-bold ml-2">
              {t("Dashboard.Welcome")} Melissa
            </h1>

            <p className="text-sm text-center opacity-90">{t("Dashboard.Alwaysp")}</p>
          </div>

          <Mascotte className="w-48 sm:w-60 lg:w-72" />
        </div>


        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Cards text={t("Dashboard.AverageS")} value="68%" icon={<TrendingDown />} bg="bg-grad-6" />
          <Cards text={t("Dashboard.Success")} value="68%" icon={<CircleCheckBig />} bg="bg-grad-8" />
          <Cards text={t("Dashboard.AverageT")} value="4.2h" icon={<Book />} bg="bg-grad-6" />
          <Cards text={t("Dashboard.ActiveC")} value="10" icon={<Clock3 />} bg="bg-grad-8" />
        </div>

        {/* Progress bar */}
        <div className="bg-white text-primary p-6 sm:p-10 rounded-2xl w-full shadow-lg">
          <ProgressBar value={50} title={t("Dashboard.GlobalP")} />
        </div>


        {/* Learning curve */}
        <div className="p-4 w-full text-primary" style={{ height: "350px" }}>
          <LearningCurve title={t("Dashboard.Progress")} />
        </div>


        {/* Activity feed */}
        <div className="bg-card p-6 rounded-2xl w-full">
          <h2 className="text-xl font-bold text-gray mb-2">{t("Dashboard.ActivityF")} </h2>
          <p className="text-grisclair text-sm mb-4">1st Feb Monday - 7th Feb Sunday</p>
          {dat.map((item, index) => (
            <NotificationItem
              key={index}
              title={item.title}
              date={item.date}
              day={item.day}
              time={item.time}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
