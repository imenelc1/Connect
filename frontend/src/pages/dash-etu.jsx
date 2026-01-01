import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  TrendingDown, 
  CircleCheckBig, 
  Clock3, 
  Book, 
  Search 
} from "lucide-react";
import dayjs from "dayjs";

// Composants
import Navbar from "../components/common/Navbar";
import Cards from "../components/common/Cards-Dash";
import Mascotte from "../components/common/Mascotte";
import LearningCurve from "../components/common/LearningCurveEtu";
import NotificationItem from "../components/common/AcivityFeed";
import ProgressBar from "../components/ui/ProgressBar";
import UserCircle from "../components/common/UserCircle";
import Input from "../components/common/Input";
import NotificationBell from "../components/common/NotificationBell";

// Contextes & Services
import ThemeContext from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import api from "../services/api";
import progressionService from "../services/progressionService";

export default function Dashboardetu() {
  // Hooks
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("Dashboard");
  const { toggleDarkMode } = useContext(ThemeContext);
  const { notifications, loading: loadingNotifications } = useNotifications();

  // États de l'interface
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);

  // États utilisateur
  const [user, setUser] = useState(null);
  const initials = user ? `${user.nom?.[0] || ""}${user.prenom?.[0] || ""}`.toUpperCase() : "";

  // États des statistiques
  const [activeCoursesCount, setActiveCoursesCount] = useState(0);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [submittedExercises, setSubmittedExercises] = useState(0);
  const [totalExercises, setTotalExercises] = useState(0);
  const [dailyTime, setDailyTime] = useState(0);
  const [successRate, setSuccessRate] = useState(0);

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

  // Chargement des données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Profil utilisateur
        const profileRes = await api.get("profile/");
        setUser(profileRes.data);

        // Cours actifs
        const coursesCount = await progressionService.getActiveCoursesCount();
        setActiveCoursesCount(coursesCount);
        
        // Progression globale
        const progress = await progressionService.getGlobalProgress();
        setGlobalProgress(progress);

        // Taux de réussite
        const rate = await progressionService.getSuccessRate();
        setSuccessRate(rate);

      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
        console.error("Erreur fetching daily time:", err);
      }
    };

    fetchDailyTime();
    const interval = setInterval(fetchDailyTime, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Données des exercices
  useEffect(() => {
    if (!user) return;

    const fetchExercisesData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://127.0.0.1:8000/api/dashboard/student-total-tentatives/${user.id_utilisateur}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSubmittedExercises(res.data.total_submitted_attempts || 0);
        setTotalExercises(res.data.total_exercises || 0);
      } catch (err) {
        console.error("Erreur fetching exercises:", err);
      }
    };

    fetchExercisesData();
  }, [user]);

  // Formater le temps en format lisible
  const formatTimeStyled = (secs) => {
    if (!secs || secs < 60) {
      return <span className="text-blue font-bold">{secs}s</span>;
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

  // Formater les notifications pour l'affichage
  const formatNotificationsForFeed = () => {
    if (!notifications || notifications.length === 0) return [];
    
    return notifications.slice(0, 4).map(notif => {
      const dateObj = notif.date_envoie ? dayjs(notif.date_envoie) : dayjs();
      
      return {
        title: notif.message_notif || "Notification",
        date: dateObj.format("DD/MM/YYYY"),
        day: dateObj.format("dddd"),
        time: dateObj.format("HH:mm")
      };
    });
  };

  const formattedNotifications = formatNotificationsForFeed();

  // Écran de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary/10">
        <div className="text-muted">{t("Dashboard.Loading") || "Chargement..."}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <Navbar />

      {/* Contenu principal */}
      <main className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 
        min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
        
        {/* En-tête */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          {/* Barre de recherche */}
          <form className="w-full sm:flex-1 max-w-full lg:max-w-sm order-2 sm:order-1">
            <Input
              placeholder={t("Dashboard.Search")}
              icon={<Search size={isMobile ? 14 : 16} />}
              className="w-full"
            />
          </form>

          {/* Notifications et profil */}
          <div className="flex items-center gap-3 order-1 sm:order-2 self-end sm:self-auto">
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
            value={`${submittedExercises}/${totalExercises}`} 
            icon={<TrendingDown size={isMobile ? 16 : 18} />} 
            bg="bg-grad-2"
            isMobile={isMobile}
          />
          <Cards 
            text={t("Dashboard.Success")} 
            value={`${successRate}%`} 
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
            value={activeCoursesCount} 
            icon={<Clock3 size={isMobile ? 16 : 18} />} 
            bg="bg-grad-2"
            isMobile={isMobile}
          />
        </div>

        {/* Barre de progression globale */}
        <div className="bg-card text-primary p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl w-full shadow-lg">
          <ProgressBar 
            value={globalProgress} 
            title={t("Dashboard.GlobalP")}
            className="text-sm sm:text-base"
          />
        </div>

        {/* Courbe d'apprentissage */}
        <div className="p-3 w-full" style={{ height: "360px" }}>
          <LearningCurve title={t("Dashboard.Progress")} />
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
                <p className="text-sm text-gray-500">Chargement des notifications...</p>
              </div>
            ) : formattedNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-gray-500">Aucune notification disponible.</p>
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