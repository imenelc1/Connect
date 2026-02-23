import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; 
import AuthContext from "../context/AuthContext"; // context de l'authentification

//les composants personalisés utilisés dans l'interface
import HeroSection from "../components/layout/HeroSection";
import Body from "../components/layout/Body";
import Footer from "../components/layout/Footer";

export default function Acceuil() {
  const { user } = useContext(AuthContext); //recuperer l'utilisateur connecté
  const navigate = useNavigate(); //fonction de navigation redirection

  useEffect(() => {
    if (user) {
      // Redirection automatique selon rôle si l'utilisateur est connecté
      if (user.role === "student") navigate("/dashboard-etu");
      else if (user.role === "instructor") navigate("/dashboard-ens");
      else if (user.role === "admin") navigate("/dashboard-admin");
    }
  }, [user, navigate]);

  return (
    <div>
      {/* composant principale tout en haut de la page */}
      <HeroSection />

      {/* Body de la page */}
      <Body />

      {/* footer de la page */}
      <Footer />
    </div>
  );
}
