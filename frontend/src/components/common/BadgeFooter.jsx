import { useTranslation } from "react-i18next";
import { MdAutoAwesome } from "react-icons/md";
import { FaRocket } from "react-icons/fa";

export default function BadgeFooter() {
  const { t } = useTranslation("badges");

  return (
    <footer className="mt-10 p-6 text-center rounded-lg shadow bg-grad-3">
      <MdAutoAwesome className="text-3xl text-primary mx-auto mb-3" />
      <h2 className="text-xl font-bold text-tertiary flex items-center justify-center gap-2">
        {t("footer.title")} <FaRocket />
      </h2>
      <p className="text-sm text-grayc mt-2">{t("footer.subtitle")}</p>
    </footer>
  );
}
