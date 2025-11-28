import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function SaveDraftButton({ onClick }) {
  const { t } = useTranslation("createQuiz");

  return (
    <button
      onClick={onClick}
      className="py-3 px-5 rounded-xl font-semibold border transition-colors"
      style={{ background: "var(--color-surface)", color: "var(--color-text-main)", borderColor: "#e5e7eb" }}
    >
      {t("saveDraft")}
    </button>
  );
}
