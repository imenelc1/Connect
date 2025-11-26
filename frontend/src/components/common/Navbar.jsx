import React, { useEffect, useState } from "react";
import "../../styles/index.css";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";

export default function Navbar() {
  const [userData, setUserData] = useState({
    nom: "",
    prenom: "",
    role: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);

      // Récupère l'objet utilisateur correct, quelle que soit la structure
      const userObj = parsed.user || parsed.utilisateur || parsed;

      setUserData({
        nom: userObj.nom || "",
        prenom: userObj.prenom || "",
        role: userObj.role || "",
      });
    }
  }, []);

  const initials = `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase();

  // Liens selon le rôle
  const studentLinks = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/all-courses", label: "Courses", icon: BookOpen },
    { href: "/exercises", label: "Exercises", icon: Clipboard },
    { href: "/quizzes", label: "Quizzes", icon: FileText },
    { href: "/ranking", label: "Ranking", icon: Award },
    { href: "/community", label: "Community", icon: MessageCircle },
  ];

  const teacherLinks = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/all-courses", label: "Courses", icon: BookOpen },
    { href: "/exercises", label: "Exercises", icon: Clipboard },
    { href: "/quizzes", label: "Quizzes", icon: FileText },
    { href: "/mystudents", label: "My Students", icon: Users },
    { href: "/mycommunity", label: "My Community", icon: MessageCircle },
  ];

  const links = userData.role === "enseignant" ? teacherLinks : studentLinks;

  return (
    <aside className={`
      fixed top-0 left-0 h-screen bg-white rounded-r-3xl shadow-2xl p-4 flex flex-col justify-between z-50
      transition-transform duration-300
      w-60
      
    `}>
    
      {/* HEADER — INITIALS + NOM */}
      <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-2xl shadow-sm">
        <div className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold text-base bg-primary">
          {initials}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-textc font-semibold text-sm capitalize">{userData.role}</span>
          <span className="text-grayc text-xs">{userData.nom} {userData.prenom}</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="mt-4 flex flex-col gap-1.5 font-medium">
        {links.map((item, i) => (
          <NavLink
            key={i}
            to={item.href}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all
              ${isActive
                ? "bg-primary border-primary text-white hover:bg-primary/90"
                : "bg-white border-surface text-primary hover:bg-grad-2"
              }
              `
            }
          >
            <item.icon size={19} strokeWidth={1.5} />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* SETTINGS + LOGOUT */}
      <div className="flex flex-col gap-1.5 mt-3 pb-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `
            flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors
            ${isActive
              ? "bg-primary border-primary text-white hover:bg-primary/90"
              : "bg-card border-surface text-primary hover:bg-grad-2"
            }
            `
          }
        >
          <Settings size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium">Settings</span>
        </NavLink>

        <NavLink
          to="/acceuil"
          className={({ isActive }) =>
            `
            flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors
            ${isActive
              ? "bg-grad-2 border-primary text-primary"
              : "bg-card border-surface text-red-500 hover:bg-red-100"
            }
            `
          }
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium">Log Out</span>
        </NavLink>
      </div>
    </aside>
  );
}