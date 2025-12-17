import React from "react";
import { useTranslation } from "react-i18next";

export default function QuizSettings({ quizData, onQuizChange }) {
  const { t } = useTranslation("createQuiz");

  const handleChange = (field, value) => onQuizChange(field, value);

  const levels = [
    { key: "beginner", label: t("beginner") },
    { key: "intermediate", label: t("intermediate") },
    { key: "advanced", label: t("advanced") }
  ];

  return (
    <div
      className="rounded-3xl shadow-xl p-6 max-w-[20rem] border border-white/10 backdrop-blur bg-grad-3"
    >
      {/* TITLE */}
      <h2
        className="text-lg font-semibold mb-4 tracking-wide"
        style={{ color: "var(--color-text-main)" }}
      >
        {t("quizSettings")}
      </h2>

      <div className="space-y-6">

        {/* TITLE INPUT */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--color-text-main)" }}
          >
            {t("quizTitle")}
          </label>
          <input
            type="text"
            placeholder={t("quizTitlePlaceholder")}
            value={quizData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/40 outline-none transition text-black"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--color-text-main)" }}
          >
            {t("descriptionLabel")}
          </label>
          <textarea
            placeholder={t("descriptionPlaceholder")}
            value={quizData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full text-sm px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/40 outline-none transition text-black"
          />
        </div>

        {/* NUMBERS */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-1 whitespace-nowrap"
              style={{ color: "var(--color-text-main)" }}
            >
              {t("duration")}
            </label>
            <input
              type="number"
              value={quizData.duration}
              onChange={(e) =>
                handleChange("duration", parseInt(e.target.value) || 0)
              }
              className="w-full text-sm px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/40 outline-none transition text-black"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1 whitespace-nowrap"
              style={{ color: "var(--color-text-main)" }}
            >
              {t("passingScore")}
            </label>
            <input
              type="number"
              value={quizData.passingScore}
              onChange={(e) =>
                handleChange("passingScore", parseInt(e.target.value) || 0)
              }
              className="w-full text-sm px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/40 outline-none transition text-black"
            />
          </div>
        </div>

        {/* LEVEL SELECTOR (CHIPS) */}
        <div>
          <label
            className="block text-sm font-medium mb-2 text-textc"
          >
            {t("quizLevel")}
          </label>

          <div className="flex flex-wrap gap-2">
            {levels.map(({ key, label }) => {
              const active = quizData.level === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange("level", key)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition 
                  ${active
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "border-gray-300 text-muted hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
