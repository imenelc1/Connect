import ModernDropdown from "../common/ModernDropdown";

export default function MyCoursesSelect({ items, selectedItemId, onChange, existingItems }) {
  // Transformer les items filtrés en options pour ModernDropdown
  const options = items
    .filter(c => !existingItems.some(e => e.id === c.id))
    .map(c => ({
      value: c.id,
      label: c.title?.trim() || "Sans titre",
    }));

  return (
    <ModernDropdown
      value={selectedItemId}
      onChange={onChange}
      options={options}
      placeholder="Sélectionnez un cours"
      style={{ width: "450px" }}
    />
  );
}
