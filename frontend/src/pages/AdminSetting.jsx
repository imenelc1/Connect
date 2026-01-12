import React, { useContext, useState, useEffect } from "react";
import "../styles/index.css";
import Navbar from "../components/common/Navbar";
import NavSetting from "../components/common/navsetting";
import Button from "../components/common/Button";
import { Sun, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import toast, { Toaster } from "react-hot-toast";

export default function AdminSetting() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation("settingadmin");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState("preferences"); // Admin -> préférences par défaut

  // Responsivité + sidebar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  const handleLanguageChange = (e) => i18n.changeLanguage(e.target.value);

  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
                 {/* Sidebar */}
                 <div>
                   <Navbar />
                 </div>
           
                 {/* Main Content */}
                 <main className={`
                   flex-1 p-6 pt-10 space-y-5 transition-all duration-300
                   ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
                 `}>

        

        {/* -------- PREFERENCES (Theme + Langue) -------- */}
        {activeTab === "preferences" && (
          <div className="mt-6 sm:mt-10 p-4 sm:p-6 bg-grad-2 rounded-2xl sm:rounded-3xl shadow-md w-full overflow-hidden">
            {/* THEME */}
            <div className="mb-6 sm:mb-10">
              <h3 className="text-muted font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Sun size={18} className="sm:w-5 sm:h-5" />
                {t("AdminSettings.Theme")}
              </h3>

              <label className="flex items-center justify-between bg-white dark:bg-grad-1 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-2 sm:mb-3 shadow-sm cursor-pointer text-gray-800">
                <p className="font-medium text-sm sm:text-base">{t("AdminSettings.LightMode")}</p>
                <input
                  type="radio"
                  name="theme"
                  className="w-3 h-3 sm:w-4 sm:h-4 text-primary"
                  checked={!darkMode}
                  onChange={() => toggleDarkMode("light")}
                />
              </label>

              <label className="flex items-center justify-between bg-white dark:bg-grad-1 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm cursor-pointer text-gray-800">
                <p className="font-medium text-sm sm:text-base">{t("AdminSettings.DarkMode")}</p>
                <input
                  type="radio"
                  name="theme"
                  className="w-3 h-3 sm:w-4 sm:h-4 text-primary"
                  checked={darkMode}
                  onChange={() => toggleDarkMode("dark")}
                />
              </label>
            </div>

            {/* LANGUAGE */}
            <div>
              <h3 className="text-muted font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Globe size={18} className="sm:w-5 sm:h-5" />
                {t("AdminSettings.Language")}
              </h3>

              <select
                className="w-full bg-white dark:bg-grad-1 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm border border-gray-200 text-gray-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                value={i18n.language}
                onChange={handleLanguageChange}
              >
                <option value="fr">{t("AdminSettings.French")}</option>
                <option value="en">{t("AdminSettings.English")}</option>
              </select>
            </div>

            
          </div>
        )}
      </main>
    </div>
  );
}