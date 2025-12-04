import { useTranslation } from "react-i18next";
import { FaTrophy, FaFire, FaStar } from "react-icons/fa";
import ContentProgress from "../common/ContentProgress";

export default function BadgeStats({ unlockedCount, totalBadges, progressPct, streakPct, xpPct }) {
  const { t } = useTranslation("badges");

  return (
    <section className="p-5 rounded-xl shadow mb-6 bg-grad-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">

        {/* Badges */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue text-white text-xl mb-2 shadow">
            <FaTrophy />
          </div>
          <p className="text-lg font-semibold">
            {unlockedCount}/{totalBadges} {t("stats.badges")}
          </p>
          <ContentProgress value={progressPct} className="[&>div>div]:bg-blue" />
          <p className="text-xs mt-2 text-grayc">{t("stats.unlocked")}</p>
        </div>

        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple text-white text-xl mb-2 shadow">
            <FaFire />
          </div>
          <p className="text-lg font-semibold">
            12 {t("stats.days")}
          </p>
          <ContentProgress value={streakPct} className="[&>div>div]:bg-purple" />
          <p className="text-xs mt-2 text-grayc">{t("stats.streak")}</p>
        </div>

        {/* XP */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-pink text-white text-xl mb-2 shadow">
            <FaStar />
          </div>
          <p className="text-lg font-semibold">
            900 {t("stats.xp")}
          </p>
          <ContentProgress value={xpPct} className="[&>div>div]:bg-pink" />
          <p className="text-xs mt-2 text-grayc">{t("stats.totalPoints")}</p>
        </div>

      </div>
    </section>
  );
}