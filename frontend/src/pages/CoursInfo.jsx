import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/Navbar";
import Input from "../components/common/Input";
import Topbar from "../components/common/TopBar";
import { Trash2, ChevronUp } from "lucide-react";
import ThemeContext from "../context/ThemeContext";
import ThemeButton from "../components/common/ThemeButton";
import Select from "../components/common/Select";
import { Globe } from "lucide-react";
import { Monitor, BookOpenCheck, CheckCircle } from "lucide-react";
//import axios from "axios";
import { getCurrentUserId } from "../hooks/useAuth";
import api from "../services/courseService";


export default function CoursePage() {
  const { t, i18n } = useTranslation("courseInfo");
  //  Ajout obligatoire pour que Topbar fonctionne !
  const [activeStep, setActiveStep] = useState(1);

  const { toggleDarkMode } = useContext(ThemeContext);

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const courseSteps = [
  { label: t("course.basic_info"), icon: Monitor },
  { label: t("course.curriculum"), icon: BookOpenCheck },
  { label: t("course.publish_title"), icon: CheckCircle },
];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
 const [sections, setSections] = useState([]); // tableau des sections
const [newSectionTitle, setNewSectionTitle] = useState(""); // titre temporaire pour la section
const [currentCoursId, setCurrentCoursId] = useState(null);



 const handleSaveStep1 = async () => {
  const token = localStorage.getItem("access_token");
  const currentUserId = getCurrentUserId();

  if (!token || !currentUserId) {
    setError("Utilisateur non connecté");
    return;
  }

  // Créer le payload à envoyer
  const payload = {
    titre_cour: title,
    description: description,
    duration: duration + ":00",
    niveau_cour: level,
    utilisateur: currentUserId, // ID envoyé directement depuis React
  };

  try {
    const res = await api.post("courses/create/", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Cours créé :", res.data);
    setCurrentCoursId(res.data.id_cours); // ou res.data.id selon ton serializer

    // Passer à l'étape suivante
    setActiveStep(2);

  } catch (err) {
    console.error("Erreur lors de la création :", err.response?.data || err.message);
    alert("Erreur lors de la création du cours");
  }
};

const handleSaveStep2 = async (coursId, ordre) => {
  const token = localStorage.getItem("access_token");
  const currentUserId = getCurrentUserId();

  if (!token || !currentUserId) {
    setError("Utilisateur non connecté");
    return;
  }

  if (!newSectionTitle.trim()) {
    alert("Le titre de la section ne peut pas être vide");
    return;
  }

  const payload = {
    cours: coursId,
    titre_section: newSectionTitle,
    utilisateur: currentUserId,
     ordre: ordre,
  };

  try {
    const res = await api.post("courses/createSection/", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Section créée :", res.data);
    // Réinitialiser le champ
    setNewSectionTitle("");
  } catch (err) {
    console.error("Erreur création section :", err.response?.data || err.message);
    alert("Erreur lors de la création de la section");
  }

  setActiveStep(3);
};







  return (
    <div className="w-full min-h-screen flex bg-primary/5">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 min-h-screen">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 lg:p-8 gap-6 ">

        <div className="w-full flex justify-between items-center mb-4">
          <ThemeButton onClick={toggleDarkMode} />

         {/* SWITCH LANGUE */}
          <div
            onClick={toggleLanguage}
            className=""
          >
            <Globe size={16} />
          </div>
        </div>
        

        {/* Top bar */}
        <Topbar
          steps={courseSteps}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          className="flex justify-between"
        />

       {/* STEP 1 : BASIC INFO */}
{activeStep === 1 && (
  <div className="w-full bg-grad-2 rounded-2xl shadow-md p-6 lg:p-10">
    <h2 className="text-2xl font-semibold mb-6 text-grad-1">
      {t("course.basic_info")}
    </h2>

    {/* Title */}
    <div className="flex flex-col mb-6">
      <label className="font-medium mb-2 textc">
        {t("course.title")}
      </label>
      <Input
        placeholder={t("course.course_title_placeholder")}
        className="text-black"
         value={title}
          onChange={(e) => setTitle(e.target.value)}
      />
    </div>

    {/* Topic */}
    <div className="flex flex-col mb-6">
      <label className="font-medium mb-2">
        {t("course.course_topic")}
      </label>
      <textarea
        className="w-full min-h-[180px] border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2"
        text-black="true"
         value={description}
          onChange={(e) => setDescription(e.target.value)}
        placeholder={t("course.course_topic_placeholder")}
      />
    </div>

    {/* Duration & Level */}
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div className="flex flex-col">
        <label className="font-medium mb-2">
          {t("course.duration")}
        </label>
        <input
          className="w-full rounded-full border border-grayc px-5 py-3 bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={duration}
            onChange={(e) => setDuration(e.target.value)}
          type="time"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium mb-2">
          {t("course.level")}
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
    </div>

    {/* Buttons */}
    <div className="flex justify-between mt-10 ">
      <button className="px-6 py-2 rounded-xl border border-secondary font-medium bg-white shadow-sm transition text-black/50">
        {t("course.cancel")}
      </button>
      <button
        className="px-6 py-2 rounded-xl bg-grad-1 text-white font-medium"
        onClick={handleSaveStep1}
      >
        {t("course.save_next")}
      </button>
    </div>
  </div>
)}
{activeStep === 2 && (
  <div className="w-full p-6">

    <div className="mt-6 relative bg-gradient-to-br from-grad-2/60 to-grad-2 rounded-2xl backdrop-blur-xl shadow-xl p-6 lg:p-10 border border-white/10">

      {/* Add Section */}
      <div className="absolute right-8 top-8">
        <button className="px-6 py-2 rounded-xl bg-grad-1 text-white shadow-lg hover:shadow-xl transition-transform hover:-translate-y-0.5">
          + {t("course.add_section")}
        </button>
      </div>

      <h1 className="text-3xl font-semibold mb-6 tracking-tight text-textc">
        {t("course.curriculum")}
      </h1>

      {/* Section Card */}
      <div className="bg-surface backdrop-blur-xl rounded-2xl p-5 shadow-inner border border-white/20 transition hover:border-primary/30">

        <div className="flex items-center gap-4 mb-4 bg-transparent">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-grad-1 text-white font-semibold">
            1
          </div>

          <Input
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder={t("course.section_title_placeholder")}
            className="!bg-transparent !border-none px-2 text-textc font-medium"
          />

          <div className="ml-auto flex items-center gap-2 text-muted">
            <button className="hover:text-primary transition-colors">
              <ChevronUp size={20} strokeWidth={1.7} />
            </button>

            <button className="hover:text-red-500 transition-colors">
              <Trash2 size={20} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <div className="space-y-3">

          {/* LESSON 2 */}
          <div className="flex items-center gap-4 rounded-xl p-4 bg-grad-3 border border-gray-200/50  shadow-sm hover:shadow-md transition-all">
            <div className="text-sm font-medium w-6 text-textc">2.</div>

            <Input
              value={t("course.lesson")}
              className="!bg-transparent !border-none text-textc"
            />

            <div className="flex items-center gap-3 ml-auto">
              <Select
                className="text-sm px-3 py-2 rounded-lg border bg-white dark:bg-white/10 text-textc"
                options={[{ value: "type", label: t("course.lesson_type") }]}
              />
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={20} strokeWidth={1.8} />
              </button>
            </div>
          </div>

                    {/* LESSON 1 */}
          <div className="flex items-center gap-4 rounded-xl p-4 bg-grad-3 border border-gray-200/50  shadow-sm hover:shadow-md transition-all">
            <div className="text-sm font-medium w-6 text-textc">1.</div>

            <Input
              value={t("course.lesson")}
              className="!bg-transparent !border-none text-textc"
            />

            <div className="flex items-center gap-3 ml-auto">
              <Select
                className="text-sm px-3 py-2 rounded-lg border bg-white dark:bg-white/10 text-textc"
                options={[{ value: "type", label: t("course.lesson_type") }]}
              />
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={20} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* Add Lesson */}
          <div className="flex justify-center mt-5">
            <button className="w-1/2 rounded-xl border py-2 bg-primary text-white font-medium hover:bg-primary/90 transition">
              + {t("course.add_lesson")}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="mt-10 flex items-center justify-between">
        <button
          className="px-8 py-2 rounded-xl bg-white dark:bg-white/10 shadow-sm font-medium text-black/60 dark:text-white/70 hover:shadow-md transition"
          onClick={() => setActiveStep(1)}
        >
          {t("course.back")}
        </button>

        <button
          className="px-8 py-2 rounded-xl bg-grad-1 text-white font-medium shadow-lg hover:shadow-xl transition-transform hover:-translate-y-0.5"
          onClick={() => handleSaveStep2(currentCoursId, 1)}
        >
          {t("course.save_next")}
        </button>
      </div>
    </div>
  </div>
)}



        {/* ====================== */}
        {/*   CONTENT STEP 3      */}
        {/* ====================== */}
        {activeStep === 3 && (
          <div className="w-full bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold">Publish Course</h2>
            <p>→ Ici page finale.</p>
          </div>
        )}
      </div>
    </div>
  );
}