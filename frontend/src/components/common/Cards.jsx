import { useTranslation } from "react-i18next";
export default function Cards({ icon, title, text, value, bg }) {
  const { t } = useTranslation("acceuil");

  return (
    <div
      className={`
        w-78 rounded-3xl shadow-md p-6 flex flex-col items-start gap-4 transition
        ${bg}
      `}
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md text-3xl">
        {icon}
      </div>

      <h3 className="font-bold uppercase whitespace-nowrap text-black">
        {t(title)}
      </h3>

      <h6 className="text-2xl font-bold" style={{ color: "red !important" }}>
      {value}
      </h6>


      <p className="text-left text-base opacity-90 text-text">
        {t(text)}
      </p>
    </div>
  );
}
