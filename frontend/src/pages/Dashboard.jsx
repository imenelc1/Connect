import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/Navbar";
import CourseCard from "../components/common/CourseCard";
import { Users, BookOpen, ClipboardList, LayoutGrid } from "lucide-react";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import ContentFilters from "../components/common/ContentFilters";
import ActivityCharts from "../components/common/ActivityCharts";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";
import dayjs from "dayjs";
import NotificationItem from "../components/common/AcivityFeed"; 
import "dayjs/locale/fr";
import "dayjs/locale/en";
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

  // États pour les notifications 
  const { notifications, loading: loadingNotifications, fetchNotifications } = useNotifications();
const lang = i18n.language; // "fr" ou "en"
dayjs.locale(lang);
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

  // Effet pour charger les notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Fonction pour formater les notifications 
  const formatNotificationsForFeed = () => {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return [
        {
          title: t("notifications.newStudent"),
          date: dayjs().format("DD/MM/YYYY"),
          day: t(`days.${dayjs().format("dddd")}`),
          time: dayjs().format("HH:mm")
        },
        {
          title: t("notifications.courseApproved"),
          date: dayjs().subtract(1, 'day').format("DD/MM/YYYY"),
          day: t(`days.${dayjs().subtract(1, 'day').format("dddd")}`),
          time: "14:15"
        },
        {
          title: t("notifications.exerciseSubmitted"),
          date: dayjs().subtract(2, 'day').format("DD/MM/YYYY"),
          day: t(`days.${dayjs().subtract(2, 'day').format("dddd")}`),
          time: "16:45"
        },
        {
          title: t("notifications.newTeacher"),
          date: dayjs().subtract(3, 'day').format("DD/MM/YYYY"),
          day: t(`days.${dayjs().subtract(3, 'day').format("dddd")}`),
          time: "09:20"
        }
      ];
    }

    return notifications.slice(0, 4).map(notif => {
      const dateObj = notif.date_envoie
        ? dayjs(notif.date_envoie)
        : dayjs();

      return {
        title: notif.message_notif || "Notification",
        date: dateObj.format("DD/MM/YYYY"),
        day: dateObj.format("dddd"),
        time: dateObj.format("HH:mm"),
      };
    });
  };

  const formattedNotifications = formatNotificationsForFeed();

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
      title: t("stats.totalCourses"),
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

  const statGradients = [
    "bg-grad-5",
    "bg-grad-4",
    "bg-grad-2",
    "bg-grad-3",
  ];

  useEffect(() => {
    fetch("${process.env.REACT_APP_API_URL}/api/users/admin/stats/", {
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
        <div className="flex flex-row justify-between items-center gap-3 sm:gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("title")}</h1>
            <p className="text-gray">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
           
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

          {/* LEFT: Recent Activity  */}
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-muted mb-4">{t("recentActivity")}</h2>
            <p className="text-gray-500 text-xs mb-4">
              {dayjs().format("DD MMM")} - {dayjs().endOf('week').format("DD MMM")}
            </p>
            <div className="space-y-3">
              {loadingNotifications ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-gray-500">{t("notificationLoad")}</p>
                </div>
              ) : formattedNotifications.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-gray-500">{t("noNotif")}</p>
                </div>
              ) : (
                formattedNotifications.map((item, index) => (
                  <NotificationItem
                    key={index}
                    title={item.title}
                    date={item.date}
                    day={item.day}
                    time={item.time}
                    isMobile={isMobile}
                  />
                ))
              )}
            </div>
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
