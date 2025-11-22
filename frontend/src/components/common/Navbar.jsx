<<<<<<< HEAD
import React from "react";
import Logo from "./logo";
import Button from "./Button";
import NavLinks from "./NavLinks";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <Logo />
      <div className="flex items-center space-x-8">
    <NavLinks />
    <Button text="Create Account" variant="ca" />

  </div>
     
    </nav>
  );
}
=======


import { Home, LayoutDashboard, BookOpen, FileCheck2, Users, Settings, LogOut } from "lucide-react";
import React from "react";
 import "../../styles/index.css";
  import { NavLink } from "react-router-dom";  //il va gerer les routes (links quoi)


export default function SideNavbar({ links = [], userName = "", userRole = "", userInitials = "" }) {
  //user role cest soit enseignant ou etudiant
  return (
    <aside className="w-64 h-screen bg-white shadow-2xl flex flex-col justify-between p-4 rounded-3xl font-medium">
      {/* Top User */}
      <div>
        <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl shadow-sm">
          <div className="w-12 h-12 flex items-center justify-center bg-primary text-surface  rounded-full">{userInitials}</div>
          <div className="flex flex-col text-sm">
            { <span className="font-semibold text-textc">{userRole}</span>  } {/*ca et userinitiales va etre recuperer automatiquement de la bdd je les ai ajouté juste pour le test*/}
            <span className="text-grayc">{userName}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 flex flex-col gap-2 font-semibold">
          {links.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
           className={ //({ isActive }) => je l'ai mis en commentaire car on doit d'abord definir les routes pour que ca marche
                `flex items-start gap-3 px-4 py-3 rounded-xl transition-all shadow-sm text-primary `
                //  {isActive ? "bg-primary text-white" : "hover:bg-primary"
                //     }
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-2 mt-4 rounded-xl bg-primary/10 ">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all shadow-sm
             ${isActive
                ? "bg-gradient-to-r from-primary to-primarylight text-white"
                : "text-primary hover:bg-gradient-to-r hover:from-primary/20 "}`
          }
        >
          <Settings size={18} className="text-primary" />
          <span className="font-semibold">Settings</span>
        </NavLink>


<NavLink
  to="/logout"
  className={({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all shadow-sm
     ${isActive
        ? "bg-gradient-to-r from-primary to-primarylight text-white"
        : "text-primary hover:bg-gradient-to-r hover:from-primary/20 "}`
  }
>
  <LogOut size={18} className="text-primary" />
  <span className="font-semibold">Log Out</span>
</NavLink>
      </div>
    </aside>
  );
}


>>>>>>> meriemi
