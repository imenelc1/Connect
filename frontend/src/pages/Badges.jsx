import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react"; // Ajout d'icônes mobiles

import Navbar from "../components/common/NavBar";
import BadgeHeader from "../components/common/BadgeHeader";
import BadgeStats from "../components/common/BadgeStats";
import BadgeTabs from "../components/common/BadgeTabs";
import BadgeGrid from "../components/common/BadgeGrid";
import BadgeFooter from "../components/common/BadgeFooter";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle"; // Ajout
import { MdAutoAwesome } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// List of badges
const badges = [
  {
    title: "Course Explorer",
    desc: "Complete your first course",
    xp: "+50 XP",
    category: "progress",
    locked: false,
    variant: "purple",
  },
  {
    title: "Halfway There",
    desc: "Reach 50% completion in a course",
    xp: "+100 XP",
    category: "progress",
    locked: true,
  },
  {
    title: "Dedicated Learner",
    desc: "Finish 3 full courses",
    xp: "+150 XP",
    category: "success",
    locked: false,
  },
  {
    title: "Marathon Coder",
    desc: "Spend over 10 hours total studying courses",
    xp: "+200 XP",
    category: "success",
    locked: true,
  },
  {
    title: "First Steps",
    desc: "Complete your first exercise",
    xp: "+50 XP",
    category: "progress",
    locked: false,
  },
  {
    title: "Problem Solver",
    desc: "Solve 10 exercises successfully",
    xp: "+100 XP",
    category: "success",
    locked: false,
  },
  {
    title: "Perfectionist",
    desc: "Solve 25 exercises without errors",
    xp: "+150 XP",
    category: "success",
    locked: true,
  },
  {
    title: "Speed Demon",
    desc: "Solve 5 exercises in under an hour",
    xp: "+100 XP",
    category: "special",
    locked: true,
  },
  {
    title: "7 Day Streak",
    desc: "Solve exercises for 7 consecutive days",
    xp: "+200 XP",
    category: "special",
    locked: false,
  },
  {
    title: "Quiz Novice",
    desc: "Complete your first quiz",
    xp: "+50 XP",
    category: "progress",
    locked: false,
  },
  {
    title: "Quiz Whiz",
    desc: "Score 100% on a quiz",
    xp: "+100 XP",
    category: "success",
    locked: true,
  },
  {
    title: "Quiz Master",
    desc: "Finish 10 quizzes",
    xp: "+150 XP",
    category: "success",
    locked: true,
  },
  {
    title: "Curious Mind",
    desc: "Answer 50 total quiz questions",
    xp: "+100 XP",
    category: "progress",
    locked: true,
  },
  {
    title: "AI Learner",
    desc: "Use the AI explanation feature for the first time",
    xp: "+50 XP",
    category: "special",
    locked: false,
  },
  {
    title: "All-Rounder",
    desc: "Complete one course, one exercise, and one AI analysis",
    xp: "+150 XP",
    category: "special",
    locked: true,
  },
  {
    title: "Legendary Coder",
    desc: "Complete all courses, exercises, and quizzes",
    xp: "+300 XP",
    category: "success",
    locked: true,
  },
  {
    title: "Active Learner",
    desc: "Work on the platform 7 consecutive days",
    xp: "+200 XP",
    category: "special",
    locked: false,
  },
  {
    title: "Night Owl",
    desc: "Submit an exercise between midnight and 3 a.m.",
    xp: "+100 XP",
    category: "special",
    locked: true,
  },
];

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

  const filteredBadges =
    activeTab === "all"
      ? badges
      : badges.filter((b) => b.category === activeTab);

  const unlockedCount = 6;
  const totalBadges = badges.length;
  const progressPct = Math.round((unlockedCount / totalBadges) * 100);
  const streakPct = 60;
  const xpPct = 45;

  const studentId = userData?.id_utilisateur;
  
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
        <BadgeHeader />

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
             onClick={() => navigate(`/progress-student/${studentId}`)}
          >
            {t("Progression")}
          </span>
        </div>

        {/* Stats */}
        <BadgeStats
          unlockedCount={unlockedCount}
          totalBadges={totalBadges}
          progressPct={progressPct}
          streakPct={streakPct}
          xpPct={xpPct}
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