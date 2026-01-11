import ModernDropdown from "../common/ModernDropdown";
import { useTranslation } from "react-i18next";

export default function MyExercisesSelect({ items, selectedItemId, onChange, existingItems }) {
    const { t, i18n } = useTranslation("CourseDetails");
  // Transformer les items filtrés en options pour ModernDropdown
  const options = items
    .filter(e => !existingItems.some(ex => ex.id === e.id))
    .map(e => ({
      value: e.id,
      label: e.title?.trim() || t("noTitle"),
    }));

  return (
    <ModernDropdown
      value={selectedItemId}
      onChange={onChange}
      options={options}
      placeholder={t("selectExercisePlaceholder")}
      style={{ width: "450px" }}
    />
  );
}
