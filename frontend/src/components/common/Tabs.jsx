import Button from "./Button";
import { useTranslation } from "react-i18next";
export default function Tabs({ activeTab, setActiveTab }) {
 const { t } = useTranslation("community");
  const tabs = [
    { id: "recent", label: t("tabs.recent") },
    { id: "popular", label: t("tabs.popular") },
    { id: "myforums", label: t("tabs.myforums") }
  ];

  return (
    <div className="flex justify-center gap-3 mb-6">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          text={tab.label}
          onClick={() => setActiveTab(tab.id)}
          variant={activeTab === tab.id ? "tabActive" : "tab"}
          className="!w-auto"
        />
      ))}
    </div>
  );
}