
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationFR from "./locales/choice/fr-Choice/translation.json";
import translationEN from "./locales/choice/en-Choice/translation.json";
import translationFRAcceuil from "./locales/Acceuil/fr-Acceuil/translation.json";
import translationENAcceuil from "./locales/Acceuil/en-Acceuil/translation.json";
import translationFRLogin from "./locales/login/fr-login/fr.json";
import translationENLogin from "./locales/login/en-login/en.json";
import translationFRSignup from "./locales/signup/fr-sign/translation.json";
import translationENSignup from "./locales/signup/en-sign/translation.json";
import translationENNavbar from "./locales/Navbar/en-Navbar/translation.json";
import translationFRNavbar from "./locales/Navbar/fr-Navbar/translation.json";
import translationENAllCourses from "./locales/AllCourses/en/translation.json";
import translationFRAllCourses from "./locales/AllCourses/fr/translation.json";
import translationFRNewExercise from "./locales/NewExercise/fr-newExercise.json";
import translationENNewExercise from "./locales/NewExercise/en-newExercise.json";
import translationFRExercisePreview from "./locales/NewExercise/fr-previewExercise.json";
import translationENExercisePreview from "./locales/NewExercise/en-previewExercise.json";
import translationFRCourseInfo from "./locales/createCourse/fr/translation.json";
import translationENCourseInfo from "./locales/createCourse/en/translation.json";
import translationFRAllExercises from "./locales/AllExercises/fr/translation.json";
import translationENAllExercises from "./locales/AllExercises/en/translation.json";
import translationFRallQuizzes from "./locales/AllQuizzes/fr/translation.json";
import translationENallQuizzes from "./locales/AllQuizzes/en/translation.json";
import filtersFR from "./locales/filters/fr/translation.json";
import filtersEN from "./locales/filters/en/translation.json"; 
import translationFRCreateQuiz from "./locales/fr-quiz/fr.json";
import translationENCreateQuiz from "./locales/en-quiz/en.json"; 
import translationFRSetting from "./locales/en-Setting/translation.json";
import translationENSetting from "./locales/fr-Setting/translation.json";

const resources = {
  fr: { translation: translationFR, acceuil: translationFRAcceuil, login: translationFRLogin, signup: translationFRSignup, navbar: translationFRNavbar, allcourses: translationFRAllCourses, newExercise: translationFRNewExercise, exercisePreview: translationFRExercisePreview, courseInfo: translationFRCourseInfo, allExercises: translationFRAllExercises, allQuizzes: translationFRallQuizzes, filters: filtersFR, createQuiz: translationFRCreateQuiz, Setting: translationFRSetting },
  en: { translation: translationEN, acceuil: translationENAcceuil, login: translationENLogin, signup: translationENSignup, navbar: translationENNavbar, allcourses: translationENAllCourses, newExercise: translationENNewExercise, exercisePreview: translationENExercisePreview, courseInfo: translationENCourseInfo, allExercises: translationENAllExercises, allQuizzes: translationENallQuizzes, filters: filtersEN, createQuiz: translationENCreateQuiz, Setting: translationENSetting },
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
