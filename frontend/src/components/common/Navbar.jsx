import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Settings, LogOut, Home, BookOpen, Users, Clipboard, Activity, MessageCircle, FileText, Menu, X
} from "lucide-react";
import "../../styles/index.css";

export default function Navbar() {
  const [userData, setUserData] = useState({ nom: "Smith", prenom: "Andrew", role: "Product Designer" });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const u = parsed.user || parsed.utilisateur || parsed;
        setUserData({
          nom: u.nom || "Smith",
          prenom: u.prenom || "Andrew",
          role: u.role || "Product Designer",
        });
      } catch {}
    }
  }, []);

  const initials = `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase();

  const links = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/all-courses", label: "Courses", icon: BookOpen },
    { href: "/exercises", label: "Exercises", icon: Clipboard },
    { href: "/quizzes", label: "Quizzes", icon: FileText },
    { href: "/mystudents", label: "My students", icon: Users },
    { href: "/mycommunity", label: "My community", icon: MessageCircle },
  ];

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="font-bold text-lg">Menu</div>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE SIDEBAR */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-transform transform bg-black/30
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={() => setMobileOpen(false)}
      >
        <aside
          className="w-60 h-full bg-white p-4 flex flex-col justify-between shadow-2xl"
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        >
          {/* Header profil */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl shadow-sm">
            <div className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold text-base"
                 style={{ background: "var(--color-primary)" }}>
              {initials}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm" style={{ color: "var(--color-text-main)" }}>{userData.role}</span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {userData.nom} {userData.prenom}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex flex-col gap-1.5 font-medium">
            {links.map((item, i) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={i}
                  to={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "#e5e7eb",
                    color: "var(--color-text-main)",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={19} strokeWidth={1.5} />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Settings / Logout */}
          <div className="flex flex-col gap-1.5 mt-3 pb-3">
            <NavLink to="/settings"
              className="flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors"
              style={{
                background: "var(--color-surface)",
                borderColor: "#e5e7eb",
                color: "var(--color-text-main)",
              }}
              onClick={() => setMobileOpen(false)}
            >
              <Settings size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium">Settings</span>
            </NavLink>
            <NavLink to="/logout"
              className="flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors"
              style={{
                background: "var(--color-surface)",
                borderColor: "#e5e7eb",
                color: "#ef4444",
              }}
              onClick={() => setMobileOpen(false)}
            >
              <LogOut size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium">Log Out</span>
            </NavLink>
          </div>
        </aside>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside
        className="hidden lg:flex w-60 h-[calc(100vh-2rem)] rounded-3xl shadow-2xl p-4 flex-col justify-between fixed top-8 left-0"
        style={{ background: "var(--color-surface)" }}
      >
        {/* Header profil */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-2xl shadow-sm">
          <div className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold text-base"
               style={{ background: "var(--color-primary)" }}>
            {initials}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm" style={{ color: "var(--color-text-main)" }}>{userData.role}</span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {userData.nom} {userData.prenom}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col gap-1.5 font-medium">
          {links.map((item, i) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={i}
                to={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "#e5e7eb",
                  color: "var(--color-text-main)",
                }}
              >
                <Icon size={19} strokeWidth={1.5} />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Settings / Logout */}
        <div className="flex flex-col gap-1.5 mt-3 pb-3">
          <NavLink to="/settings"
            className="flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors"
            style={{
              background: "var(--color-surface)",
              borderColor: "#e5e7eb",
              color: "var(--color-text-main)",
            }}
          >
            <Settings size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Settings</span>
          </NavLink>
          <NavLink to="/logout"
            className="flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors"
            style={{
              background: "var(--color-surface)",
              borderColor: "#e5e7eb",
              color: "#ef4444",
            }}
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Log Out</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
