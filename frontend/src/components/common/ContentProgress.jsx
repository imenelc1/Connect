import React from "react";
import { useTranslation } from "react-i18next";


export default function ContentProgress({ value = 0, color }) {
  const { t } = useTranslation("contentPage");
  return (
    <div className="mt-4 w-full">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-all transition-all duration-300 ease-out ${color}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>

      <p className="text-sm text-muted mt-1">{t("completed", { value })} </p>
    </div>
  );
}