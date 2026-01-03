import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/NavBar";

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

export default function NewExercise() {
  const [activeStep, setActiveStep] = useState(1);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation("newExercise");
  const { toggleDarkMode } = useContext(ThemeContext);
  const [solution, setSolution] = useState("");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  // Form state
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [cours, setCours] = useState("");
  const [courseVisibility, setCourseVisibility] = useState("public"); // default
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const token = localStorage.getItem("token");
   // États pour la responsivité
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const currentUserId = getCurrentUserId();

  const [maxSoumissions, setMaxSoumissions] = useState(0); // 0 = illimité

  const [courses, setCourses] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8000/api/courses/api/cours")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((c) => ({
          id: c.id_cours,
          title: c.titre_cour,

          isMine: c.utilisateur === currentUserId, //NEWDED GHR ISMINE //
        }));
        setCourses(formatted);
      })
      .catch((err) => console.error("Erreur chargement cours :", err));
  }, []);

  const initials = `${userData?.nom?.[0] || ""}${
    userData?.prenom?.[0] || ""
  }`.toUpperCase();

  const exerciseSteps = [
    { label: t("exercises.info"), icon: FileText },
    { label: t("exercises.preview"), icon: Activity },
  ];

  // Save step 1
  const handleSaveStep1 = async () => {
    const token = localStorage.getItem("token");
    const currentUserId = getCurrentUserId();

    if (!token || !currentUserId) {
      alert("Utilisateur non connecté");
      return null;
    }

    // Vérification avant envoi
    /*ù if (!title || !statement || !level || !category || !selectedCourseId) {
       alert("Veuillez remplir tous les champs obligatoires et sélectionner un cours.");
       return null;
     }*/

    try {
      const res = await api.post(
        "exercices/create/",
        {
          titre_exo: title,
          enonce: statement,
          niveau_exo: level,
          utilisateur: currentUserId,
          categorie: category,
          cours: selectedCourseId,
          visibilite_exo: courseVisibility === "private" ? false : true,
          solution: solution || null,
          max_soumissions: maxSoumissions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      const exoId = res.data.id_exercice;
      navigate("/all-exercises");
      return exoId;
    } catch (err) {
      console.error(
        "Erreur création cours :",
        err.response?.data || err.message
      );
      alert("Erreur lors de la création de l'exercice");
      return null;
    }
  };

  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* SIDEBAR */}
      <div >
        <Navbar />
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
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
              className="w-full rounded-full border border-grayc px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary mb-6 !bg-card dark:text-white"
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
              className="w-full rounded-3xl border border-grayc px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary mb-10 resize-none text-black bg-card dark:text-white"
            />
            <label className="block text-textc font-semibold mb-2">
              {t("form.solution_label")}
            </label>

            <textarea
              name="solution"
              placeholder={
                t("form.solution_placeholder") ||
                "Écrire la solution ici (facultatif)"
              }
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              rows={5}
              className="w-full rounded-3xl border border-grayc px-5 py-3 shadow-sm
             focus:outline-none focus:ring-2 focus:ring-primary mb-4
             resize-none text-black bg-card dark:text-white"
            />

            <p
              className="
    mb-3 px-4 py-2 rounded-2xl text-sm shadow-card
    bg-[rgb(var(--color-blue-primary-light))] 
    text-[rgb(var(--color-blue))] 
    border border-[rgb(var(--color-blue))]
  "
            >
              {t("solution_note")}
            </p>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-16">
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
                    {
                      value: "question_cours",
                      label: t("select.question_cours"),
                    },
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
                <label className="font-medium mb-2">
                  {t("exercises.visibility")}
                </label>
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

               <div className="flex flex-col w-150px">
                <label className="block text-textc font-semibold">
                  {t("max soumissions") ||
                    "Nombre max de soumissions (0 = illimité)"}
                </label>
               <Input
                type="number"
                min={0}
                value={maxSoumissions}
                onChange={(e) => setMaxSoumissions(Number(e.target.value))}
                placeholder="0"
                className="w-36 border border-grayc shadow-sm focus:outline-none focus:ring-2 focus:ring-primary mb-6 !bg-card dark:text-white"
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
                  <strong>{t("course.level")} :</strong> {level}
                </p>
                <p>
                  <strong>{t("course.courseVisibility")} :</strong>{" "}
                  {courseVisibility}
                </p>
                <p>
                  <strong>{t("course.course_selected")} :</strong>{" "}
                  {courses.find((c) => c.id === selectedCourseId)?.title || "-"}
                </p>

                <p>
                <strong>{t("max soumissions") || "Max soumissions"} :</strong> {maxSoumissions === 0 ? "Illimité" : maxSoumissions}
              </p>

              <p>
                  <strong>{t("solution")} :</strong> {solution || "-"}
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
                  onClick={handleSaveStep1} // sauvegarde en draft
                >
                  {t("buttons.save_draft")}
                </button>

                <button
                  className="px-6 py-2 bg-primary text-white rounded-xl text-sm shadow hover:bg-grad-1"
                  onClick={handleSaveStep1} // publication
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