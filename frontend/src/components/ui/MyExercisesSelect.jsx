export default function MyExercisesSelect({ items, selectedItemId, onChange, existingItems }) {
  return (
    <select
      className="w-full bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
      value={selectedItemId}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Sélectionnez un exercice</option>
      {items
        .filter(e => !existingItems.some(ex => ex.id === e.id))
        .map(e => (
          <option key={e.id} value={e.id}>
            {e.title?.trim() || "Sans titre"}
          </option>
        ))}
    </select>
  );
}
