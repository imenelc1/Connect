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
import api from "../services/api"; 
import { useEffect, useState } from "react";

// Imports for pie chart
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function Dashboardens() {
  // Hook de traduction
  const { t, i18n } = useTranslation("Dashboard");
  // Récupérer darkMode depuis ThemeContext
   const navigate = useNavigate();
   const storedUser = localStorage.getItem("user");

   const userData =
  storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
// Récupérer darkMode depuis ThemeContext
  const { toggleDarkMode } = useContext(ThemeContext);
const [user, setUser] = useState(null);
const initials = user
  ? `${user.nom?.[0] || ""}${user.prenom?.[0] || ""}`.toUpperCase()
  : "";

useEffect(() => {
  api.get("profile/")   // 🔥 grâce à ton interceptor, le token sera ajouté automatiquement
    .then((res) => {
      setUser(res.data);
      console.log("Profil chargé :", res.data);
    })
    .catch((err) => {
      console.error("Erreur profil :", err.response?.data || err);
    });
}, []);

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
    <div className="flex-shrink-0 w-14 sm:w-16 md:w-48">
      <Navbar />
    </div>

    {/* Main content */}
    <div className="flex-1 pl-6 pr-3 sm:pl-8 sm:pr-5 md:pl-10 md:pr-6 lg:pl-12 lg:pr-8 space-y-4">


      
      {/* Header */}
      <header className="flex justify-between items-center gap-3">
        <form className="flex-1 max-w-full lg:max-w-xs">
          <Input placeholder={t("Dashboard.Search")} icon={<Search size={16} />} />
        </form>

        <div className="flex items-center gap-3">
          <div className="bg-bg w-7 h-7 rounded-full flex items-center justify-center">
            <Bell size={16} />
          </div>

          <div className="w-7 h-7 flex items-center justify-center">
            <UserCircle size={20} initials={initials} onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => i18n.changeLanguage(lang)} />
          </div>
        </div>
      </header>

      {/* Welcome banner */}
      <div className="relative bg-grad-1 text-white p-4 rounded-2xl shadow-md flex flex-col lg:flex-row justify-between items-center gap-3">
        <div className="flex flex-col">
          <span className="absolute top-1 left-3 text-xs opacity-90">October 18, 2025</span>
          <h1 className="text-xl font-bold">
            {t("Dashboard.Welcome")} {user ? `${user.nom} ${user.prenom}` : "..."}
          </h1>
          <p className="text-xs opacity-90">{t("Dashboard.Alwaysp")}</p>
        </div>

        <Mascotte className="w-36 sm:w-44" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Cards text="Average Student Progress" value="68%" icon={<TrendingDown size={18} />} bg="bg-grad-6" />
        <Cards text="Success Rate" value="68%" icon={<CircleCheckBig size={18} />} bg="bg-grad-8" />
        <Cards text="Average time spent" value="4.2h" icon={<Book size={18} />} bg="bg-grad-6" />
        <Cards text="Active Courses" value="10" icon={<Clock3 size={18} />} bg="bg-grad-8" />
      </div>

      {/* Learning curve */}
      <div className="p-3 w-full" style={{ height: "250px" }}>
        <LearningCurve />
      </div>

      {/* Quick actions + Pie chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
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
        <div className="rounded-2xl shadow-md p-4 flex flex-col items-center bg-card">
          <PieChart width={220} height={220}>
            <Pie
              dataKey="value"
              data={data}
              outerRadius={90}
              paddingAngle={2}
              label={({ value }) => value}
              labelStyle={{ fontSize: 12 }}
            >
              <Cell fill="rgb(var(--color-purple))" />
              <Cell fill="rgb(var(--color-primary))" />
              <Cell fill="rgb(var(--color-pink))" />
            </Pie>
          </PieChart>

          <div className="flex gap-4 text-xs mt-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-rgb(var(--color-purple)) rounded-full"></span> Published
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-rgb(var(--color-primary)) rounded-full"></span> Draft
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-rgb(var(--color-pink)) rounded-full"></span> Quizzes
            </div>
          </div>
        </div>

      </div>

      {/* Activity feed */}
      <div className="bg-card p-4 rounded-2xl">
        <h2 className="text-lg font-bold mb-1">{t("Dashboard.ActivityF")}</h2>
        <p className="text-gray-500 text-xs mb-2">1st Feb Monday - 7th Feb Sunday</p>

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
