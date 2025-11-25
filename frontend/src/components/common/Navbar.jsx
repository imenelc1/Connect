import React, { useEffect, useState } from "react";
import "../../styles/index.css";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
} from "lucide-react";

export default function Navbar() {
 const { t } = useTranslation("navbar"); // <-- namespace navbar


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

  const initials = `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase();

  const studentLinks = [
    { href: "/home", label: t("home"), icon: Home },
    { href: "/dashboard", label: t("dashboard"), icon: Activity },
    { href: "/all-courses", label: t("courses"), icon: BookOpen },
    { href: "/exercises", label: t("exercises"), icon: Clipboard },
    { href: "/quizzes", label: t("quizzes"), icon: FileText },
    { href: "/ranking", label: t("ranking"), icon: Award },
    { href: "/community", label: t("community"), icon: MessageCircle },
  ];

  const teacherLinks = [
    { href: "/home", label: t("home"), icon: Home },
    { href: "/dashboard", label: t("dashboard"), icon: Activity },
    { href: "/all-courses", label: t("courses"), icon: BookOpen },
    { href: "/exercises", label: t("exercises"), icon: Clipboard },
    { href: "/quizzes", label: t("quizzes"), icon: FileText },
    { href: "/mystudents", label: t("mystudents"), icon: Users },
    { href: "/mycommunity", label: t("mycommunity"), icon: MessageCircle },
  ];

  const links = userData.role === "enseignant" ? teacherLinks : studentLinks;

  return (
    <aside
      className={`
        h-screen bg-white rounded-3xl shadow-2xl p-4 flex flex-col justify-between
        fixed top-0 left-0 transition-all duration-300 z-50
        ${collapsed ? "w-20" : "w-60"}
        md:translate-x-0
        ${collapsed ? "translate-x-0" : "max-md:-translate-x-full"}
      `}
    >
      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          absolute top-6
          ${collapsed ? "right-0 translate-x-1/2" : "-right-5"}
          ${collapsed ? "w-8 h-8" : "w-10 h-10"}
          rounded-full bg-primary text-white
          shadow-lg flex items-center justify-center
          z-50 transition-all duration-300
        `}
      >
        {collapsed ? (
          <ChevronRight size={18} strokeWidth={2} />
        ) : (
          <ChevronLeft size={20} strokeWidth={2} />
        )}
      </button>

      {/* HEADER */}
      <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-2xl shadow-sm">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0">
          {initials}
        </div>

        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-textc font-semibold text-sm capitalize">{userData.role}</span>
            <span className="text-grayc text-xs">{userData.nom} {userData.prenom}</span>
          </div>
        )}
      </div>
 
      {/* NAVIGATION */}
      <nav className="mt-4 flex flex-col gap-1.5 font-medium">
        {links.map((item, i) => (
          <NavLink
            key={i}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 rounded-xl border transition-all
              ${isActive
                ? "bg-primary border-primary text-white"
                : "bg-white border-surface text-primary hover:bg-grad-2"
              }`
            }
          >
            <item.icon size={19} strokeWidth={1.5} />
            {!collapsed && <span className="ml-3 text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* SETTINGS + LOGOUT */}
      <div className="flex flex-col gap-1.5 mt-3 pb-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors
            ${isActive
              ? "bg-primary border-primary text-white"
              : "bg-card border-surface text-primary hover:bg-grad-2"}`
          }
        >
          <Settings size={18} strokeWidth={1.5} />
          {!collapsed && <span className="text-sm font-medium">{t("settings")}</span>}
        </NavLink>

        <NavLink
          to="/acceuil"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors
            ${isActive
              ? "bg-grad-2 border-primary text-primary"
              : "bg-card border-surface text-red-500 hover:bg-red-100"}`
          }
        >
          <LogOut size={18} strokeWidth={1.5} />
          {!collapsed && <span className="text-sm font-medium">{t("logout")}</span>}
        </NavLink>
      </div>
    </aside>
  );
}
