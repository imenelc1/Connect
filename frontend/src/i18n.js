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
import translationFRCourseInfo from "./locales/createCourse/fr/translation.json";
import translationENCourseInfo from "./locales/createCourse/en/translation.json";
import translationFRNewExercise from "./locales/NewExercise/fr-newExercise.json";
import translationENNewExercise from "./locales/NewExercise/en-newExercise.json";
import translationFRExercisePreview from "./locales/NewExercise/fr-previewExercise.json";
import translationENExercisePreview from "./locales/NewExercise/en-previewExercise.json";
import translationFRFilters from "./locales/Filters/fr/translation.json";
import translationENFilters from "./locales/Filters/en/translation.json";
import translationFRContentPage from "./locales/contentPage/fr/translation.json";
import translationENContentPage from "./locales/contentPage/en/translation.json";
import translationFRCreateQuiz from "./locales/fr-quiz/fr.json";
import translationENCreateQuiz from "./locales/en-quiz/en.json"; 
import translationFRSetting from "./locales/Settings/en-Setting/translation.json";
import translationENSetting from "./locales/Settings/fr-Setting/translation.json";
import translationENDashboard from "./locales/Dashboard/en/translation.json";
import translationFRDashboard from "./locales/Dashboard/fr/translation.json";

import translationFRBadges from "./locales/badges/fr.json";
import translationENBadges from "./locales/badges/en.json";
import frCourses from "./locales/courses/fr-courses/translation.json";
import enCourses from "./locales/courses/en-courses/translation.json";
import translationFRMyStudents from "./locales/MyStudents/fr-MyStudents/translation.json";
import translationENMyStudents from "./locales/MyStudents/en-MyStudents/translation.json";
import translationFRSpaces from "./locales/Spaces/fr-Spaces/translation.json";
import translationENSpaces from "./locales/Spaces/en-Spaces/translation.json";
import translationnFRCommunity from "./locales/Community/fr/translation.json";
import translationnENCommunity from "./locales/Community/en/translation.json";
import translationnENexerciceStudent from "./locales/exerciceStudent/en/translation.json";
import translationnFRexerciceStudent from "./locales/exerciceStudent/fr/translation.json";

const resources = {
  fr: {
    translation: translationFR,
    acceuil: translationFRAcceuil,
    login: translationFRLogin,
    signup: translationFRSignup,
    navbar: translationFRNavbar,
    allcourses: translationFRContentPage,
    allExercises: translationFRContentPage,
    allQuizzes: translationFRContentPage,
    newExercise: translationFRNewExercise,
    exercisePreview: translationFRExercisePreview,
    filters: translationFRFilters,
    contentPage: translationFRContentPage,
    courseInfo: translationFRCourseInfo,
  createQuiz: translationFRCreateQuiz,
  setting: translationFRSetting,
    Dashboard: translationFRDashboard,
    badges: translationFRBadges,
    community: translationnFRCommunity,

    courses: frCourses,

  myStudents: translationFRMyStudents,
  Spaces:translationFRSpaces,
  exerciceStudent:translationnFRexerciceStudent
  },

  en: {
    translation: translationEN,
    acceuil: translationENAcceuil,
    login: translationENLogin,
    signup: translationENSignup,
    navbar: translationENNavbar,
    allcourses: translationENContentPage,
    allExercises: translationENContentPage,
    allQuizzes: translationENContentPage,
    newExercise: translationENNewExercise,
    exercisePreview: translationENExercisePreview,
    filters: translationENFilters,
    contentPage: translationENContentPage,
    courseInfo: translationENCourseInfo,
  createQuiz: translationENCreateQuiz,
  setting: translationENSetting,
    Dashboard: translationENDashboard,
   badges: translationENBadges,
    courses: enCourses,
    myStudents: translationENMyStudents,
     Spaces: translationENSpaces,
    community: translationnENCommunity,
    exerciceStudent:translationnENexerciceStudent
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("lang") || "fr",   // <── FIX ICI
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
