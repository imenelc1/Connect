import React from "react";
import "../../styles/index.css";
import { FiArrowRight, FiSend } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

export default function Button({
  text,
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const navigate = useNavigate();

  // Styles communs
  const base = "w-full flex items-center justify-center gap-2 py-2 rounded-full font-medium transition";

  // Variants
  const variants = {
    primary: `${base} bg-sky-500 text-white hover:bg-sky-600`,

    ca: `${base} flex items-center space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-3
                 px-2 sm:px-3 md:px-7 lg:px-10
                 text-xs sm:text-sm lg:text-lg
                 bg-primary text-white rounded-full shadow-md hover:opacity-90 transition`,


    send: `${base} text-white`,
    choice: `${base} shadow-md rounded-3xl font-bold font-poppins 
           bg-gradient-to-r from-[#458fc2] to-[#2d6980]
           text-lg sm:text-xl md:text-2xl hover:opacity-90 text-white
           flex w-36 sm:w-48 md:w-56 items-center justify-center gap-3 px-10 py-4`,
    heroPrimary: `${base} bg-[var(--color-primary)] text-white rounded-xl font-medium shadow hover:opacity-90 flex items-center gap-2 px-12 py-2`,
  
  heroOutline: `${base} border border-[var(--color-primary)] text-[var(--color-primary)] bg-white rounded-xl font-medium hover:bg-[var(--color-bg)] px-12 py-2 transition`,
  };

  // Icons automatiques
  const icons = {
    ca: <FiArrowRight size={18} />,
    google: <FcGoogle size={20} />,
    send: <FiSend size={18} />,
  };

  // Action automatique du variant CA
  const autoClick =
    variant === "ca"
      ? () => navigate("/choice")
      : onClick;

  return (
    <button
      type={type}
      onClick={autoClick}
      className={`${variants[variant] || base} ${className}`}
      style={variant === "send" ? { backgroundColor: "#4F9DDE" } : {}}
    >
      {/* Icône automatique s’il existe */}
      {icons[variant] && icons[variant]}

      {/* Texte du bouton */}
      {text || children}
    </button>
  );
}
