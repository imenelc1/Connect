import { useTranslation } from "react-i18next";
import BadgeButton from "./BadgeButton";
import { FaMedal, FaChartLine, FaTrophy } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";

export default function BadgeTabs({ activeTab, setActiveTab }) {
  const { t } = useTranslation("badges");

  const tabs = [
    { key: "all", label: t("tabs.all"), icon: <FaMedal /> },
    { key: "progress", label: t("tabs.progress"), icon: <FaChartLine /> },
    { key: "success", label: t("tabs.success"), icon: <FaTrophy /> },
    { key: "special", label: t("tabs.special"), icon: <MdAutoAwesome /> },
  ];

  return (
    <section className="mb-6">
      <div className="flex justify-around flex-wrap text-sm font-medium">
        {tabs.map(({ key, label, icon }) => (
          <BadgeButton
            key={key}
            active={activeTab === key}
            onClick={() => setActiveTab(key)}
            icon={icon}
            label={label}
          />
        ))}
      </div>
    </section>
  );
}
