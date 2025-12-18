import React, { useState, useEffect } from "react";
import Navbar from "../components/common/NavBar";
import { useTranslation } from "react-i18next";
import { Eye, CheckCircle, XCircle, BookOpen } from "lucide-react";

export default function ValidationCourses() {
  const { t } = useTranslation("ValidationCourses");

  const [activeTab, setActiveTab] = useState("pending");
  const [courses, setCourses] = useState([]);
  const token = localStorage.getItem("admin_token");

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

  return (
    <div className="w-full min-h-screen flex bg-surface">
      {/* SIDEBAR */}
      <div className="hidden lg:block w-64 min-h-screen">
        <Navbar />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col p-4 md:p-8 lg:p-10 gap-8">

        {/* TITLE */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textc">
            {t("title")}
          </h1>
          <p className="text-grayc">{t("subtitle")}</p>
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto gap-3 bg-gray-100 p-2 rounded-full w-max max-w-full shadow-sm">
          {["pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 rounded-full text-sm font-medium transition
                ${
                  activeTab === tab
                    ? "bg-white shadow text-textc"
                    : "text-gray-500 hover:text-textc"
                }`}
            >
              {t(`tabs.${tab}`)}
            </button>
          ))}
        </div>

        {/* COURSES LIST */}
        <div className="flex flex-col gap-6">
          {courses.length === 0 ? (
            <p className="text-gray-500 italic">{t("empty")}</p>
          ) : (
            courses.map((course) => (
              <div
                key={course.id_cours}
                className="w-full bg-card border border-gray-200 rounded-3xl shadow-card 
                           p-4 md:p-6 flex flex-col sm:flex-row gap-4 md:gap-6"
              >
                {/* ICON */}
                <div className="bg-primary/10 rounded-2xl p-3 md:p-4 flex items-center justify-center sm:self-start">
                  <BookOpen className="text-primary" size={36} />
                </div>

                {/* CONTENT */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg md:text-xl font-semibold text-textc">
                      {course.titre_cour}
                    </h2>

                    <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">
                      {course.status}
                    </span>

                    <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                      {course.niveau_cour_label}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm md:text-base">
                    {course.description}
                  </p>

                  <p className="text-xs md:text-sm text-gray-500">
                    {t("by")}{" "}
                    <span className="font-medium">
                      {course.utilisateur_nom}
                    </span>
                  </p>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-full shadow hover:opacity-90"
                    >
                      <Eye size={16} /> {t("buttons.inspect")}
                    </button>

                    {activeTab === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(course.id_cours, "approved")
                          }
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary rounded-full hover:bg-primary/20"
                        >
                          <CheckCircle size={16} /> {t("buttons.approve")}
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(course.id_cours, "rejected")
                          }
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-400 rounded-full hover:bg-red-100"
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
      </div>
    </div>
  );
}
