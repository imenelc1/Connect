import React from "react";
import "../../styles/index.css";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


export default function ButtonCA() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <button  onClick={() => navigate("/choice")} className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-3
                 px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-2 md:py-2.5 lg:py-3
                 text-xs sm:text-sm md:text-base lg:text-lg
                 bg-primary text-white rounded-full shadow-md hover:opacity-90 transition"
      >
      <span>{t("acceuil.Bcreate")}</span>
      <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
    </button>
  );
}
