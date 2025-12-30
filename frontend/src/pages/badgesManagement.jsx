import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import { Plus, Trash, SquarePen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import ContentSearchBar from "../components/common/ContentSearchBar";
import api from "../services/apiGenerale";

// Icônes pour les badges
import {
  FaMedal,
  FaLightbulb,
  FaChartLine,
  FaTrophy,
  FaStar,
  FaRocket,
  FaFire,
} from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";

// Fonction pour choisir l'icône selon le titre du badge
const getBadgeIcon = (title) => {
  switch (title) {
    case "Course Explorer": return <FaMedal />;
    case "Halfway There": return <FaChartLine />;
    case "Dedicated Learner": return <FaTrophy />;
    case "Marathon Coder": return <FaRocket />;
    case "First Steps": return <FaLightbulb />;
    case "Problem Solver": return <FaStar />;
    case "Perfectionist": return <FaStar />;
    case "Speed Demon": return <FaRocket />;
    case "7 Day Streak": return <FaFire />;
    case "Quiz Novice": return <FaLightbulb />;
    case "Quiz Whiz": return <FaStar />;
    case "Quiz Master": return <FaTrophy />;
    case "Curious Mind": return <FaLightbulb />;
    case "AI Learner": return <MdAutoAwesome />;
    case "All-Rounder": return <FaMedal />;
    case "Legendary Coder": return <FaTrophy />;
    case "Active Learner": return <FaFire />;
    case "Night Owl": return <FaStar />;
    default: return <FaRocket />;
  }
};

// Couleurs selon la catégorie du badge
const categoryColors = {
  common: "bg-muted/20 text-muted",
  rare: "bg-purple/20 text-purple",
  epic: "bg-pink/20 text-pink",
};

export default function BadgesManagement() {
  const { t } = useTranslation("BadgesManagement");
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  // États
  const [badges, setBadges] = useState([]);
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Récupération des badges depuis l'API Django
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await api.get("/badges/user-badges/");
        setBadges(res.data);
      } catch (err) {
        console.error("Erreur récupération badges :", err);
      }
    };
    fetchBadges();
  }, []);

  // Gestion du redimensionnement et sidebar
  useEffect(() => {
    const resizeHandler = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", resizeHandler);

    const sidebarHandler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", sidebarHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("sidebarChanged", sidebarHandler);
    };
  }, []);

  const getGridCols = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  // Filtrage selon la recherche
  const filteredBadges = badges.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <Navbar />

      {/* Main */}
      <main
        className={`
          flex-1 p-6 pt-10 space-y-5 transition-all duration-300
          ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
        `}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">
              {t("BadgesManagement.BadgesManagement")}
            </h1>
            <p className="text-gray">{t("BadgesManagement.badgesp")}</p>
          </div>

          <div className="flex gap-4 items-center">
            <Button
              text={
                <span className="flex items-center gap-2">
                  <Plus size={18} />
                  {t("BadgesManagement.buttonCreate")}
                </span>
              }
              variant="primary"
              className="!w-auto px-6 py-2 rounded-xl"
              onClick={() => setCreateModal(true)}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 sm:mb-10 w-full max-w-md">
          <ContentSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full"
          />
        </div>

        {/* Badges Grid */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))`,
          }}
        >
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`
                rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between
                ${badge.locked ? "opacity-50" : "bg-white"}
              `}
            >
              {/* Icon + Category */}
              <div className="flex justify-between mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary text-white text-2xl">
                  {getBadgeIcon(badge.title)}
                </div>
<<<<<<< HEAD

                <span
                  className={`h-6 px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(
                    b.type
                  )}`}
                >
                  {t(b.type)}
                </span>

=======
                <span
                  className={`h-6 px-3 py-1 text-xs font-medium rounded-full ${
                    categoryColors[badge.category] || "bg-gray-200 text-gray-600"
                  }`}
                >
                  {badge.category}
                </span>
>>>>>>> main
              </div>

              {/* Content */}
              <h2 className="font-semibold text-lg">{badge.title}</h2>
              <p className="text-sm text-grayc/85">{badge.desc}</p>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-2">
                <p className="text-sm text-gray">{badge.xp}</p>
                <div className="flex gap-3 text-gray">
                  <button className="text-muted hover:opacity-80">
                    <SquarePen size={20} />
                  </button>
                  <button className="text-red hover:opacity-80">
                    <Trash size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
