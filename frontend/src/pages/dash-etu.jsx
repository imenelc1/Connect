import React, { useEffect, useState, useRef, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import Cards from "../components/common/Cards-Dash";
import { TrendingDown, CircleCheckBig, Clock3, Book, Bell } from "lucide-react";
import Mascotte from "../components/common/Mascotte";
import LearningCurve from "../components/common/LearningCurveEtu";
import NotificationItem from "../components/common/AcivityFeed";
import ProgressBar from "../components/ui/ProgressBar";
import UserCircle from "../components/common/UserCircle";
import ThemeContext from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ContentSearchBar from "../components/common/ContentSearchBar";
import api from "../services/api";
import progressionService from "../services/progressionService";

export default function Dashboardetu() {
  const navigate = useNavigate();
  const { toggleDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation("Dashboard");

  const storedUser = localStorage.getItem("user");
  const userData = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const [user, setUser] = useState(null);
  const initials = user ? `${user.nom?.[0] || ""}${user.prenom?.[0] || ""}`.toUpperCase() : "";

  const [activeCoursesCount, setActiveCoursesCount] = useState(0);
  const [averageTime, setAverageTime] = useState(0); // en secondes
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
      useEffect(() => {
         const handler = (e) => setSidebarCollapsed(e.detail);
         window.addEventListener("sidebarChanged", handler);
         return () => window.removeEventListener("sidebarChanged", handler);
       }, []);

  const sessionStartRef = useRef(Date.now());

  const dat = [
    { title: "Emma Wilson completed Python Basics Quiz", date: "2nd Feb", day: "Tuesday", time: "11:30 - 12:30" },
    { title: "James Lee submitted Loop Assignment", date: "3rd Feb", day: "Wednesday", time: "11:30 - 12:30" },
    { title: "Sophia Chen asked question in Arrays & Strings", date: "5th Feb", day: "Tuesday", time: "11:30 - 12:30" },
    { title: "Michael Brown completed Data Structures Course", date: "8th Feb", day: "Monday", time: "11:30 - 12:30" },
  ];

  useEffect(() => {
    // Charger profil
    api.get("profile/")
      .then(res => setUser(res.data))
      .catch(err => console.error("Erreur profil :", err));

    // Nombre de cours actifs
    progressionService.getActiveCoursesCount()
      .then(setActiveCoursesCount)
      .catch(err => console.error(err));

    // Average time
    progressionService.getAverageTime()
      .then(avgSecs => setAverageTime(avgSecs))
      .catch(err => console.error(err));

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
    const mins = Math.ceil(secs / 60);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  const [globalProgress, setGlobalProgress] = useState(0);

useEffect(() => {
  const fetchGlobalProgress = async () => {
    try {
      const value = await progressionService.getGlobalProgress();
      console.log("Global progress:", value);
      setGlobalProgress(value);
    } catch (err) {
      console.error("Erreur global progress:", err);
    }
  };

  fetchGlobalProgress();
}, []);



  return (
    <div className=" min-h-screen bg-primary/10">
  <div className="flex-shrink-0 w-14 sm:w-16 md:w-48">
        <Navbar />
      </div>

     <div className={`
        p-6 pt-10 min-h-screen text-textc transition-all duration-300 space-y-5
        ${sidebarCollapsed ? "ml-20" : "ml-64"}
      `}>
        {/* Header */}
        <header className="flex justify-between items-center gap-3">
          <ContentSearchBar className="mt-3" />
          <div className="flex items-center gap-3 mt-3">
            <div className="bg-bg w-7 h-7 rounded-full flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div className="w-7 h-7 flex items-center justify-center">
              <UserCircle
                size={20}
                initials={initials}
                onToggleTheme={toggleDarkMode}
                onChangeLang={(lang) => i18n.changeLanguage(lang)}
              />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Cards text={t("Dashboard.AverageS")} value="2.5" icon={<TrendingDown />} bg="bg-grad-2" />
          <Cards text={t("Dashboard.Success")} value="80%" icon={<CircleCheckBig />} bg="bg-grad-3" />
          <Cards text={t("Dashboard.AverageT")} value={formatTime(averageTime)} icon={<Book />} bg="bg-grad-4" />
          <Cards text={t("Dashboard.ActiveC")} value={activeCoursesCount} icon={<Clock3 />} bg="bg-grad-2" />
        </div>

        {/* Progress bar */}
        <div className="bg-card text-primary p-6 sm:p-10 rounded-2xl w-full shadow-lg">
          <ProgressBar value={globalProgress} title={t("Dashboard.GlobalP")} />
        </div>

        {/* Learning curve */}
        <div className="p-4 w-full text-blue" style={{ height: "350px" }}>
          <LearningCurve title={t("Dashboard.Progress")} />
        </div>

        {/* Activity feed */}
        <div className="bg-card p-4 rounded-2xl w-full">
          <h2 className="text-xl font-bold text-gray mb-2">{t("Dashboard.ActivityF")}</h2>
          <p className="text-grisclair text-xs mb-2">1st Feb Monday - 7th Feb Sunday</p>
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
