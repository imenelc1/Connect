export default function ContentFilters({ showCompletedFilter, onFilterChange, activeFilter }) {
  const levels = ["ALL", "beginner", "intermediate", "advanced"];

  return (
    <div className="w-full flex justify-center mt-6">
      <div className="flex items-center gap-8">

        <div className="flex bg-primary/20 rounded-full px-6 py-2 gap-6 font-semibold ">
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => onFilterChange(lvl)}
              className={
                lvl === activeFilter
                  ? "text-supp" // <-- le bouton actif devient bleu
                  : "text-grayc hover:text-supp transition" // <-- les autres restent gris
              }
            >
              {lvl}
            </button>
          ))}
        </div>

        {showCompletedFilter && (
          <select className="rounded-xl px-4 py-2 bg-white shadow border border-primary/20 text-primary font-medium">
            <option>Completed</option>
            <option>Not Completed</option>
          </select>
        )}

      </div>
    </div>
  );
}