import React from "react";
import useI18n from "../../i18n";

export default function QuizSettings({ quizData, onQuizChange }) {
  const { t } = useI18n();
  const handleChange = (field, value) => onQuizChange(field, value);

  return (
    <div className="rounded-2xl shadow-lg p-6 max-w-[15rem]" style={{ background: "var(--color-quiz)" }}>
      <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-main)" }}>
        {t("quizSettings")}
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-main)" }}>
            {t("quizTitle")}
          </label>
          <input
            type="text"
            placeholder={t("quizTitlePlaceholder")}
            value={quizData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full text-sm border rounded-xl focus:outline-none focus:ring-2"
            style={{ borderColor: "#e5e7eb" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-main)" }}>
            {t("descriptionLabel")}
          </label>
          <textarea
            placeholder={t("descriptionPlaceholder")}
            value={quizData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full text-sm border rounded-xl focus:outline-none focus:ring-2"
            style={{ borderColor: "#e5e7eb" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-main)" }}>
              {t("duration")}
            </label>
            <input
              type="number"
              value={quizData.duration}
              onChange={(e) => handleChange("duration", parseInt(e.target.value) || 0)}
              className="w-full text-sm border rounded-xl focus:outline-none focus:ring-2"
              style={{ borderColor: "#e5e7eb" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text-main)" }}>
              {t("passingScore")}
            </label>
            <input
              type="number"
              value={quizData.passingScore}
              onChange={(e) => handleChange("passingScore", parseInt(e.target.value) || 0)}
              className="w-full text-sm border rounded-xl focus:outline-none focus:ring-2"
              style={{ borderColor: "#e5e7eb" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-main)" }}>
            {t("quizLevel")}
          </label>
          <input
            type="text"
            placeholder={`${t("beginner")} / ${t("intermediate")} / ${t("advanced")}`}
            value={quizData.level}
            onChange={(e) => handleChange("level", e.target.value)}
            className="w-full text-sm rounded-xl focus:outline-none focus:ring-2"
            style={{ borderColor: "#e5e7eb" }}
          />
        </div>
      </div>
    </div>
  );
}
