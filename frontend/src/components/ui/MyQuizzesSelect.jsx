import ModernDropdown from "../common/ModernDropdown";

export default function MyQuizzesSelect({ items, selectedItemId, onChange, existingItems }) {
  // Transformer les items filtrés en options pour ModernDropdown
  const options = items
    .filter(q => !existingItems.some(e => e.id === q.id))
    .map(q => ({
      value: q.id,
      label: q.title?.trim() || "Sans titre",
    }));

  return (
    <ModernDropdown
      value={selectedItemId}
      onChange={onChange}
      options={options}
      placeholder="Sélectionnez un quiz"
      style={{ width: "450px" }}
    />
  );
}
