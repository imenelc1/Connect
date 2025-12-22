import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/Navbar";
import { useTranslation } from "react-i18next";
import { Eye, CheckCircle, XCircle, BookOpen } from "lucide-react";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";

export default function ValidationCourses() {
  const { t, i18n } = useTranslation("ValidationCourses");
  const { toggleDarkMode } = useContext(ThemeContext);

  // États pour la responsivité
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [activeTab, setActiveTab] = useState("pending");
  const [courses, setCourses] = useState([]);
  const token = localStorage.getItem("admin_token");

  /* ================= EFFET RESPONSIVITÉ ================= */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Gestion de la sidebar
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    fetchCourses(activeTab);
  }, [activeTab]);

  const fetchCourses = async (status) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/courses/admin/courses/?status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erreur récupération cours");

      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (courseId, status) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/courses/admin/${courseId}/status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error("Erreur mise à jour statut");

      // retirer le cours de la liste après validation/refus
      setCourses((prev) => prev.filter((c) => c.id_cours !== courseId));
    } catch (err) {
      console.error(err);
    }
  };
  const gradientMap = {
    Débutant: "bg-primary text-white",
    Intermédiaire: "bg-pink text-white",
    Avancé: "bg-purple  text-white",
  };

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">
              {t("title")}
            </h1>
            <p className="text-gray">{t("subtitle")}</p>
          </div>

          
        </div>

        {/* Tabs */}
        <div  className="flex overflow-x-auto gap-2 bg-primary/50 p-2 font-semibold rounded-full w-max max-w-full shadow-sm mb-4 text-sm">
          {["pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 rounded-full text-sm font-medium transition text-white whitespace-nowrap
                ${activeTab === tab
                  ? "text-white bg-primary shadow-md"
                  : "text-primary/70 "
                }`}
            >
              {t(`tabs.${tab}`)}
            </button>
          ))}
        </div>

        {/* Courses List */}
        <div className="flex flex-col gap-6">
          {courses.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 italic">{t("empty")}</p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id_cours}
                className="w-full bg-grad-2  rounded-2xl shadow-sm 
                           p-6 flex flex-col sm:flex-row gap-4 md:gap-6 hover:shadow-md transition"
              >
                {/* Icon */}
                <div className="bg-muted/10 rounded-xl p-4 flex items-center justify-center sm:self-start">
                  <BookOpen className="text-muted" size={32} />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg md:text-xl font-semibold text-muted">
                      {course.titre_cour}
                    </h2>

                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${course.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : course.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {course.status}
                    </span>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${gradientMap[course.niveau_cour_label] || "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {course.niveau_cour_label}
                    </span>
                  </div>

                  <p className="text-grayc text-sm md:text-base">
                    {course.description}
                  </p>

                  <p className="text-xs md:text-sm text-gray-300">
                    {t("by")}{" "}
                    <span className="font-medium">
                      {course.utilisateur_nom}
                    </span>
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:opacity-90 transition">
                      <Eye size={16} /> {t("buttons.inspect")}
                    </button>

                    {activeTab === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(course.id_cours, "approved")}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-muted/10 text-muted border border-primary rounded-full hover:bg-primary/20 transition"
                        >
                          <CheckCircle size={16} /> {t("buttons.approve")}
                        </button>

                        <button
                          onClick={() => updateStatus(course.id_cours, "rejected")}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-400 rounded-full hover:bg-red-100 transition"
                        >
                          <XCircle size={16} /> {t("buttons.reject")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}