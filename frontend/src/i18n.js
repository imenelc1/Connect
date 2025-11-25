
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

import translationFRExercisePreview from "./locales/fr-ExercisePreview/translation.json";
import translationENExercisePreview from "./locales/en-ExercisePreview/translation.json";

import translationFRNewExercise from "./locales/fr-NewExercise/translation.json";
import translationENNewExercise from "./locales/en-NewExercise/translation.json";

import translationENNavbar from "./locales/Navbar/en-Navbar/translation.json";
import translationFRNavbar from "./locales/Navbar/fr-Navbar/translation.json";


const resources = {
  fr: { translation: translationFR, acceuil: translationFRAcceuil, login: translationFRLogin, signup: translationFRSignup,exercisePreview: translationFRExercisePreview , newExercise: translationFRNewExercise, navbar: translationFRNavbar },
  en: { translation: translationEN, acceuil: translationENAcceuil, login: translationENLogin, signup: translationENSignup, exercisePreview: translationENExercisePreview , newExercise: translationENNewExercise ,navbar: translationENNavbar},
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
