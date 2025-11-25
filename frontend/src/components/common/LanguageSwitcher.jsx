import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 border rounded text-sm bg-gray-100 hover:bg-gray-200"
    >
      {i18n.language === "fr" ? "EN" : "FR"}
    </button>
  );
}
