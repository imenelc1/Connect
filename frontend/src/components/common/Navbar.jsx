
import React from "react";
import "../../styles/index.css";
import { NavLink } from "react-router-dom";

// Icônes Lucide (modernes et légères)
import { Settings, LogOut } from "lucide-react";

export default function SideNavbar({
  links = [],
  userName = "",
  userRole = "",
  userInitials = "",
}) {
  return (
    <aside className="w-64 h-screen bg-white shadow-2xl flex flex-col justify-between p-4 rounded-3xl font-medium">

      {/* -----------------------------------------------------------------
          HEADER UTILISATEUR (nom + rôle + initiales)
      ------------------------------------------------------------------ */}
      <div>
        <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl shadow-sm">
          {/* Rond avec les initiales */}
          <div className="w-12 h-12 flex items-center justify-center bg-primary text-surface rounded-full">
            {userInitials}
          </div>

          {/* Nom + rôle */}
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-textc">{userRole}</span>
            <span className="text-grayc">{userName}</span>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            NAVIGATION PRINCIPALE (générée dynamiquement)
        ------------------------------------------------------------------ */}
        <nav className="mt-8 flex flex-col gap-2 font-semibold">
          {links.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
              className="flex items-start gap-3 px-4 py-3 rounded-xl transition-all shadow-sm text-primary"
            >
              {/* Icône dynamique */}
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* -----------------------------------------------------------------
         BAS DE LA SIDEBAR (Settings + Logout)
      ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-2 mt-4 rounded-xl bg-primary/10">

        {/* ⚙️ Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all shadow-sm ${
              isActive
                ? "bg-gradient-to-r from-primary to-primarylight text-white"
                : "text-primary hover:bg-gradient-to-r hover:from-primary/20"
            }`
          }
        >
          <Settings size={18} className="text-primary" />
          <span className="font-semibold">Settings</span>
        </NavLink>

        {/* 🚪 Logout */}
        <NavLink
          to="/logout"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all shadow-sm ${
              isActive
                ? "bg-gradient-to-r from-primary to-primarylight text-white"
                : "text-primary hover:bg-gradient-to-r hover:from-primary/20"
            }`
          }
        >
          <LogOut size={18} className="text-primary" />
          <span className="font-semibold">Log Out</span>
        </NavLink>

      </div>
    </aside>
  );
}
