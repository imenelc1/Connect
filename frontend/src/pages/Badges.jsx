import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react"; // Ajout d'icônes mobiles

import Navbar from "../components/common/Navbar";
import BadgeHeader from "../components/common/BadgeHeader";
import BadgeStats from "../components/common/BadgeStats";
import BadgeTabs from "../components/common/BadgeTabs";
import BadgeGrid from "../components/common/BadgeGrid";
import BadgeFooter from "../components/common/BadgeFooter";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle"; // Ajout
import { MdAutoAwesome } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import api from "../services/api"


// Function to choose an icon
import {
  FaMedal,
  FaLightbulb,
  FaChartLine,
  FaTrophy,
  FaStar,
  FaRocket,
  FaFire,
} from "react-icons/fa";

const getBadgeIcon = (title) => {
  switch (title) {
    case "Course Explorer":
      return <FaMedal />;
    case "Halfway There":
      return <FaChartLine />;
    case "Dedicated Learner":
      return <FaTrophy />;
    case "Marathon Coder":
      return <FaRocket />;
    case "First Steps":
      return <FaLightbulb />;
    case "Problem Solver":
      return <FaStar />;
    case "Perfectionist":
      return <FaStar />;
    case "Speed Demon":
      return <FaRocket />;
    case "7 Day Streak":
      return <FaFire />;
    case "Quiz Novice":
      return <FaLightbulb />;
    case "Quiz Whiz":
      return <FaStar />;
    case "Quiz Master":
      return <FaTrophy />;
    case "Curious Mind":
      return <FaLightbulb />;
    case "AI Learner":
      return <MdAutoAwesome />;
    case "All-Rounder":
      return <FaMedal />;
    case "Legendary Coder":
      return <FaTrophy />;
    case "Active Learner":
      return <FaFire />;
    case "Night Owl":
      return <FaStar />;
    case "Top Commentator":
      return <FaLightbulb />;
    default:
      return <FaRocket />;
  }
};

export default function Badges() {
  const [activeTab, setActiveTab] = useState("all");
  const { t, i18n } = useTranslation("courses");
  const { toggleDarkMode } = useContext(ThemeContext);

  // États pour la responsivité
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  // Récupération des données utilisateur
  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  const userRole = userData?.role ?? null;
  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";
  const streakPct = 60;
  const xpPct = 45;

  const studentId = userData?.id_utilisateur;


  const [userBadges, setUserBadges] = useState([]);
  const [badgeStats, setBadgeStats] = useState([]);
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await api.get("/badges/user-badges/");
        setUserBadges(res.data);
        console.log("Badges récupérés :", res.data);

      } catch (err) {
        console.error("Erreur récupération badges :", err);
      }
    };
    fetchBadges();
  }, []);






  const navigate = useNavigate();
  // Gestion de la responsivité
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  // Filtrage des badges selon la catégorie
  const filteredBadges = userBadges.filter((badge) => {
    if (activeTab === "all") return true;
    return badge.category === activeTab; // correspond exactement aux valeurs de l'API
  });


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/badges/user_stats/");

        const data = res.data;

        // Arrondir les pourcentages pour les barres
        const streakPct = Math.round(data.streak_pct);
        const xpPct = Math.round((data.total_xp / (data.max_xp || 1)) * 100); // éviter division par 0

        setBadgeStats({
          ...data,
          level: Math.min(data.level, 6),
          streak_pct: streakPct,
          xp_pct: xpPct,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);





  return (
    <>
      <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
        <Navbar />






        <main
          className={`
    flex-1 p-4 sm:p-6 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
    ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
    pt-12 ml-16 md:pt-10 /* Ajustement crucial pour mobile */
  `}
        >

          {/* BadgeHeader - maintenant visible sur mobile */}
          <BadgeHeader stats={badgeStats} />

          <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-full sm:max-w-5xl py-2 px-4 sm:px-6 bg-gradient-to-r from-primary/30 to-purple rounded-full mb-6 sm:mb-8">
            <span
              role="button"
              className="px-12 py-1 text-gray/10 font-semibold bg-card  rounded-full mb-2 sm:mb-0"

            >
              {t("Badges")}
            </span>
            <span
              role="button"
              className="px-12 py-1 text-gray/10 rounded-full font-semibold mb-2 sm:mb-0"
              onClick={() => navigate("/progress-student")}
            >
              {t("Progression")}
            </span>
          </div>

          <BadgeStats
            unlockedCount={badgeStats.unlocked_count}
            totalBadges={badgeStats.total_badges}
            streakDays={badgeStats.streak_days}
            totalXp={badgeStats.total_xp}
            progressPct={(badgeStats.unlocked_count / badgeStats.total_badges) * 100}
            streakPct={badgeStats.streak_pct}
            xpPct={badgeStats.xp_pct}
          />


          {/* Tabs */}
          <BadgeTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Badge grid */}
          <BadgeGrid badges={filteredBadges} getBadgeIcon={getBadgeIcon} />

          {/* Footer */}
          <BadgeFooter />
        </main>
      </div>
    </>
  );
}