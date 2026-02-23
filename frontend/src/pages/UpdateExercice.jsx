import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";

import { Globe, FileText, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeButton from "../components/common/ThemeButton";
import ThemeContext from "../context/ThemeContext";
import Select from "../components/common/Select";
import Input from "../components/common/Input";
import Topbar from "../components/common/TopBar";
import UserCircle from "../components/common/UserCircle";
import ModernDropdown from "../components/common/ModernDropdown";
import { getCurrentUserId } from "../hooks/useAuth";
import api from "../services/courseService"; // Make sure your API helper is here
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function UpdateExercice() {
  const [activeStep, setActiveStep] = useState(1);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation("newExercise");
  const { toggleDarkMode } = useContext(ThemeContext);

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  // Form state
  const { id: coursId } = useParams();
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [courseVisibility, setCourseVisibility] = useState("public"); // default
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const token = localStorage.getItem("token");

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (!coursId) return;

    const fetchCourse = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await api.get(`exercices/${coursId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setTitle(data.titre_exo);
        setStatement(data.enonce);
        setLevel(data.niveau_exo);
        setSelectedCourseId(data.cours);
        setCategory(data.categorie);
        setCourseVisibility(data.visibilite_exo_label);



      } catch (err) {
        console.error(t("errors.loadExercise"), err.response?.data || err);
      }
    };

    fetchCourse();
  }, [coursId]);


  const [courses, setCourses] = useState([]);
  useEffect(() => {
    fetch("${process.env.REACT_APP_API_URL}/api/courses/api/cours")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((c) => ({
          id: c.id_cours,
          title: c.titre_cour,

          isMine: c.utilisateur === currentUserId, //NEWDED GHR ISMINE //
        }));
        setCourses(formatted);
      })
      .catch((err) => console.error(t("errors.loadCourses"), err));
  }, []);




  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""
    }`.toUpperCase();

  const exerciseSteps = [
    { label: t("exercises.info"), icon: FileText },
    { label: t("exercises.preview"), icon: Activity },
  ];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  // Save step 1
  const handleSaveStep1 = async (coursId) => {
    const token = localStorage.getItem("token");
    const currentUserId = getCurrentUserId();

    if (!token || !currentUserId) {
      alert(t("errors.notAuthenticated"));
      return null;
    }



    try {
      const res = await api.put(
        `exercices/${coursId}/`,
        {
          titre_exo: title,
          enonce: statement,
          niveau_exo: level,
          utilisateur: currentUserId,
          categorie: category,           // obligatoire
          cours: selectedCourseId,       // obligatoire, ID du cours
          visibilite_exo: courseVisibility === "private" ? false : true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("messages.exerciseUpdated"));

      const exoId = res.data.id_exercice;
      navigate("/all-exercises");
      return exoId;
    } catch (err) {
      console.error(t("errors.updateExercise"), err.response?.data || err.message);
      alert(t("errors.updateExercise"));

      return null;
    }
  };



  return (
    <div className="w-full min-h-screen  bg-surface">
      {/* SIDEBAR */}

      <div className="flex-shrink-0 w-14 sm:w-16 md:w-48">
        <Navbar />
      </div>

      {/* MAIN CONTENT */}
      <div className={`
        p-6 pt-10 min-h-screen text-textc transition-all duration-300 space-y-5
        ${sidebarCollapsed ? "ml-20" : "ml-64"}
      `}>
        <div className="flex justify-end">
          <UserCircle
            initials={initials}
            onToggleTheme={toggleDarkMode}
            onChangeLang={(lang) => i18n.changeLanguage(lang)}
          />
        </div>

        <Topbar
          steps={exerciseSteps}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          className="flex justify-between"
        />


        {/* FORM */}
        {activeStep === 1 && (
          <div className="w-full">
            {/* TITLE */}
            <label className="block text-textc font-semibold mb-2">
              {t("form.title_label")}
            </label>
            <Input
              type="text"
              name="title"
              placeholder={t("form.title_placeholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-full border border-grayc px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary mb-6 bg-secondary/10"
            />

            {/* STATEMENT */}
            <label className="block text-textc font-semibold mb-2">
              {t("form.statement_label")}
            </label>
            <textarea
              name="statement"
              placeholder={t("form.statement_placeholder")}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={6}
              className="w-full rounded-3xl border border-grayc px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary mb-10 resize-none text-black bg-secondary/10"
            />

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
              {/* CATEGORY */}
              <div className="flex flex-col">
                <label className="block text-textc font-semibold mb-2">
                  {t("form.category_label")}
                </label>
                <ModernDropdown
                  value={category}
                  onChange={setCategory}
                  placeholder={t("select.placeholder")}
                  options={[
                    { value: "code", label: t("select.code") },
                    { value: "question_cours", label: t("select.question_cours") },
                  ]}
                />
              </div>

              {/* LEVEL */}
              <div className="flex flex-col">
                <label className="block text-textc font-semibold mb-2">
                  {t("form.level_label")}
                </label>
                <ModernDropdown
                  value={level}
                  onChange={setLevel}
                  placeholder={t("select.placeholder")}
                  options={[
                    { value: "debutant", label: t("select.beginner") },
                    { value: "intermediaire", label: t("select.intermediate") },
                    { value: "avance", label: t("select.advanced") },
                  ]}
                />

              </div>
              <div className="flex flex-col ">
                <label className="font-medium mb-2">{t("exercises.visibility")}</label>
                <ModernDropdown
                  value={courseVisibility}
                  onChange={setCourseVisibility}
                  placeholder={t("select.placeholder")}
                  options={[
                    { value: "public", label: t("select.public") },
                    { value: "private", label: t("select.private") },
                  ]}
                />
              </div>


              {/* COURS */}
              <div className="flex flex-col">
                <label className="block text-textc font-semibold mb-2">
                  {t("form.cours")}
                </label>
                <ModernDropdown
                  value={selectedCourseId}
                  onChange={setSelectedCourseId}
                  placeholder={t("select.placeholder")}
                  options={[
                    ...courses
                      .filter((c) => c.isMine)
                      .map((c) => ({ value: c.id, label: c.title })),
                  ]}
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between items-center mt-6">
              <button
                className="px-6 py-2 bg-surface border border-primary text-textc rounded-xl shadow"
                onClick={() => navigate("/all-exercises")}
              >
                {t("buttons.cancel")}
              </button>

              <button
                className="px-6 py-2 bg-primary text-white rounded-xl shadow hover:bg-grad-1"
                onClick={() => setActiveStep(2)}
              >
                {t("buttons.save_next")}
              </button>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="w-full flex flex-col items-center gap-10">
            {/* ---------- RÉSUMÉ INFOS GÉNÉRALES ---------- */}
            <div className="w-full max-w-4xl bg-grad-3 border text-nav rounded-3xl shadow-sm p-8">

              <h3 className="text-lg font-bold text-nav mb-4">
                {t("course.summary_title")}
              </h3>

              <div className="space-y-3 text-nav text-sm">
                <p>
                  <strong>{t("course.title")} :</strong> {title}
                </p>
                <p>
                  <strong>{t("course.course_topic")} :</strong> {statement}
                </p>
                <p>
                  <strong>{t("course.level")} :</strong> {t(`preview.${level}`)}

                </p>
                <p>
                  <strong>{t("course.courseVisibility")} :</strong> {courseVisibility}
                </p>
                <p>
                  <strong>{t("course.course_selected")} :</strong> {
                    courses.find(c => c.id === selectedCourseId)?.title || "-"
                  }
                </p>
              </div>

              {/* BADGE NIVEAU */}
              <div className="mt-6">
                {level && (
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-xs">
                    {level === "debutant" && t("select.beginner")}
                    {level === "intermediaire" && t("select.intermediate")}
                    {level === "avance" && t("select.advanced")}
                  </span>
                )}
              </div>
            </div>

            {/* ---------- FOOTER BUTTONS ---------- */}
            <div className="flex justify-between items-center mt-10 max-w-xl w-full mx-auto">
              <button
                className="px-6 py-2 bg-[#DDE7FF] text-gray-700 rounded-xl text-sm shadow"
                onClick={() => setActiveStep(1)}
              >
                {t("buttons.previous")}
              </button>

              <div className="flex gap-3">
                <button
                  className="px-6 py-2 bg-white border border-sky-300 text-gray-700 rounded-xl text-sm shadow"
                  onClick={() => handleSaveStep1(coursId)}  // sauvegarde en draft
                >
                  {t("buttons.save_draft")}
                </button>

                <button
                  className="px-6 py-2 bg-primary text-white rounded-xl text-sm shadow hover:bg-grad-1"
                  onClick={() => handleSaveStep1(coursId)}  // publication
                >
                  {t("buttons.publish")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
