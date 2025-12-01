import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

import Navbar from "../components/common/Navbar";
import BadgeHeader from "../components/common/BadgeHeader";
import BadgeStats from "../components/common/BadgeStats";
import BadgeTabs from "../components/common/BadgeTabs";
import BadgeGrid from "../components/common/BadgeGrid";
import BadgeFooter from "../components/common/BadgeFooter";
import ThemeContext from "../context/ThemeContext";

import { MdAutoAwesome } from "react-icons/md";

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
import BadgeButton from "../components/common/BadgeButton";

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

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  const { toggleDarkMode } = useContext(ThemeContext);

  const storedUser = localStorage.getItem("user");

  // Si storedUser est null, vide ou "undefined", on renvoie null
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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  return (
    <>
      <div className="bg-surface">
        <Navbar />

        <BadgeHeader />

        <main
          className={`
        p-6 pt-10 min-h-screen text-textc transition-all duration-300
        ${sidebarCollapsed ? "ml-20" : "ml-64"}
      `}
        >
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
