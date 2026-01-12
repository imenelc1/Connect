import ModernDropdown from "../common/ModernDropdown";
import { useTranslation } from "react-i18next";

export default function MyQuizzesSelect({ items, selectedItemId, onChange, existingItems }) {
    const { t, i18n } = useTranslation("CourseDetails");
  // Récupérer les IDs des quizzes déjà dans l'espace
  const existingIds = new Set(existingItems.map(q => q.id));

  const options = items
    .filter(q => q && q.id && !existingIds.has(q.id))  // ignorer les undefined et ceux déjà ajoutés
    .map(q => ({
      value: q.id,
      label: q.title?.trim() || t("noTitle")
    }));

  return (
    <ModernDropdown
      value={selectedItemId}
      onChange={onChange}
      options={options}
      placeholder={t("selectQuizPlaceholder")}
      style={{ width: "450px" }}
    />
  );
}
