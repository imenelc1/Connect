import React, { useEffect, useState } from "react";
import "../../styles/index.css";
import { NavLink } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";

export default function SideNavbar({ links = [] }) {
  const [userData, setUserData] = useState({
    nom: "",
    prenom: "",
    role: "",
  });

  // Récupération depuis localStorage ou API
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      // Ici on s’adapte à ta structure backend
      setUserData({
        nom: parsed?.user?.nom || parsed?.utilisateur?.nom || "",
        prenom: parsed?.user?.prenom || parsed?.utilisateur?.prenom || "",
        role: parsed?.user?.role || parsed?.role || "",
      });
    }
  }, []);

  const userInitials = `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`;

  return (
    <aside className="w-64 h-screen bg-white shadow-2xl flex flex-col justify-between p-4 rounded-3xl font-medium">

      {/* Header utilisateur */}
      <div>
        <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl shadow-sm">
          <div className="w-12 h-12 flex items-center justify-center bg-primary text-surface rounded-full">
            {userInitials.toUpperCase()}
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-textc">{userData.role}</span>
            <span className="text-grayc">{`${userData.nom} ${userData.prenom}`}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex flex-col gap-2 font-semibold">
          {links.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
              className="flex items-start gap-3 px-4 py-3 rounded-xl transition-all shadow-sm text-primary"
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Sidebar */}
      <div className="flex flex-col gap-2 mt-4 rounded-xl bg-primary/10">
        <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all shadow-sm text-primary">
          <Settings size={18} className="text-primary" />
          <span className="font-semibold">Settings</span>
        </NavLink>
        <NavLink to="/logout" className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all shadow-sm text-primary">
          <LogOut size={18} className="text-primary" />
          <span className="font-semibold">Log Out</span>
        </NavLink>
      </div>
    </aside>
  );
}
