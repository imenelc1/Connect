export default function MyCoursesSelect({ items, selectedItemId, onChange, existingItems }) {
  return (
    <select
      className="w-full bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
      value={selectedItemId}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Sélectionnez un cours</option>
      {items
        .filter(c => !existingItems.some(e => e.id === c.id))
        .map(c => (
          <option key={c.id} value={c.id}>
            {c.title?.trim() || "Sans titre"}
          </option>
        ))}
    </select>
  );
}
