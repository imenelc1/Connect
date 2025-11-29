import React from "react";
import LogoComponent from "./LogoComponent";
import Button from "./Button";
import HeaderLinks from "./HeaderLinks";
import { useTranslation } from "react-i18next";



export default function Header() {
  const { t } = useTranslation("acceuil");
  
  return (
    // Barre de navigation principale
    <nav className="flex items-center justify-between sm:px-6 lg:px-12 py-2 w-full">
      
      {/* Logo situé à gauche */}
      <LogoComponent className="ml-0 md:-ml-8" />

      {/* Liens du header + bouton Create Account */}
      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8">
        <HeaderLinks />

        {/* Bouton d’appel à l’action */}
        <Button text={t("acceuil.create_account")} variant="ca" />
      </div>
    </nav>
  );
}