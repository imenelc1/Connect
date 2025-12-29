import React, { useEffect, useState, useContext } from "react";
import Button from "../components/common/Button";
import Cards from "../components/common/Cards-Dash";
import { Search, TrendingDown, CircleCheckBig, Clock3, Book, CirclePlus, FolderPlus, Activity } from "lucide-react";
import Navbar from "../components/common/NavBar";
import Input from "../components/common/Input";
import LearningCurve from "../components/common/LearningCurve";
import NotificationItem from "../components/common/AcivityFeed";
import Mascotte from "../components/common/Mascotte";
import "../styles/index.css";
import UserCircle from "../components/common/UserCircle";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import axios from "axios";
import { PieChart, Pie, Cell } from "recharts";
import progressionService from "../services/progressionService";
import NotificationBell from "../components/common/NotificationBell";

export default function Dashboardens() {
  const { t, i18n } = useTranslation("Dashboard");
  const navigate = useNavigate();
  const { toggleDarkMode } = useContext(ThemeContext);

  // États pour la responsivité
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const storedUser = localStorage.getItem("user");
  const userData = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const [user, setUser] = useState(null);
  const [activeCourses, setActiveCourses] = useState("");
  const [dailyTime, setDailyTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const initials = user
    ? `${user.nom?.[0] || ""}${user.prenom?.[0] || ""}`.toUpperCase()
    : "";

  // Effet pour la responsivité
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  const [avgSubmission, setAvgSubmission] = useState(0);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/all-students-submissions/",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { total_exercises, students } = res.data;
        const studentCount = students.length;

        // total soumis par tous les étudiants
        const totalSubmitted = students.reduce((sum, s) => sum + s.submitted_count, 0);

        const avg = total_exercises && studentCount
          ? ((totalSubmitted / (total_exercises * studentCount)) * 100).toFixed(2)
          : 0;

        setAvgSubmission(avg);


      } catch (err) {
        console.error("Erreur fetching submissions:", err);
      }
    };

    fetchSubmissions();
  }, []);

  const [successRate, setSuccessRate] = useState(0);
  useEffect(() => {
    const fetchSuccessRate = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/quiz_success_rate_prof/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccessRate(res.data.success_rate);
      } catch (err) {
        console.error("Erreur success rate:", err);
      }
    };

    fetchSuccessRate();
  }, []);




  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le profil
        const profileRes = await api.get("profile/");
        setUser(profileRes.data);
        console.log("Profil chargé :", profileRes.data);

        // Récupérer le nombre de cours créés
        const coursesCount = await progressionService.getActiveCoursesCountProf();
        setActiveCourses(coursesCount);

      } catch (err) {
        console.error("Erreur lors du chargement des données:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");

    const addSession = async () => {
      try {
        await axios.post(
          "http://127.0.0.1:8000/api/dashboard/add-session/",
          { duration: 60 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Erreur ajout session:", err);
      }
    };

    const fetchDailyTime = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/daily-time/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDailyTime(res.data.total_seconds || 0);
      } catch (err) {
        console.error("Erreur fetching daily time:", err);
      }
    };

    // 1️⃣ On récupère le temps **une première fois immédiatement**
    fetchDailyTime();

    // 2️⃣ On ajoute la session et relance le fetch toutes les 60 sec
    addSession();
    const interval = setInterval(async () => {
      await addSession();
      await fetchDailyTime();
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);




  const [contentCounts, setContentCounts] = useState({
    courses_count: 0,
    exercises_count: 0,
    quizzes_count: 0
  });

  useEffect(() => {
    const fetchContentCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/professor_content_counts_global",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setContentCounts(res.data);
        console.log("chart", res.data);
      } catch (err) {
        console.error("Erreur fetching content counts:", err);
      }
    };

    fetchContentCounts();
  }, []);




  // Formatage du temps lisible
  const formatTimeStyled = (secs) => {
    if (!secs || secs < 60) return <span className="text-green-500 font-bold">1 min</span>;

    const mins = Math.floor(secs / 60);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const s = secs % 60;

    return (
      <span>
        {h > 0 && <span style={{ fontSize: 26 }} className="text-blue">{h}h </span>}
        {m > 0 && <span style={{ fontSize: 26 }} className="text-blue">{m}min </span>}
        {s > 0 && <span style={{ fontSize: 26 }} className="text-blue">{s}s</span>}
      </span>
    );
  };


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
  const chartData = [
    { name: "Courses", value: contentCounts.courses_count },
    { name: "Exercises", value: contentCounts.exercises_count },
    { name: "Quizzes", value: contentCounts.quizzes_count }
  ];


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary/10">
        <div className="text-muted">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      {/* Main content */}
      <main className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          {/* User + Bell */}
          <div className="flex items-center gap-3 order-1 sm:order-2 mt-0 sm:mt-0 self-end sm:self-auto">
            <NotificationBell />
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => i18n.changeLanguage(lang)}
              size={isMobile ? "sm" : "md"}
            />

          </div>

          {/* Search input */}
          <form className="w-full sm:flex-1 max-w-full lg:max-w-sm ml-0 sm:ml-5 order-2 sm:order-1">
            <Input
              placeholder={t("Dashboard.Search")}
              icon={<Search size={isMobile ? 14 : 16} />}
              className="w-full"
            />
          </form>
        </header>



        {/* Welcome banner */}
        <div className="relative bg-grad-1 text-white p-4 rounded-2xl shadow-md flex flex-col lg:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="flex flex-col w-full lg:w-auto">
            <span className="absolute top-2 left-3 text-xs opacity-90">October 18, 2025</span>
            <h1 className="text-lg sm:text-xl font-bold mt-4 sm:mt-0">
              {t("Dashboard.Welcome")} {user ? `${user.nom} ${user.prenom}` : "..."}
            </h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1">{t("Dashboard.Alwaysp")}</p>
          </div>

          <Mascotte className="w-28 sm:w-36 lg:w-44 mt-4 lg:mt-0" />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 text-textc">
          <Cards
            text="Avg. Submission Rate"
            value={`${avgSubmission}%`}
            icon={<TrendingDown size={isMobile ? 16 : 18} />}
            bg="bg-grad-2"
            isMobile={isMobile}
          />
          <Cards
            text="Quizzes Success Rate"
            value={`${successRate}%`}
            icon={<CircleCheckBig size={isMobile ? 16 : 18} />}
            bg="bg-grad-3"
            isMobile={isMobile}
          />
          <Cards
            text="Time Spent Today"
            value={formatTimeStyled(dailyTime)}
            icon={<Book size={isMobile ? 16 : 18} />}
            bg="bg-grad-4"
            isMobile={isMobile}
          />
          <Cards
            text="Active Courses"
            value={activeCourses}
            icon={<Clock3 size={isMobile ? 16 : 18} />}
            bg="bg-grad-2"
            isMobile={isMobile}
          />
        </div>

        {/* Learning curve */}
        <div className="p-3 w-full" style={{ height: isMobile ? "280px" : "330px" }}>
          <LearningCurve />
        </div>

        {/* Quick actions + Pie chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Quick actions */}
          <div>
            <h2 className="text-lg sm:text-xl text-muted font-bold mb-4 sm:mb-6">Quick Actions</h2>
            <div className="bg-grad-1 text-center text-white rounded-2xl sm:rounded-3xl pl-4 sm:pl-6 shadow-lg">
              <div className="flex flex-col">
                <button
                  onClick={() => navigate("/CoursInfo")}
                  className="relative w-full pl-4 sm:pl-6 flex items-center gap-3 sm:gap-4 py-4 sm:py-6 px-3 bg-white/30 hover:bg-white/10 rounded-tl-2xl sm:rounded-tl-full transition"
                >
                  <CirclePlus size={isMobile ? 18 : 22} />
                  <span className="ml-8 sm:ml-16 text-base sm:text-xl font-bold">Create Course</span>
                </button>

                <button
                  onClick={() => navigate("/spaces")}
                  className="w-full pl-4 sm:pl-6 flex items-center gap-3 sm:gap-4 py-4 sm:py-6 px-3 bg-white/30 hover:bg-white/10 transition"
                >
                  <Activity size={isMobile ? 18 : 22} />
                  <span className="ml-8 sm:ml-16 text-base sm:text-xl font-bold">My Spaces</span>
                </button>

                <button
                  onClick={() => navigate("/new-exercise")}
                  className="w-full pl-4 sm:pl-6 flex items-center gap-3 sm:gap-4 py-4 sm:py-6 px-3 bg-white/30 hover:bg-white/10 transition"
                >
                  <FolderPlus size={isMobile ? 18 : 22} />
                  <span className="ml-8 sm:ml-16 text-base sm:text-xl font-bold">Publish Exercise</span>
                </button>

                <button
                  onClick={() => navigate("/stats")}
                  className="w-full pl-4 sm:pl-6 flex items-center gap-3 sm:gap-4 py-4 sm:py-6 px-3 bg-white/30 hover:bg-white/10 rounded-bl-2xl sm:rounded-bl-full transition"
                >
                  <TrendingDown size={isMobile ? 18 : 22} />
                  <span className="ml-8 sm:ml-16 text-base sm:text-xl font-bold">Stats</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pie chart */}
          <div className="rounded-2xl shadow-md  flex flex-col items-center bg-card">
            <PieChart width={isMobile ? 180 : 240} height={isMobile ? 180 : 220} className="mt-8">
              <Pie
                dataKey="value"
                data={chartData}
                outerRadius={isMobile ? 70 : 85}
                paddingAngle={0}
                label={({ value }) => value}
                labelStyle={{ fontSize: isMobile ? 10 : 12 }}
              >
                <Cell fill="rgb(var(--color-purple))" />
                <Cell fill="rgb(var(--color-blue))" />
                <Cell fill="rgb(var(--color-pink))" />
              </Pie>
            </PieChart>


            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs mt-2 justify-center">
              <div className="flex items-center gap-1">
                <span className="w-6 h-1 bg-purple rounded-full"></span> Courses
              </div>
              <div className="flex items-center gap-1">
                <span className="w-6 h-1 bg-blue rounded-full"></span> Exercises
              </div>
              <div className="flex items-center gap-1">
                <span className="w-6 h-1 bg-pink rounded-full"></span> Quizzes
              </div>
            </div>

          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-card p-4 rounded-2xl mb-4">
          <h2 className="text-lg font-bold mb-1">{t("Dashboard.ActivityF")}</h2>
          <p className="text-gray-500 text-xs mb-4">1st Feb Monday - 7th Feb Sunday</p>

          <div className="space-y-3">
            {dat.map((item, index) => (
              <NotificationItem
                key={index}
                title={item.title}
                date={item.date}
                day={item.day}
                time={item.time}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}