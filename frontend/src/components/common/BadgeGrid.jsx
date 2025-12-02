import { FaLock } from "react-icons/fa";

const ICON_VARIANTS = {
  blue: "bg-blue",
  purple: "bg-purple",
  pink: "bg-pink",
};

const CARD_VARIANTS = {
  blue: "bg-grad-2",
  purple: "bg-grad-3",
  pink: "bg-grad-4",
};

export default function BadgeGrid({ badges, getBadgeIcon }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
      {badges.map((badge, i) => {
        const iconColor = ICON_VARIANTS[badge.variant] || ICON_VARIANTS.blue;
        const cardColor = CARD_VARIANTS[badge.variant] || CARD_VARIANTS.purple;

        return (
          <div
            key={i}
            className={`w-56 h-56 p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition 
              ${
                badge.locked
                  ? "bg-grad-2 opacity-50 cursor-not-allowed"
                  : `${cardColor} hover:scale-[1.02]`
              }
            `}
          >

            {/* -- Icône -- */}
            <div
              className={`w-12 h-12 mb-3 flex rounded-xl items-center justify-center 
                ${badge.locked ? "bg-white border border-gray-300 shadow-md shadow-gray-400" : iconColor}
              `}
            >
              {badge.locked ? (
                <FaLock className="text-grayc text-xl" />
              ) : (
                <span className="text-xl text-white">
                  {getBadgeIcon(badge.title)}
                </span>
              )}
            </div>

            <h3 className="text-sm font-semibold text-textc">{badge.title}</h3>
            <p className="text-xs text-grayc">{badge.desc}</p>

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
        );
      })}
    </section>
  );
}
