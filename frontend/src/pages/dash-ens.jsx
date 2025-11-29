import React from "react";
import Button from "../components/common/Button";
import Cards from "../components/common/Cards-Dash";
import { Search, TrendingDown, CircleCheckBig, Clock3, Book, CirclePlus, FolderPlus, Activity, Bell } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Input from "../components/common/Input";
import LearningCurve from "../components/common/LearningCurve";
import NotificationItem from "../components/common/AcivityFeed";
import Mascotte from "../components/common/Mascotte";
import "../styles/index.css";
import UserCircle from "../components/common/UserCircle";
// Traduction (i18next)
import { useTranslation } from "react-i18next";
// Thème global (dark/light mode)
import ThemeContext from "../context/ThemeContext";
import { useContext } from "react";

// Navigation entre routes (React Router)
import { useNavigate } from "react-router-dom";

// Imports for pie chart
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function Dashboardens() {
  // Hook de traduction
  const { t, i18n } = useTranslation("Dashboard");
  // Récupérer darkMode depuis ThemeContext
   const navigate = useNavigate();
// Récupérer darkMode depuis ThemeContext
  const { toggleDarkMode } = useContext(ThemeContext);

  const dat = [
    {
      title: "Emma Wilson completed Python Basics Quiz",
      date: "2nd of February",
      day: "Tuesday",
      time: "11:30 - 12:30",
    },
    {
      title: "James Lee submitted Loop Assignment",
      date: "3rd of February",
      day: "Wednesday",
      time: "11:30 - 12:30",
    },
    {
      title: "Sophia Chen asked question in Arrays & Strings",
      date: "5th of February",
      day: "Tuesday",
      time: "11:30 - 12:30",
    },
    {
      title: "Michael Brown completed Data Structures Course",
      date: "8th of February",
      day: "Monday",
      time: "11:30 - 12:30",
    },
  ];

  // Chart data
  const data = [
    { name: "Published", value: 46 },
    { name: "Draft", value: 10 },
    { name: "Quizzes", value: 82 },
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
              <UserCircle size={22}  onToggleTheme={toggleDarkMode}
                onChangeLang={(lang) => i18n.changeLanguage(lang)} />
            </div>
          </div>
        </header>




        {/* Welcome banner */}
        <div className=" relative bg-grad-1 text-white p-6 rounded-3xl shadow-lg flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
            <span className=" absolute top-2 left-4 text-sm opacity-90 ">October 18, 2025</span>

            <h1 className="text-2xl md:text-3xl font-bold ml-2">
              {t("Dashboard.Welcome")} Mr Bessad
            </h1>

            <p className="text-sm text-center opacity-90">{t("Dashboard.Alwaysp")}</p>
          </div>

          <Mascotte className="w-48 sm:w-60 lg:w-72" />
        </div>


        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Cards text="Average Student Progress" value="68%" icon={<TrendingDown />} bg="bg-grad-6" />
          <Cards text="Success Rate" value="68%" icon={<CircleCheckBig />} bg="bg-grad-8" />
          <Cards text="Average time spent" value="4.2h" icon={<Book />} bg="bg-grad-6" />
          <Cards text="Active Courses" value="10" icon={<Clock3 />} bg="bg-grad-8" />
        </div>
        {/* Learning curve */}
        <div className="p-4 w-full" style={{ height: "350px" }}>
          <LearningCurve />
        </div>


        {/* ----------------------------- */}
        {/* 👉 Added Quick Actions + Pie */}
        {/* ----------------------------- */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Quick actions */}
          <div>
            <h2 className="text-xl text-primary font-bold mb-6">{t("Dashboard.Quick")}</h2>

            {/* Fond complètement opaque */}
            <div className="bg-primary text-center text-white rounded-3xl  pl-6 shadow-lg">

              <div className="flex flex-col">

                {/* Create a course */}
                <button className="relative w-full pl-6 flex items-center gap-4 py-6 px-3 bg-white/30 hover:bg-white/10 rounded-tl-full transition">

                  <CirclePlus size={22} />

                  <span className=" ml-16 text-xl font-bold ">{t("Dashboard.CreateC")}</span>
                </button>

                {/* My spaces */}
                <button className="w-full pl-6 flex items-center gap-4 py-6 px-3 bg-white/30 hover:bg-white/10  transition">

                  <Activity size={22} />

                  <span className="ml-16 text-xl font-bold">{t("Dashboard.Space")}</span>
                </button>

                {/* Publish exercise */}
                <button className="w-full pl-6 flex items-center gap-4 py-6 px-3 bg-white/30 hover:bg-white/10  transition">

                  <FolderPlus size={22} />

                  <span className=" ml-16 text-xl font-bold">{t("Dashboard.publish")}</span>
                </button>

                {/* Stats */}
                <button className="w-full pl-6 flex items-center gap-4 py-6 px-3 bg-white/30  hover:bg-white/10 rounded-bl-full transition">

                  <TrendingDown size={22} />

                  <span className=" ml-16 text-xl font-bold">{t("Dashboard.Stats")}</span>
                </button>

              </div>

            </div>
          </div>

          {/* Pie chart */}
          <div className="rounded-2xl shadow-lg p-6 flex flex-col items-center bg-card">
            <PieChart width={300} height={300}>
              <Pie
                dataKey="value"
                data={data}
                innerRadius={0}
                outerRadius={120}
                paddingAngle={2}
                label={({ value }) => value}
                labelStyle={{ fill: "bg-white", fontSize: 18, fontWeight: "bold" }}
              >
                {/* Couleurs exactes */}
                <Cell fill="rgb(var(--color-purple))" /> {/* Published */}
                <Cell fill="rgb(var(--color-primary))" /> {/* Draft */}
                <Cell fill="rgb(var(--color-pink))" /> {/* Quizzes */}
              </Pie>
            </PieChart>

            {/* Légende */}
            <div className="flex gap-6 text-sm mt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-rgb(var(--color-purple))rounded-full"></span> Published
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-rgb(var(--color-primary)) rounded-full"></span> Draft
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-rgb(var(--color-pink)) rounded-full"></span> Quizzes
              </div>
            </div>
          </div>

        </div>
        {/* "activity feed" */}
        <div className="bg-card p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-gray mb-2">{t("Dashboard.ActivityF")}</h2>
          <p className="text-gray-500 text-sm mb-4">1st Feb Monday - 7th Feb Sunday</p>

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
