import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SideNavbar from "../components/common/NavBar";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeButton from "../components/common/ThemeButton";
import ThemeContext from "../context/ThemeContext";
import Select from "../components/common/Select";
import Input from "../components/common/Input";
import Topbar from "../components/common/TopBar";
import { getCurrentUserId } from "../hooks/useAuth";
import { FileText, Activity, CheckCircle } from "lucide-react";
export default function NewExercise() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("newExercise");
  const { toggleDarkMode } = useContext(ThemeContext);


  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const [title, setTitle] = useState("");
  const [statement, setStatment] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [cours, setCours] = useState("");
  const [currentCoursId, setCurrentCoursId] = useState(null);

  /*const [formData, setFormData] = useState({
    title: "",
    statement: "",
    category: "",
    level: "",
  });*/

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const exerciseSteps = [
  { label: t("exercises.info"), icon: FileText, route: "/NewExercise" },
  { label: t("exercises.preview"), icon: Activity, route: "/exercise-preview" }
];


  return (
    <div className="flex w-full min-h-screen bg-surface">

      {/* SIDEBAR */}
      <SideNavbar
        links={[]}
        userName="Andrew Smith"
        userRole="Product Designer"
        userInitials="A.S"
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col ml-72 px-6 py-2">

      <div>
          <ThemeButton onClick={toggleDarkMode} />
          {/* SWITCH LANGUE */}
          <div
            onClick={toggleLanguage}
            className=""
          >
            <Globe size={16} />
          </div>
      </div>
        

        {/* TOP BAR */}

       <Topbar steps={exerciseSteps} activeStep={1} className="flex justify-between"/>

    

        {/* FORM */}
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
            className="w-full rounded-full border border-grayc
                       px-5 py-3 shadow-sm focus:outline-none
                       focus:ring-2 focus:ring-primary mb-6 bg-secondary/10"
          />

          {/* STATEMENT */}
          <label className="block text-textc font-semibold mb-2">
            {t("form.statement_label")}
          </label>
          <textarea
            name="statement"
            placeholder={t("form.statement_placeholder")}
            value={statement}
            onChange={(e) => setStatment(e.target.value)}
            rows={6}
            className="w-full rounded-3xl border border-grayc
                       px-5 py-3 shadow-sm focus:outline-none
                       focus:ring-2 focus:ring-primary mb-10 resize-none shadow-sm text-black bg-secondary/10"
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
                onChange={handleChange}
                className="w-full rounded-full border border-grayc
                           px-5 py-3 bg-background shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-primary" options={
                [
                  { value: "", label: t("select.placeholder") },
                  { value: "day", label: t("select.day") },
                  { value: "week", label: t("select.week") },
                  { value: "month", label: t("select.month") },
                ]
              } />
            </div>

          

            {/* LEVEL */}
            <div>
              <label className="block text-textc font-semibold mb-2">
                {t("form.level_label")}
              </label>
              <Select
                name="level"
                value={level}
                onChange={handleChange}
                className="w-full rounded-full border border-grayc
                           px-5 py-3 bg-background shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-primary"
                options={[
                  { value: "", label: t("select.placeholder") },
                  { value: "debutant", label: t("select.beginner") },
                  { value: "intermediaire", label: t("select.intermediate") },
                  { value: "avance", label: t("select.advanced") },
                ]}
              />
            </div>
            {/* COURS */}
            <div>
              <label className="block text-textc font-semibold mb-2">
                {t("form.cours")}
              </label>
              <Select
                name="cours"
                value={cours}
                onChange={handleChange}
                className="w-full rounded-full border border-grayc
                           px-5 py-3 bg-background shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-primary"
                options={[
                  { value: "", label: t("select.placeholder") },
                  { value: "debutant", label: t("select.beginner") },
                  { value: "intermediaire", label: t("select.intermediate") },
                  { value: "avance", label: t("select.advanced") },
                ]}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-between items-center mt-6">
            <button className="px-6 py-2 bg-surface border border-primary 
                               text-textc rounded-xl shadow">
              {t("buttons.cancel")}
            </button>

            <button className="px-6 py-2 bg-primary text-white rounded-xl shadow hover:bg-grad-1" onClick={() => navigate("/exercise-preview")}>
              {t("buttons.save_next")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
