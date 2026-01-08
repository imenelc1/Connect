import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Search,
  TrendingDown,
  CircleCheckBig,
  Clock3,
  Book,
  CirclePlus,
  FolderPlus,
  Activity
} from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import dayjs from "dayjs";

// Composants
import Navbar from "../components/common/Navbar";
import Cards from "../components/common/Cards-Dash";
import Input from "../components/common/Input";
import LearningCurve from "../components/common/LearningCurve";
import NotificationItem from "../components/common/AcivityFeed";
import Mascotte from "../components/common/Mascotte";
import UserCircle from "../components/common/UserCircle";
import NotificationBell from "../components/common/NotificationBell";

// Contextes & Services
import ThemeContext from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import api from "../services/api";
import progressionService from "../services/progressionService";

export default function Dashboardens() {
  // Hooks
  const { t, i18n } = useTranslation("Dashboard");
  const navigate = useNavigate();
  const { toggleDarkMode } = useContext(ThemeContext);
  const { notifications, loading: loadingNotifications, fetchNotifications } = useNotifications();


  // États de l'interface
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // États utilisateur
  const [user, setUser] = useState(null);
  const initials = user ? `${user.nom?.[0] || ""}${user.prenom?.[0] || ""}`.toUpperCase() : "";

  // États des statistiques
  const [activeCourses, setActiveCourses] = useState(0);
  const [dailyTime, setDailyTime] = useState(0);
  const [avgSubmission, setAvgSubmission] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [contentCounts, setContentCounts] = useState({
    courses_count: 0,
    exercises_count: 0,
    quizzes_count: 0
  });

  useEffect(() => {
    fetchNotifications(); // récupère les notifications dès le montage
  }, [fetchNotifications]);
  // Gestion de la responsivité
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  // Chargement des données principales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Profil utilisateur
        const profileRes = await api.get("profile/");
        setUser(profileRes.data);

        // Nombre de cours créés
        const coursesCount = await progressionService.getActiveCoursesCountProf();
        setActiveCourses(coursesCount);

      } catch (err) {
        console.error(t("Dashboard.LoadDataError"), err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Taux de soumission moyen des étudiants
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
        const totalSubmitted = students.reduce((sum, s) => sum + s.submitted_count, 0);

        const avg = total_exercises && studentCount
          ? ((totalSubmitted / (total_exercises * studentCount)) * 100).toFixed(2)
          : 0;

        setAvgSubmission(avg);
      } catch (err) {
        console.error(t("Dashboard.FetchSubmissionsError"), err);
      }
    };

    fetchSubmissions();
  }, []);

  // Taux de réussite des quiz
  useEffect(() => {
    const fetchSuccessRate = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/quiz_success_rate_prof/",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSuccessRate(res.data.success_rate);
      } catch (err) {
        console.error(t("Dashboard.FetchSuccessRateError"), err);
      }
    };

    fetchSuccessRate();
  }, []);

  // Temps journalier
  useEffect(() => {
    if (!user) return;

    const fetchDailyTime = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/daily-time/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDailyTime(res.data.total_seconds || 0);
      } catch (err) {
        console.error(t("Dashboard.FetchDailyTimeError"), err);
      }
    };

    fetchDailyTime();
    const interval = setInterval(fetchDailyTime, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // Compteurs de contenu (pour le graphique)
  useEffect(() => {
    const fetchContentCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/professor_content_counts_global",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setContentCounts(res.data);
      } catch (err) {
        console.error(t("Dashboard.FetchContentCountsError"), err);
      }
    };

    fetchContentCounts();
  }, []);

  const formatNotificationsForFeed = () => {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return [];
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


  // Formater le temps en format lisible
  const formatTimeStyled = (secs) => {
    if (!secs || secs < 60) {
      return <span className="text-blue font-bold">1 min</span>;
    }

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

  // Données pour le graphique circulaire
  const chartData = [
    { name: "Courses", value: contentCounts.courses_count },
    { name: "Exercises", value: contentCounts.exercises_count },
    { name: "Quizzes", value: contentCounts.quizzes_count }
  ];

  const formattedNotifications = formatNotificationsForFeed();

  // Écran de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary/10">
        <div className="text-muted">{t("Dashboard.Loading")}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>
      {/* Contenu principal */}

      <main className={`
            flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
            ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
          `}>

        {/* En-tête */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">


          {/* Notifications et profil — alignés à droite */}
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => i18n.changeLanguage(lang)}
              size={isMobile ? "sm" : "md"}
            />
          </div>

        </header>

        {/* Bannière de bienvenue */}
        <div className="relative bg-grad-1 text-white p-4 rounded-2xl shadow-md 
                       flex flex-col lg:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="flex flex-col w-full lg:w-auto">
            <span className="absolute top-2 left-3 text-xs opacity-90">
              {dayjs().format("MMMM DD, YYYY")}
            </span>
            <h1 className="text-lg sm:text-xl font-bold mt-4 sm:mt-0">
              {t("Dashboard.Welcome")} {user ? `${user.nom} ${user.prenom}` : "..."}
            </h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1">
              {t("Dashboard.Alwaysp")}
            </p>
          </div>
          <Mascotte className="w-28 sm:w-36 lg:w-44 mt-4 lg:mt-0" />
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 text-textc">
          <Cards
            text={t("Dashboard.AverageS")}
            value={`${Math.round(avgSubmission)}%`}
            icon={<TrendingDown size={isMobile ? 16 : 18} />}
            bg="bg-grad-2"
            isMobile={isMobile}
          />
          <Cards
            text={t("Dashboard.Success")}
            value={`${Math.round(successRate)}%`}
            icon={<CircleCheckBig size={isMobile ? 16 : 18} />}
            bg="bg-grad-3"
            isMobile={isMobile}
          />
          <Cards
            text={t("Dashboard.AverageT")}
            value={formatTimeStyled(dailyTime)}
            icon={<Book size={isMobile ? 16 : 18} />}
            bg="bg-grad-4"
            isMobile={isMobile}
          />
          <Cards
            text={t("Dashboard.ActiveC")}
            value={activeCourses}
            icon={<Clock3 size={isMobile ? 16 : 18} />}
            bg="bg-grad-2"
            isMobile={isMobile}
          />
        </div>

        {/* Courbe d'apprentissage */}
        <div className="p-3 w-full" style={{ height: "360px" }}>
          <LearningCurve />
        </div>

        {/* Actions rapides + Graphique */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Actions rapides */}
          <div>
            <h2 className="text-lg sm:text-xl text-muted font-bold mb-4 sm:mb-6">
              {t("Dashboard.Quick")}
            </h2>
            <div className="bg-grad-1 text-white rounded-2xl sm:rounded-3xl shadow-lg">
              <div className="flex flex-col">
                <button
                  onClick={() => navigate("/CoursInfo")}
                  className="w-full pl-4 sm:pl-6 flex items-center gap-3 sm:gap-4 
                           py-4 sm:py-6 px-3 bg-white/30 hover:bg-white/10 
                           rounded-tl-2xl sm:rounded-tl-full transition"
                >
                  <CirclePlus size={isMobile ? 18 : 22} />
                  <span className="ml-8 sm:ml-16 text-base sm:text-xl font-bold">
                    {t("Dashboard.CreateC")}
                  </span>
                </button>

                <button
                  onClick={() => navigate("/spaces")}
                  className="w-full pl-4 sm:pl-6 flex items-center gap-3 sm:gap-4 
                           py-4 sm:py-6 px-3 bg-white/30 hover:bg-white/10 transition"
                >
                  <Activity size={isMobile ? 18 : 22} />
                  <span className="ml-8 sm:ml-16 text-base sm:text-xl font-bold">
                    {t("Dashboard.Space")}
                  </span>
                </button>

                <button
                  onClick={() => navigate("/new-exercise")}
                  className="w-full pl-4 sm:pl-6 flex items-center gap-3 sm:gap-4 
                           py-4 sm:py-6 px-3 bg-white/30 hover:bg-white/10 transition"
                >
                  <FolderPlus size={isMobile ? 18 : 22} />
                  <span className="ml-8 sm:ml-16 text-base sm:text-xl font-bold">
                    {t("Dashboard.publish")}
                  </span>
                </button>

                <button
                  onClick={() => navigate("/my-students")}
                  className="w-full pl-4 sm:pl-6 flex items-center gap-3 sm:gap-4 
                           py-4 sm:py-6 px-3 bg-white/30 hover:bg-white/10 
                           rounded-bl-2xl sm:rounded-bl-full transition"
                >
                  <TrendingDown size={isMobile ? 18 : 22} />
                  <span className="ml-8 sm:ml-16 text-base sm:text-xl font-bold">
                    {t("Dashboard.mystudents")}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Graphique circulaire */}
          <div className="rounded-2xl shadow-md flex flex-col items-center justify-center bg-card p-4">
            <PieChart width={isMobile ? 180 : 240} height={isMobile ? 180 : 220}>
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

            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs mt-4 justify-center">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-purple rounded-full"></span>
                <span>{t("Dashboard.Courses")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue rounded-full"></span>
                <span>{t("Dashboard.Exercises")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-pink rounded-full"></span>
                <span>{t("Dashboard.quizzes")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fil d'activité */}
        <div className="bg-card p-4 rounded-2xl mb-4">
          <h2 className="text-lg font-bold mb-1">{t("Dashboard.ActivityF")}</h2>
          <p className="text-gray-500 text-xs mb-4">
            {dayjs().startOf('week').format("DD MMM")} - {dayjs().endOf('week').format("DD MMM")}
          </p>

          <div className="space-y-3">
            {loadingNotifications ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-gray-500">{t("Dashboard.LoadingNotifications")}</p>
              </div>
            ) : formattedNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-gray-500">{t("Dashboard.NoNotifications")}</p>
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
      </main>
    </div>
  );
}