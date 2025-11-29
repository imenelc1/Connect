import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function PublishQuizButton({ onClick }) {
  const { t } = useTranslation("createQuiz");

  return (
    <button
      onClick={onClick}
      className="py-3 px-5 rounded-xl font-semibold text-white transition-colors bg-grad-1 hover:brightness-90"
    >
      {t("previewQuiz")}
    </button>
  );
}
