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
  const token = localStorage.getItem("access_token");

  const currentUserId = getCurrentUserId();



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
  



  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""
    }`.toUpperCase();

  const exerciseSteps = [
    { label: t("exercises.info"), icon: FileText },
    { label: t("exercises.preview"), icon: Activity },
  ];

  // Save step 1
 const handleSaveStep1 = async () => {
  const token = localStorage.getItem("access_token");
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
        categorie: category,           // obligatoire
        cours: selectedCourseId,       // obligatoire, ID du cours
        visibilite_exo: courseVisibility === "private" ? false : true,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const exoId = res.data.id_exercice;
    navigate("/all-exercises");
    return exoId;
  } catch (err) {
    console.error("Erreur création cours :", err.response?.data || err.message);
    alert("Erreur lors de la création de l'exercice");
    return null;
  }
};


  /*const handleSaveAndNext = async () => {
    const savedId = await handleSaveStep1();
    if (savedId) navigate("/exercise-preview");
  };*/

  return (
    <div className="w-full min-h-screen flex bg-primary/5">
      {/* SIDEBAR */}
      <div className="hidden lg:block w-64 min-h-screen">
             <Navbar />
           </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col p-4 lg:p-8 gap-6">
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
            <div>
              <label className="block text-textc font-semibold mb-2">
                {t("form.category_label")}
              </label>
             <select
  name="category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="w-full rounded-full border border-grayc px-5 py-3 bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
>
  <option value="">{t("select.placeholder")}</option>
  <option value="code">{t("select.code")}</option>
  <option value="question_cours">{t("select.question_cours")}</option>
</select>

            </div>

            {/* LEVEL */}
            <div>
              <label className="block text-textc font-semibold mb-2">
                {t("form.level_label")}
              </label>
              <Select
                               className="w-full rounded-full border border-grayc px-5 py-3 bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                               value={level}
                               onChange={(e) => setLevel(e.target.value)}
                               options={[
                                 { value: "", label: t("select.placeholder") },
                                 { value: "debutant", label: t("select.Beginner") },
                                 { value: "intermediaire", label: t("select.Intermediate") },
                                 { value: "avance", label: t("select.Advanced") },
                               ]}
                             />
            </div>
                  <div className="flex flex-col mt-4">
              <label className="font-medium mb-2">{t("exercises.visibility")}</label>
              <Select
                className="w-full rounded-full border border-grayc px-5 py-3 bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={courseVisibility}
                onChange={(e) => setCourseVisibility(e.target.value)}
                options={[
                  { value: "public", label: t("select.public") },
                  { value: "private", label: t("select.private") },
                ]}
              />
            </div>

            {/* COURS */}
            <div>
              <label className="block text-textc font-semibold mb-2">
                {t("form.cours")}
              </label>
         <Select
  value={selectedCourseId}
  onChange={(e) => setSelectedCourseId(e.target.value)}  // ← CORRECT
  options={[
    { value: "", label: t("select.placeholder") },
    ...courses
      .filter((c) => c.isMine)
      .map((c) => ({ value: c.id, label: c.title }))
  ]}
  placeholder={t("select.placeholder")}
  className="w-full rounded-full border border-grayc px-5 py-3 bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-2xl font-semibold mb-4 text-primary">
        {t("course.summary")}
      </h2>

      <div className="space-y-3 text-gray-700">
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
          <strong>{t("course.courseVisibility")} :</strong> {courseVisibility}
        </p>
      </div>
    </div>

   
   
    {/* ---------- Boutons ---------- */}
    <div className="flex justify-between items-center mt-10 max-w-xl w-full mx-auto">
      <button
        className="px-6 py-2 bg-[#DDE7FF] text-gray-700 rounded-xl text-sm shadow"
        onClick={() => setActiveStep(2)}
      >
         {t("course.back")}
      </button>

      <div className="flex gap-3">
        

        <button className="px-6 py-2 bg-primary text-white rounded-xl text-sm shadow hover:bg-grad-1"  onClick={handleSaveStep1}>
          {t("course.save_publier")}
        </button>
      </div>
    </div>
  

  </div>
)}

      </div>
    </div>
  );
}
