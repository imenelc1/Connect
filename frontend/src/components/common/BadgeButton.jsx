export default function BadgeButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md border flex items-center gap-2 transition
        ${active
          ? "bg-grad-all text-white border-transparent"
          : "bg-card text-textc border-gray-300"
        }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
