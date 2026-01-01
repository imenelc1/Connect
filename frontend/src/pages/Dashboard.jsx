import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/NavBar";
import CourseCard from "../components/common/CourseCard";
import { Users, BookOpen, ClipboardList, LayoutGrid } from "lucide-react";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import ContentFilters from "../components/common/ContentFilters";
import ActivityCharts from "../components/common/ActivityCharts";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";

export default function DashboardAdmin() {
  const { toggleDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation("DashboardAdmin");

  // États pour la responsivité
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [activeTab, setActiveTab] = useState("pending");
  const token = localStorage.getItem("admin_token");
  const adminData = JSON.parse(localStorage.getItem("admin")) || {};
  const initials = `${adminData.nom?.[0] || ""}${adminData.prenom?.[0] || ""}`.toUpperCase();
  // Effet pour la responsivité
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Gestion de la sidebar
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  // ----- MOCK COURSES -----
  const pendingCourses = [
    {
      id: 1,
      title: "Algorithmes de tri avancés",
      desc: "Tri rapide, fusion...",
      instructor: "Prof. Jean Moreau",
      submitted: "1 Nov 2024",
      level: "Intermédiaire",
      status: t("tabs.pending"),
    },
    {
      id: 2,
      title: "Programmation système Unix",
      desc: "Processus, threads...",
      instructor: "Prof. Jean Moreau",
      submitted: "30 Oct 2024",
      level: "Avancé",
      status: t("tabs.pending"),
    },
  ];

  const approvedCourses = [];
  const rejectedCourses = [];

  const coursesByTab = { pending: pendingCourses, approved: approvedCourses, rejected: rejectedCourses };
  const courses = coursesByTab[activeTab];

  // ----- MOCK STATS -----
  const [statsData, setStatsData] = useState({
    total_students: 0,
    total_courses: 0,
    total_exercises: 0,
    total_spaces: 0,
  });

  const stats = [
    {
      title: t("stats.totalStudents"),
      value: statsData.total_students,
      icon: <Users className="text-blue" size={40} />,
    },
    {
      title: t("stats.activeCourses"),
      value: statsData.total_courses,
      icon: <BookOpen className="text-purple" size={40} />,
    },
    {
      title: t("stats.totalExercises"),
      value: statsData.total_exercises,
      icon: <ClipboardList className="text-pink" size={40} />,
    },
    {
      title: t("stats.totalSpaces"),
      value: statsData.total_spaces,
      icon: <LayoutGrid className="text-blue" size={40} />,
    },
  ];

  // ----- COLORS DU PROTOTYPE -----
  const statGradients = [
    "bg-grad-5",
    "bg-grad-4",
    "bg-grad-2",
    "bg-grad-3",
  ];

  // ----- MOCK RECENT ACTIVITY -----
  const recentActivity = [
    { name: "Alice Martin", action: "Completed 'Pointers'", time: "5 min ago" },
    { name: "Bob Johnson", action: "Started 'Binary'", time: "12 min ago" },
    { name: "Carol Smith", action: "Submitted Quiz", time: "23 min ago" },
    { name: "David Lee", action: "Earned 'Master of Algo'", time: "1 hour ago" },
    { name: "Emma Wilson", action: "Posted in Recursion", time: "2 hours ago" },
  ];

  useEffect(() => {
    fetch("http://localhost:8000/api/users/admin/stats/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setStatsData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      {/* Main Content */}
      <main className={`
        flex-1 p-6 pt-10 space-y-5 transition-all duration-300
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("title")}</h1>
            <p className="text-gray">{t("subtitle")}</p>
          </div>
          
          <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
                  <NotificationBell />
                  <UserCircle
                    initials={initials}
                    onToggleTheme={toggleDarkMode}
                    onChangeLang={(lang) => {
                      const i18n = window.i18n;
                      if (i18n?.changeLanguage) i18n.changeLanguage(lang);
                    }}
                  />
                </div>
        </div>

        {/* STATS WITH PROTOTYPE COLORS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition flex justify-between items-center bg-gradient-to-br ${statGradients[i]}`}
            >
              <div>
                <p className="text-gray">{stat.title}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-muted">{stat.value}</h2>
              </div>
              <div className="opacity-80">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* GRID: ACTIVITY + COURSES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: Recent Activity */}
          <div className="bg-card  rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-muted mb-4">{t("recentActivity")}</h2>

            <ul className="flex flex-col gap-4">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-grad-2 text-muted flex items-center justify-center font-bold">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-muted font-medium">{item.name}</p>
                    <p className="text-gray text-sm">{item.action}</p>
                    <span className="text-gray-400 text-xs">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: COURSES VALIDATION */}
          <div className="bg-card  rounded-2xl p-6 shadow-sm">
            <ActivityCharts />

          </div>
        </div>
      </main>
    </div>
  );
}