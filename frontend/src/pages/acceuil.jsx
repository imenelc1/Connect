import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

import HeroSection from "../components/layout/HeroSection";
import Body from "../components/layout/Body";
import Footer from "../components/layout/Footer";

export default function Acceuil() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirection automatique selon rôle
      if (user.role === "student") navigate("/dashboard-etu");
      else if (user.role === "instructor") navigate("/dashboard-ens");
      else if (user.role === "admin") navigate("/dashboard-admin");
    }
  }, [user, navigate]);

  return (
    <div>
      <HeroSection />
      <Body />
      <Footer />
    </div>
  );
}
