import ModernDropdown from "../common/ModernDropdown";

export default function MyQuizzesSelect({ items, selectedItemId, onChange, existingItems }) {
  // Récupérer les IDs des quizzes déjà dans l'espace
  const existingIds = new Set(existingItems.map(q => q.id));

  const options = items
    .filter(q => q && q.id && !existingIds.has(q.id))  // ignorer les undefined et ceux déjà ajoutés
    .map(q => ({
      value: q.id,
      label: q.title?.trim() || "Sans titre"
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
