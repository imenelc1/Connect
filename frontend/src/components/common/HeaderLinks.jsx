import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { MdTranslate } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function HeaderLinks() {
  const navigate = useNavigate();
    const { t, i18n } = useTranslation();
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };
  return (
   <ul className="flex items-center space-x-8 text-textc font-medium">
  <li>
    <a href="/" className="text-textc hover:opacity-80  transition">
      {t("home")}
    </a>
  </li>
  <li>
    <a href="#About" className="text-textc hover:opacity-80  transition ">
      {t("about")}
    </a>
  </li>
  <li>
    <a href="#Features" className="text-textc hover:opacity-80  transition">
  {t("features")}
    </a>
  </li>

  {/* toggle theme */}
  <li className="cursor-pointer text-textc hover:opacity-80  transition">
    <FiSun size={20} />
  </li>
  <li className="cursor-pointer text-textc hover:opacity-80  transition">
<MdTranslate
  size={20}
  title="Changer la langue"
  onClick={() =>
    changeLanguage(i18n.language === "fr" ? "en" : "fr")
  }
/>

</li>
</ul>




  );
}