// Import de React
import React from "react";

// Import des sections principales de la page d’accueil
import HeroSection from "../components/layout/HeroSection";
import Footer from "../components/layout/Footer";
import Body from "../components/layout/Body";




export default function Acceuil() {

  // Composant principal de la page d'accueil
  return (
    <div className="overflow-x-hidden">
      {/* Section héro : bannière principale */}
      <HeroSection />

      {/* Corps de la page */}
      <Body />

      {/* Pied de page */}
      <Footer />
    
    

    </div>
  );
}
