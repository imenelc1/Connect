
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationFR from "./locales/fr-Choice/translation.json";
import translationEN from "./locales/en-Choice/translation.json";
import translationFRAcceuil from "./locales/fr-Acceuil/translation.json";
import translationENAcceuil from "./locales/en-Acceuil/translation.json";

const resources = {
  fr: { translation: translationFR, acceuil: translationFRAcceuil },
  en: { translation: translationEN, acceuil: translationENAcceuil },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fr", // langue par défaut
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

export default i18n;
