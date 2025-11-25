import React, { useState } from "react";
import SideNavbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NewExercise() {
  const { t, i18n } = useTranslation("newExercise");

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
    <div className="flex w-full min-h-screen bg-[#F7FAFF]">
      {/* SIDEBAR */}
      <SideNavbar
        links={[]}
        userName="Andrew Smith"
        userRole="Product Designer"
        userInitials="A.S"
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col ml-72 px-6 py-2"> 

        {/* TOP BAR */}
        <div className="w-full flex justify-between items-center mb-10">
          <h1 className="text-3xl font-semibold text-[#2B3A67]">
            {t("title.page")}
          </h1>

          {/* SWITCH LANGUE */}
          <div
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200
                       rounded-lg px-3 py-1 cursor-pointer shadow"
          >
            <Globe size={16} className="text-gray-700" />
            <span className="text-gray-700 font-medium text-sm">
              {i18n.language.toUpperCase()}
            </span>
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className="w-full">
          
          {/* TITLE */}
          <label className="block text-gray-700 font-semibold mb-2">
            {t("form.title_label")}
          </label>
          <input
            type="text"
            name="title"
            placeholder={t("form.title_placeholder")}
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-full border border-[#DDE7FF]
                       px-5 py-3 bg-white shadow-sm focus:outline-none
                       focus:ring-2 focus:ring-sky-300 mb-6"
          />

          {/* STATEMENT */}
          <label className="block text-gray-700 font-semibold mb-2">
            {t("form.statement_label")}
          </label>
          <textarea
            name="statement"
            placeholder={t("form.statement_placeholder")}
            value={formData.statement}
            onChange={handleChange}
            rows={6}
            className="w-full rounded-3xl border border-[#DDE7FF]
                       px-5 py-3 bg-white shadow-sm focus:outline-none
                       focus:ring-2 focus:ring-sky-300 mb-10 resize-none"
          />

          {/* GRID : CATEGORY / DURATION / LEVEL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">

            {/* CATEGORY */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t("form.category_label")}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-full border border-[#DDE7FF]
                           px-5 py-3 bg-white shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-sky-300"
              >
                <option value="">{t("select.placeholder")}</option>
                <option value="day">{t("select.day")}</option>
                <option value="week">{t("select.week")}</option>
                <option value="month">{t("select.month")}</option>
              </select>
            </div>

            {/* DURATION */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t("form.duration_label")}
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-full border border-[#DDE7FF]
                           px-5 py-3 bg-white shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-sky-300"
              >
                <option value="">{t("select.placeholder")}</option>
                <option value="day">{t("select.day")}</option>
                <option value="week">{t("select.week")}</option>
                <option value="month">{t("select.month")}</option>
              </select>
            </div>

            {/* LEVEL */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t("form.level_label")}
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full rounded-full border border-[#DDE7FF]
                           px-5 py-3 bg-white shadow-sm focus:outline-none
                           focus:ring-2 focus:ring-sky-300"
              >
                <option value="">{t("select.placeholder")}</option>
                <option value="beginner">{t("select.beginner")}</option>
                <option value="intermediate">{t("select.intermediate")}</option>
                <option value="advanced">{t("select.advanced")}</option>
              </select>
            </div>
          </div>
{/* BUTTONS */}
<div className="flex justify-between items-center mt-6">
  <button className="px-6 py-2 bg-white border border-sky-300 
                     text-gray-700 rounded-xl shadow">
    {t("buttons.cancel")}
  </button>

  <button className="px-6 py-2 bg-primary text-white rounded-xl shadow">
    {t("buttons.save_next")}
  </button>
</div>

        </div>
      </div>
    </div>
  );
}
