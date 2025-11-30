import { useTranslation } from "react-i18next";
import { FaTrophy, FaFire, FaStar } from "react-icons/fa";
import ContentProgress from "../common/ContentProgress";

export default function BadgeStats({ unlockedCount, totalBadges, progressPct, streakPct, xpPct }) {
  const { t } = useTranslation("badges");

  return (
    <section className="p-5 rounded-xl shadow mb-6 bg-card">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {/* Badges */}
        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold">{unlockedCount}/{totalBadges} {t("stats.badges")}</p>
          <ContentProgress value={progressPct} className="[&>div>div]:bg-primary" />
          <p className="text-xs mt-2 text-grayc">{t("stats.unlocked")}</p>
        </div>

        {/* Days */}
        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold">12 {t("stats.days")}</p>
          <ContentProgress value={streakPct} className="[&>div>div]:bg-secondary" />
          <p className="text-xs mt-2 text-grayc">{t("stats.streak")}</p>
        </div>

        {/* XP */}
        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold">900 {t("stats.xp")}</p>
          <ContentProgress value={xpPct} className="[&>div>div]:bg-tertiary" />
          <p className="text-xs mt-2 text-grayc">{t("stats.totalPoints")}</p>
        </div>
      </div>
    </section>
  );
}
