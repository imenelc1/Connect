import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

//compposant de recherche personalisé

export default function ContentSearchBar({
  value, //valeur actuelle de l'input 
  onChange, //callback appelé à chaque modification
  className = "", //calsses supp pour le conteneur
}) {
   const { t } = useTranslation("filters"); //traduction
  return (
    <div className={`relative w-full flex justify-center ${className}`}>
      <div className="relative w-full max-w-xl">
        {/* icon de recherche */}
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        {/* champ input principal */}
        <input
          type="text"
          value={value} //valeur controlléé
          onChange={onChange} //callback parent
          className="w-full rounded-full pl-12 pr-4 py-2 bg-card text-sm focus:ring-2 focus:ring-primary/40 outline-none"
          placeholder={t("searchPlaceholder")}
        />
      </div>
    </div>
  );
}