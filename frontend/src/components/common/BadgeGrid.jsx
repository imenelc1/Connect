import { FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const CATEGORY_COLORS = {
  progress: {
    icon: "bg-blue",
    card: "bg-grad-2",
    xp: "text-blue border-blue bg-blue/10",
  },
  success: {
    icon: "bg-purple",
    card: "bg-grad-3",
    xp: "text-purple border-purple bg-purple/10",
  },
  special: {
    icon: "bg-pink",
    card: "bg-grad-4",
    xp: "text-pink border-pink bg-pink/10",
  },
  default: {
    icon: "bg-blue",
    card: "bg-grad-2",
    xp: "text-blue border-blue bg-blue/10",
  },
};

export default function BadgeGrid({ badges, getBadgeIcon }) {
    const { t, i18n } = useTranslation("badges");
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
      {badges.map((badge, i) => {
        const colors = CATEGORY_COLORS[badge.category] || CATEGORY_COLORS.default;

        return (
          <div
            key={i}
            className={`w-56 h-56 p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition
              ${
                badge.locked
                  ? "bg-supp/30 opacity-50 cursor-not-allowed"
                  : `${colors.card} hover:scale-[1.02]`
              }
            `}
          >

            {/* Icon */}
            <div
              className={`w-12 h-12 mb-3 flex rounded-xl items-center justify-center 
                ${badge.locked ? "bg-primary/30 border border-gray-300 shadow-md" : colors.icon}
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
              className={`mt-2 px-3 py-1 rounded-md text-xs font-medium border 
                ${
                  badge.locked
                    ? "text-black border-red-300 bg-white"
                    : colors.xp
                }
              `}
            >
             {badge.locked ? t("locked") : badge.xp}

            </p>
          </div>
        );
      })}
    </section>
  );
}
