import { useTranslation } from "react-i18next";
import { FaMedal } from "react-icons/fa";

export default function BadgeHeader() {
  const { t } = useTranslation("badges");

  return (
    <header className="ml-0 lg:ml-64 p-2 mb-4 flex items-center justify-between text-textc">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 flex items-center justify-center rounded-md text-white text-xl bg-grad-all">
          <FaMedal />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">{t("header.title")}</h1>
          <p className="text-sm text-grayc mt-1">{t("header.subtitle")}</p>
        </div>
      </div>
      <button className="px-4 py-2 rounded-md bg-tertiary text-white font-semibold shadow">
        {t("header.level")}
      </button>
    </header>
  );
}
