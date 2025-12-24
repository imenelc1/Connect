export default function MyQuizzesSelect({ items, selectedItemId, onChange, existingItems }) {
  return (
    <select
      className="w-full bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
      value={selectedItemId}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Sélectionnez un quiz</option>
      {items
        .filter(q => !existingItems.some(e => e.id === q.id))
        .map(q => (
          <option key={q.id} value={q.id}>
            {q.title?.trim() || "Sans titre"}
          </option>
        ))}
    </select>
  );
}