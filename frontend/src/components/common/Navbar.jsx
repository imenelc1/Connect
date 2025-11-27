import React, { useEffect, useState } from "react";
import "../../styles/index.css";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IconeLogoComponent from "../common/IconeLogoComponent";
import {
  Settings,
  LogOut,
  Home,
  BookOpen,
  Users,
  Award,
  Clipboard,
  Activity,
  MessageCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";

export default function Navbar() {
  const { t } = useTranslation("navbar");

  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState({ nom: "", prenom: "", role: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const userObj = parsed.user || parsed.utilisateur || parsed;

      setUserData({
        nom: userObj.nom || "",
        prenom: userObj.prenom || "",
        role: userObj.role || "",
      });
    }
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("sidebarChanged", { detail: collapsed }));
  }, [collapsed]);

  const studentLinks = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/dashboard", label: t("dashboard"), icon: Activity },
    { href: "/all-courses", label: t("courses"), icon: BookOpen },
    { href: "/exercises", label: t("exercises"), icon: Clipboard },
    { href: "/quizzes", label: t("quizzes"), icon: FileText },
    { href: "/ranking", label: t("ranking"), icon: Award },
    { href: "/community", label: t("community"), icon: MessageCircle },
    { href: "/myspaces", label: t("myspaces"), icon: LayoutGrid },
  ];

  const teacherLinks = [
    { href: "/home", label: t("home"), icon: Home },
    { href: "/dashboard", label: t("dashboard"), icon: Activity },
    { href: "/all-courses", label: t("courses"), icon: BookOpen },
    { href: "/exercises", label: t("exercises"), icon: Clipboard },
    { href: "/quizzes", label: t("quizzes"), icon: FileText },
    { href: "/mystudents", label: t("mystudents"), icon: Users },
    { href: "/mycommunity", label: t("mycommunity"), icon: MessageCircle },
    { href: "/myspaces", label: t("myspaces"), icon: LayoutGrid },
  ];

  const links = userData.role === "enseignant" ? teacherLinks : studentLinks;

  return (
    <aside
      className={`h-screen bg-card rounded-3xl shadow-2xl p-3 flex flex-col justify-between
      fixed top-0 left-0 transition-all duration-300 z-50
      ${collapsed ? "w-16" : "w-56"}`}
    >

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute top-4 
          ${collapsed ? "right-0 translate-x-1/2" : "-right-4"}
          ${collapsed ? "w-7 h-7" : "w-9 h-9"}
          rounded-full bg-grad-1 text-white shadow-md flex items-center justify-center
          z-50 transition-all duration-300`}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={18} />}
      </button>

      {/* HEADER */}
      <div className="flex items-center justify-center p-2 bg-card rounded-2xl shadow-sm -mt-1 mb-1">
        <IconeLogoComponent
          size={collapsed ? "w-8 h-8 -ml-2" : "w-8 h-10"}
          className="transition-all duration-300 -ml-2"
        />

        {!collapsed && (
          <div className="flex flex-col leading-tight ml-2 -mt-1">
            <span className="text-textc font-semibold text-xs capitalize">
              {userData.role}
            </span>
            <span className="text-grayc text-[11px]">
              {userData.nom} {userData.prenom}
            </span>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="mt-2 flex flex-col gap-1 font-medium pb-3 border-b border-surface/60">
        {links.map((item, i) => (
          <NavLink
            key={i}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-xl text-sm transition-all ${
                isActive
                  ? "bg-grad-1 border-primary text-white"
                  : "bg-card border-surface text-nav hover:bg-grad-2"
              }`
            }
          >
            <item.icon size={17} strokeWidth={1.5} />
            {!collapsed && <span className="ml-2">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* SETTINGS + LOGOUT */}
      <div className="flex flex-col gap-1 mt-2 mb-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
              isActive
                ? "bg-grad-1 text-white"
                : "bg-card text-muted hover:bg-grad-2"
            }`
          }
        >
          <Settings size={17} strokeWidth={1.5} />
          {!collapsed && <span>{t("settings")}</span>}
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl  text-sm transition-colors ${
              isActive
                ? "bg-grad-1 text-white"
                : "bg-card text-red-500 hover:bg-red-100"
            }`
          }
        >
          <LogOut size={17} strokeWidth={1.5} />
          {!collapsed && <span>{t("logout")}</span>}
        </NavLink>
      </div>
    </aside>
  );
}
