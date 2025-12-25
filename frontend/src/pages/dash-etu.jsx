import React, { useEffect, useState, useRef, useContext } from "react";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import Cards from "../components/common/Cards-Dash";
import { TrendingDown, CircleCheckBig, Clock3, Book, Bell, Search } from "lucide-react";
import Mascotte from "../components/common/Mascotte";
import LearningCurve from "../components/common/LearningCurveEtu";
import NotificationItem from "../components/common/AcivityFeed";
import ProgressBar from "../components/ui/ProgressBar";
import UserCircle from "../components/common/UserCircle";
import Input from "../components/common/Input";
import ThemeContext from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ContentSearchBar from "../components/common/ContentSearchBar";
import api from "../services/api";
import progressionService from "../services/progressionService";
import NotificationBell from "../components/common/NotificationBell";

export default function Dashboardetu() {
  const navigate = useNavigate();
  const { toggleDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation("Dashboard");

  // États pour la responsivité
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem("user");
  const userData = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const [user, setUser] = useState(null);
  const initials = user ? `${user.nom?.[0] || ""}${user.prenom?.[0] || ""}`.toUpperCase() : "";

  const [activeCoursesCount, setActiveCoursesCount] = useState(0);
  const [averageTime, setAverageTime] = useState(0); // en secondes
  const [globalProgress, setGlobalProgress] = useState(0);

  const sessionStartRef = useRef(Date.now());

  const dat = [
    { title: "Emma Wilson completed Python Basics Quiz", date: "2nd Feb", day: "Tuesday", time: "11:30 - 12:30" },
    { title: "James Lee submitted Loop Assignment", date: "3rd Feb", day: "Wednesday", time: "11:30 - 12:30" },
    { title: "Sophia Chen asked question in Arrays & Strings", date: "5th Feb", day: "Tuesday", time: "11:30 - 12:30" },
    { title: "Michael Brown completed Data Structures Course", date: "8th Feb", day: "Monday", time: "11:30 - 12:30" },
  ];

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger profil
        const profileRes = await api.get("profile/");
        setUser(profileRes.data);

        // Nombre de cours actifs
        const coursesCount = await progressionService.getActiveCoursesCount();
        setActiveCoursesCount(coursesCount);

        // Average time
        const avgTime = await progressionService.getAverageTime();
        setAverageTime(avgTime);

        // Global progress
        const progress = await progressionService.getGlobalProgress();
        console.log("Global progress:", progress);
        setGlobalProgress(progress);

      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Fonction pour envoyer la session à la fermeture
    const sendSession = (duration) => {
      if (duration > 0) {
        progressionService.addSession(duration).catch(err => console.error(err));
      }
    };

    const handleBeforeUnload = () => {
      const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000); // secondes
      sendSession(duration);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const formatTime = (secs) => {
    if (!secs || secs === 0) return "0min";
    const mins = Math.ceil(secs / 60);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary/10">
        <div className="text-muted">{t("Global.Loading") || "Chargement..."}</div>
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
            text={t("Dashboard.AverageS")} 
            value="2.5" 
            icon={<TrendingDown size={isMobile ? 16 : 18} />} 
            bg="bg-grad-2"
            isMobile={isMobile}
            
          />
          <Cards 
            text={t("Dashboard.Success")} 
            value="80%" 
            icon={<CircleCheckBig size={isMobile ? 16 : 18} />} 
            bg="bg-grad-3"
            isMobile={isMobile}
          />
          <Cards 
            text={t("Dashboard.AverageT")} 
            value={formatTime(averageTime)} 
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

        {/* Progress bar */}
        <div className="bg-card text-primary p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl w-full shadow-lg">
          <ProgressBar 
            value={globalProgress} 
            title={t("Dashboard.GlobalP")}
            className="text-sm sm:text-base"
          />
        </div>

        {/* Learning curve */}
<div className="p-3 w-full" style={{ height: "360px" }}>
          <LearningCurve title={t("Dashboard.Progress")} />
        </div>

        {/* Activity feed */}
        <div className="bg-card p-4 rounded-2xl w-full">
          <h2 className="text-lg sm:text-xl font-bold text-gray mb-2">{t("Dashboard.ActivityF")}</h2>
          <p className="text-grisclair text-xs mb-4">1st Feb Monday - 7th Feb Sunday</p>
          
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