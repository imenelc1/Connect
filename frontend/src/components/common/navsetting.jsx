import React, { useContext } from "react";
import "../../styles/index.css";
import { useTranslation } from "react-i18next";
import ThemeContext from "../../context/ThemeContext";

export default function NavSetting({ active = "profile", onChange }) {
  const { t } = useTranslation("setting");
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const tabs = [
    { id: "profile", label: t("Setting.Profile") },
    { id: "preferences", label: t("Setting.Preferences") },
    { id: "account", label: t("Setting.Account") },
  ];

  return (
    <div className="w-full mt-4 sm:mt-6">
      <ul className="flex overflow-x-auto sm:overflow-x-visible bg-grad-1 rounded-full shadow-sm p-1 
                     gap-3 sm:gap-4 md:gap-12 h-10 sm:h-12 justify-center w-full max-w-[700px] sm:max-w-[750px] mx-auto">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full cursor-pointer font-medium transition 
                        ${active === tab.id ? "bg-white shadow-md" : " hover:bg-grad-3 "}`}
            onClick={() => onChange(tab.id)}
          >
            {active === tab.id ? (
              <span className="bg-clip-text text-transparent bg-grad-1 text-sm sm:text-base md:text-lg">
                {tab.label}
              </span>
            ) : (
              <span className="text-white text-sm sm:text-base md:text-lg">{tab.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}