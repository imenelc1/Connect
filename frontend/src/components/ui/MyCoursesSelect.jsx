import ModernDropdown from "../common/ModernDropdown";
import { useTranslation } from "react-i18next";

export default function MyCoursesSelect({ items, selectedItemId, onChange, existingItems }) {
  const { t, i18n } = useTranslation("CourseDetails");

  // Transformer les items filtrés en options pour ModernDropdown
  const options = items
    .filter(c => !existingItems.some(e => e.id === c.id))
    .map(c => ({
      value: c.id,
      label: c.title?.trim() || t("noTitle"),
    }));

  return (
    <ModernDropdown
      value={selectedItemId}
      onChange={onChange}
      options={options}
      placeholder={t("selectCoursePlaceholder")}

      style={{ width: "450px" }}
    />
  );
}
