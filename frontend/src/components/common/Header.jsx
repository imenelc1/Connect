import React, { useContext } from "react";
import { NavLink } from "react-router-dom";  // <-- OBLIGATOIRE
import AuthContext from "../../context/AuthContext.jsx";
import LogoComponent from "./LogoComponent.jsx";
import HeaderLinks from "./HeaderLinks.jsx";
import Button from "./Button.jsx";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
   const { t } = useTranslation("acceuil");

  return (
    <nav className="flex items-center justify-between sm:px-6 lg:px-12 py-2 w-full">

      <LogoComponent className="ml-0 md:-ml-8" />

      <div className="flex items-center space-x-4">

        <HeaderLinks />

       

        {!user ? (
          <Button text={t("acceuil.createAccount")} variant="ca" />



        ) : (
          <button onClick={logout} className="text-red font-medium">
            Logout
          </button>
        )}

      </div>

    </nav>
  );
}
