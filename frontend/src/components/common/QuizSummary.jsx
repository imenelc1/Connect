import React from "react";
import useI18n from "../../i18n";

export default function QuizSummary({ totalQuestions, totalPoints, duration, passingScore }) {
  const { t } = useI18n();
  const passPoints = Math.ceil((passingScore / 100) * totalPoints);

  return (
    <div className="rounded-2xl shadow-lg p-6 max-w-[15rem]" style={{ background: "var(--color-surface)" }}>
      <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-main)" }}>
        {t("quizSummary")}
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span style={{ color: "var(--color-text-muted)" }}>{t("totalQuestions")}</span>
          <span className="font-semibold" style={{ color: "var(--color-text-main)" }}>{totalQuestions}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: "var(--color-text-muted)" }}>{t("totalPoints")}</span>
          <span className="font-semibold" style={{ color: "var(--color-text-main)" }}>{totalPoints}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: "var(--color-text-muted)" }}>{t("passScore")}</span>
          <span className="font-semibold" style={{ color: "var(--color-text-main)" }}>{passPoints} pts</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: "var(--color-text-muted)" }}>{t("durationLabel")}</span>
          <span className="font-semibold" style={{ color: "var(--color-text-main)" }}>{duration} {t("minutes")}</span>
        </div>
      </div>
    </div>
  );
}
