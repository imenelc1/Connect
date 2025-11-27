import React, { useState, useContext } from "react";
import SideNavbar from "../components/common/Navbar";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeButton from "../components/common/ThemeButton";
import ThemeContext from "../context/ThemeContext";
import Select from "../components/common/Select";
import Input from "../components/common/Input";

export default function NewExercise() {
  const { t, i18n } = useTranslation("newExercise");
  const { toggleDarkMode } = useContext(ThemeContext);

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const [formData, setFormData] = useState({
    title: "",
    statement: "",
    category: "",
    duration: "",
    level: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

        <ThemeButton onClick={toggleDarkMode} />

        {/* TOP BAR */}
        <div className="w-full flex justify-between items-center mb-10">
          <h1 className="text-3xl font-semibold text-textc">
            {t("title.page")}
          </h1>

          {/* SWITCH LANGUE */}
          <div
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-surface hover:bg-muted
                       rounded-lg px-3 py-1 cursor-pointer shadow"
          >
            <Globe size={16} className="text-textc" />
            <span className="text-textc font-medium text-sm">
              {i18n.language.toUpperCase()}
            </span>
          </div>
        </div>

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
            value={formData.title}
            onChange={handleChange}
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
            value={formData.statement}
            onChange={handleChange}
            rows={6}
            className="w-full rounded-3xl border border-grayc
                       px-5 py-3 shadow-sm focus:outline-none
                       focus:ring-2 focus:ring-primary mb-10 resize-none shadow-sm text-black bg-secondary/10"
          />

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">

            {/* CATEGORY */}
            <div>
              <label className="block text-textc font-semibold mb-2">
                {t("form.category_label")}
              </label>
              <Select 
                name="category"
                value={formData.category}
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

            {/* DURATION */}
            <div>
              <label className="block text-textc font-semibold mb-2">
                {t("form.duration_label")}
              </label>
              <Select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-full border border-grayc
                           px-5 py-3 bg-background shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-primary"
                options={[
                  { value: "", label: t("select.placeholder") },
                  { value: "day", label: t("select.day") },
                  { value: "week", label: t("select.week") },
                  { value: "month", label: t("select.month") },
                ]}
              />
            </div>

            {/* LEVEL */}
            <div>
              <label className="block text-textc font-semibold mb-2">
                {t("form.level_label")}
              </label>
              <Select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full rounded-full border border-grayc
                           px-5 py-3 bg-background shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-primary"
                options={[
                  { value: "", label: t("select.placeholder") },
                  { value: "beginner", label: t("select.beginner") },
                  { value: "intermediate", label: t("select.intermediate") },
                  { value: "advanced", label: t("select.advanced") },
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

            <button className="px-6 py-2 bg-primary text-white rounded-xl shadow hover:bg-grad-1">
              {t("buttons.save_next")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
