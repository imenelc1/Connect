
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationFR from "./locales/fr-Choice/translation.json";
import translationEN from "./locales/en-Choice/translation.json";
import translationFRAcceuil from "./locales/fr-Acceuil/translation.json";
import translationENAcceuil from "./locales/en-Acceuil/translation.json";
import translationFRLogin from "./locales/fr-login/fr.json";
import translationENLogin from "./locales/en-login/en.json";
import translationFRSignup from "./locales/fr-sign/translation.json";
import translationENSignup from "./locales/en-sign/translation.json";
import translationENNavbar from "./locales/Navbar/en-Navbar/translation.json";
import translationFRNavbar from "./locales/Navbar/fr-Navbar/translation.json";
import translationENAllCourses from "./locales/AllCourses/en/translation.json";
import translationFRAllCourses from "./locales/AllCourses/fr/translation.json";
const resources = {
  fr: { translation: translationFR, acceuil: translationFRAcceuil, login: translationFRLogin, signup: translationFRSignup, navbar: translationFRNavbar, allcourses: translationFRAllCourses },
  en: { translation: translationEN, acceuil: translationENAcceuil, login: translationENLogin, signup: translationENSignup, navbar: translationENNavbar, allcourses: translationENAllCourses },
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
