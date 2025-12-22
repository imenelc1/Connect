import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import { Search, Trash, SquarePen, Award, Plus } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import ContentSearchBar from "../components/common/ContentSearchBar";

export default function BadgesManagement() {
  const { t, i18n } = useTranslation("BadgesManagement");
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  /* ================= COLORS ================= */

  const gradientMap = {
    common: "bg-grad-4",
    rare: "bg-grad-2",
    epic: "bg-grad-3",
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "rare":
        return "bg-surface text-primary";
      case "epic":
        return "bg-purple/20 text-purple";
      case "common":
        return "bg-muted/20 text-muted";
      default:
        return "bg-gray-100 text-gray";
    }
  };

  /* ================= DATA ================= */

  const badges = [
    {
      title: t("BadgesManagement.FirstSteps"),
      description: t("BadgesManagement.Completefist"),
      earnedBy: 856,
      type: "common",
      color: "bg-primary",
    },
    {
      title: t("BadgesManagement.codemaster"),
      description: `${t("complete")} 50 ${t("exercises")}`,
      earnedBy: 234,
      type: "rare",
      color: "bg-purple",
    },
    {
      title: t("BadgesManagement.Algorithmexpert"),
      description: t("BadgesManagement.Masteralgo"),
      earnedBy: 98,
      type: "epic",
      color: "bg-pink",
    },
    {
      title: t("BadgesManagement.QuickLeaner"),
      description: t("BadgesManagement.completecourse"),
      earnedBy: 345,
      type: "common",
      color: "bg-primary",
    },
    {
      title: t("BadgesManagement.healpingHAND"),
      description: `${t("BadgesManagement.Help")} 20 ${t("BadgesManagement.studentsforum")}`,
      earnedBy: 156,
      type: "rare",
      color: "bg-purple",
    },
    {
      title: t("BadgesManagement.PerfectScore"),
      description: `${t("BadgesManagement.get")} 100% ${t("BadgesManagement.on")} 10 ${t("BadgesManagement.quizzes")}`,
      earnedBy: 187,
      type: "epic",
      color: "bg-pink",
    },
  ];

  /* ================= STATES ================= */

  // Ajoutez cet état manquant
  const [createModal, setCreateModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    const resizeHandler = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", resizeHandler);

    // Écouteur pour les changements de sidebar
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("sidebarChanged", handler);
    };
  }, []);

  const getGridCols = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  /* ================= RENDER ================= */

  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface  gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      {/* Main */}
      <main className={`
  flex-1 p-6 pt-10 space-y-5 transition-all duration-300
  ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
`}>
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
          {badges.map((b, index) => (
            <div
              key={index}
              className={`
                ${gradientMap[b.type]}
               
                rounded-2xl
                p-6
                shadow-sm
                hover:shadow-md
                transition
                flex
                flex-col
                justify-between
              `}
            >
              {/* Icon */}
              <div className="flex justify-between mb-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${b.color}`}
                >
                  <Award className="w-7 h-7 text-white" />
                </div>

                <span
                  className={`h-6 px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(
                    b.type
                  )}`}
                >
                  {t(b.type)}
                </span>

              </div>

              {/* Content */}
              <h2 className="font-semibold text-lg">{b.title}</h2>
              <p className="text-sm text-grayc/85">{b.description}</p>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-2">
                <p className="text-sm text-gray">
                  {t("BadgesManagement.earned")}{" "}
                  <span className="font-medium">{b.earnedBy}</span>{" "}
                  {t("BadgesManagement.students")}
                </p>

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