import React from "react";
import useI18n from "../../i18n";

export default function SaveDraftButton({ onClick }) {
  const { t } = useI18n();

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
