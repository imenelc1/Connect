import { FaLock } from "react-icons/fa";

export default function BadgeGrid({ badges, getBadgeIcon }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
      {badges.map((badge, i) => (
        <div
          key={i}
          className={`w-56 h-56 p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition ${
            badge.locked
              ? "bg-gray-light opacity-60 cursor-not-allowed"
              : "bg-grad-3 hover:scale-[1.02]"
          }`}
        >
          {/* Icône carré */}
          <div
            className={`w-12 h-12 mb-3 flex rounded-xl items-center justify-center ${
              badge.locked
                ? "bg-white border border-gray-300 shadow-md shadow-gray-400"
                : "bg-primary"
            }`}
          >
            <span className={`text-xl ${badge.locked ? "text-grayc" : "text-white"}`}>
              {badge.locked ? <FaLock /> : getBadgeIcon(badge.title)}
            </span>
          </div>

          {/* Titre */}
          <h3 className="text-sm font-semibold text-black">{badge.title}</h3>
          <p className="text-xs text-grayc">{badge.desc}</p>

          {/* XP ou Locked */}
          <p
            className={`mt-2 px-3 py-1 rounded-md text-xs font-medium border ${
              badge.locked
                ? "text-red-500 border-red-300 bg-white"
                : "text-white border-secondary bg-primary"
            }`}
          >
            {badge.locked ? "Locked" : badge.xp}
          </p>
        </div>
      ))}
    </section>
  );
}
