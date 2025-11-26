import React from "react";
import useI18n from "../../i18n";

export default function PublishQuizButton({ onClick }) {
  const { t } = useI18n();

  return (
    <button
      onClick={onClick}
      className="py-3 px-5 rounded-xl font-semibold text-white transition-colors"
      style={{ background: "rgb(var(--color-primary))" }}
    >
      {t("previewQuiz")}
    </button>
  );
}
