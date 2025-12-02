import { useTranslation } from "react-i18next";
import { MdAutoAwesome } from "react-icons/md";

export default function IaAssistant()
{
  const { t } = useTranslation("badges");

  return (<button className="flex items-center gap-2 bg-blue hover:bg-blue/90 text-white px-4 py-2 rounded-xl shadow w-full sm:w-auto">
              <MdAutoAwesome size={20} />
              {t("assistant")}
            </button>)
}
