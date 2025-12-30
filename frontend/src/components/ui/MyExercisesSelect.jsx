import ModernDropdown from "../common/ModernDropdown";

export default function MyExercisesSelect({ items, selectedItemId, onChange, existingItems }) {
  // Transformer les items filtrés en options pour ModernDropdown
  const options = items
    .filter(e => !existingItems.some(ex => ex.id === e.id))
    .map(e => ({
      value: e.id,
      label: e.title?.trim() || "Sans titre",
    }));

  return (
    <ModernDropdown
      value={selectedItemId}
      onChange={onChange}
      options={options}
      placeholder="Sélectionnez un exercice"
      style={{ width: "450px" }}
    />
  );
}
