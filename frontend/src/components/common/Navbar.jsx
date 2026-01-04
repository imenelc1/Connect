import React, { useEffect, useState } from "react";
import "../../styles/index.css";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IconeLogoComponent from "./IconeLogoComponent";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

import {
  Settings,
  LogOut,
  Home,
  BookOpen,
  Users,
  Award,
  Clipboard,
  ClipboardList,
  Activity,
  FileQuestion,
  GraduationCap,
  MessageCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";

export default function Navbar() {
  const { t } = useTranslation("navbar");
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState({ nom: "", prenom: "", role: "" });
  const { logout } = useContext(AuthContext);
  

  useEffect(() => {
    let userObj = { nom: "", prenom: "", role: "" };

    try {
      const storedUser = localStorage.getItem("user");

      // Empêcher le crash si la valeur est "undefined" ou vide
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        const parsed = JSON.parse(storedUser);
        userObj = parsed.user || parsed.utilisateur || parsed;
      }
    } catch (err) {
      console.error("Erreur parsing user JSON:", err);
    }

    setUserData({
      nom: userObj.nom || "",
      prenom: userObj.prenom || "",
      role: userObj.role || "",
    });
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("sidebarChanged", { detail: collapsed }));
  }, [collapsed]);

  const studentLinks = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/dashboard-etu", label: t("dashboard"), icon: Activity },
    { href: "/all-courses", label: t("courses"), icon: BookOpen },
    { href: "/all-exercises", label: t("exercises"), icon: Clipboard },
    { href: "/all-quizzes", label: t("quizzes"), icon: FileText },
    { href: "/SubmittedExos", label: t("myExercises"), icon: ClipboardList },
    { href: "/badges", label: t("ranking"), icon: Award },
    { href: "/community", label: t("community"), icon: MessageCircle },
    { href: "/spaces", label: t("myspaces"), icon: LayoutGrid },
  ];

  const teacherLinks = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/dashboard-ens", label: t("dashboard"), icon: Activity },
    { href: "/all-courses", label: t("courses"), icon: BookOpen },
    { href: "/all-exercises", label: t("exercises"), icon: Clipboard },
    { href: "/all-quizzes", label: t("quizzes"), icon: FileText },
    { href: "/my-students", label: t("mystudents"), icon: Users },
    { href: "/community", label: t("mycommunity"), icon: MessageCircle },
    { href: "/spaces", label: t("myspaces"), icon: LayoutGrid },
  ];
  const adminLinks = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/Dashboard-admin", label: t("dashboard"), icon: Activity },
    { href: "/CourseManagement", label: t("courses"), icon: BookOpen },
    { href: "/ExerciseManagement", label: t("exercises"), icon: ClipboardList },
    { href: "/QuizManagement", label: t("quizzes"), icon: FileQuestion },
    { href: "/StudentsManagement", label: t("students"), icon: Users },
    { href: "/InstructorsManagement", label: t("instructors"), icon: GraduationCap },
    { href: "/SpacesManagement", label: t("spaces"), icon: LayoutGrid },
    { href: "/badgesManagement", label: t("badges"), icon: Award },
    { href: "/ForumManagement", label: t("forms"), icon: FileText },
  ];

  const links =
    userData.role === "admin"
      ? adminLinks
      : userData.role === "enseignant"
        ? teacherLinks
        : studentLinks;


  // 🔥 logique pour activer le bouton Courses dans toutes les pages liées aux cours
  const courseRoutes = [
    "/all-courses",
    "/CoursInfo",

  ];
  const exerciseRoutes = [
    "/all-exercises",
    "/new-exercise",
    "/exercise-preview",
    "/start-exerciseCode",
    "/ListeExercices",
    "/start-exercise"
  ];

  const quizRoutes = [
    "/all-quizzes",

  ];
  const classementRoutes = [
    "/progress-student",
    "/badges"

  ];
  const spacesRoutes = [
    "/spaces",
    "/CourseDetails"

  ];
  const mystudentsRoutes = [
    "/my-students",
    "/student-exercises",
    "/students",
  ];

  const isCourseRelated = courseRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (

   <aside
  className={`
    fixed
    h-screen bg-card rounded-3xl shadow-2xl p-3 flex flex-col
    top-0 left-0 z-50 transition-all duration-300
    w-16
    md:${collapsed ? "w-16" : "w-56"}
    overflow-y-auto overflow-x-visible pb-3
  `}
>

  {/* Toggle */}
  <button
    onClick={() => setCollapsed(!collapsed)}
    className={`
      hidden md:flex
      absolute top-4
      ${collapsed ? "right-[-12px]" : "right-[-16px]"}
      w-9 h-9 rounded-full bg-grad-1 text-white shadow-md
      flex items-center justify-center
      z-50 transition-all duration-300
    `}
  >
    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={18} />}
  </button>



      {/* Header */}
      <div className="flex items-center justify-center p-2 bg-card rounded-2xl shadow-sm -mt-1 mb-1">
        <IconeLogoComponent
          size={collapsed ? "w-8 h-8 ml-2 md:ml-0" : "w-8 h-10 ml-0 "}
          className="transition-all duration-300   "
        />

        {!collapsed && (
          <div className="hidden md:flex  flex flex-col leading-tight ml-2 -mt-1">
            <span className="text-textc font-semibold text-xs capitalize">
              {t(userData.role)}
            </span>

            <span className="text-grayc text-[11px]">
              {userData.nom} {userData.prenom}
            </span>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="mt-1 flex flex-col gap-1 font-medium pb-1 border-b border-surface/60">


        {links.map((item, i) => {
          let forceActive = false;

          if (item.href === "/all-courses" && courseRoutes.some(r => location.pathname.startsWith(r))) forceActive = true;
          if (item.href === "/all-exercises" && exerciseRoutes.some(r => location.pathname.startsWith(r))) forceActive = true;
          if (item.href === "/all-quizzes" && quizRoutes.some(r => location.pathname.startsWith(r))) forceActive = true;
          if (item.href === "/badges" && classementRoutes.some(r => location.pathname.startsWith(r))) forceActive = true;
          if (item.href === "/spaces" && spacesRoutes.some(r => location.pathname.startsWith(r))) forceActive = true;
          if (item.href === "/my-students" && mystudentsRoutes.some(r => location.pathname.startsWith(r))) forceActive = true;

          return (
            <NavLink
              key={i}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-xl text-sm transition-all ${isActive || forceActive
                  ? "bg-grad-1 border-primary text-white"
                  : "bg-card border-surface text-nav hover:bg-grad-2"
                }`
              }
            >
              <item.icon size={17} strokeWidth={1.5} />
              {!collapsed && (
                <span className="ml-2 hidden md:inline">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* SETTINGS + LOGOUT — collés en bas */}
      <div className="mt-auto flex flex-col gap-1 pt-1">

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${isActive ? "bg-grad-1 text-white" : "bg-card text-muted hover:bg-grad-2"
            }`
          }
        >
          <Settings size={17} strokeWidth={1.5} />
          {!collapsed && <span className="hidden md:inline">{t("settings")}</span>}
        </NavLink>

        <button
          onClick={() => { logout(); window.location.href = "/"; }}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red hover:bg-red/20 transition-colors"
        >
          <LogOut size={17} strokeWidth={1.5} />
          {!collapsed && <span className="hidden md:inline">{t("logout")}</span>}
        </button>

      </div>

    </aside>
  );
}