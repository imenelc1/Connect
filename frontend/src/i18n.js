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
import translationFRMyStudents from "./locales/MyStudents/fr-MyStudents/translation.json";
import translationENMyStudents from "./locales/MyStudents/en-MyStudents/translation.json";
import translationFRSpaces from "./locales/Spaces/fr-Spaces/translation.json";
import translationENSpaces from "./locales/Spaces/en-Spaces/translation.json";
import translationFRCourseDetails from "./locales/CourseDetails/fr_CourseDetails/translation.json";
import translationENCourseDetails from "./locales/CourseDetails/en_CourseDetails/translation.json";

import translationFRSubmittedExercise from "./locales/SubmittedExo/fr-SubExo/translation.json";
import translationENSubmittedExercise from "./locales/SubmittedExo/en-SubExo/translation.json";
import translationFRSubmittedExercises from "./locales/SubmittedExos/SubmittedExos-fr/translation.json";
import translationENSubmittedExercises from "./locales/SubmittedExos/SubmittedExos-en/translation.json";
import translationFRQuizManagement from "./locales/QuizManagement/QuizManagement-fr/translation.json";
import translationENQuizManagement from "./locales/QuizManagement/QuizManagement-en/translation.json";

import translationFRExerciseManagement from "./locales/ExerciseManagement/ExerciseManagement-fr/translation.json";
import translationENExerciseManagement from "./locales/ExerciseManagement/ExerciseManagement-en/translation.json";

import translationFRCourseManagement from "./locales/CourseManagement/CourseManagement-fr/translation.json";
import translationENCourseManagement from "./locales/CourseManagement/CourseManagement-en/translation.json";






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
    myStudents: translationFRMyStudents,
    Spaces: translationFRSpaces,
    CourseDetails: translationFRCourseDetails,
    SubmittedExercise: translationFRSubmittedExercise,

    SubmittedExercises: translationFRSubmittedExercises,
    QuizManagement: translationFRQuizManagement,
    ExerciseManagement: translationFRExerciseManagement,
    CoursesManagement: translationFRCourseManagement


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
    myStudents: translationENMyStudents,
    Spaces: translationENSpaces,
    CourseDetails: translationENCourseDetails,
    SubmittedExercise: translationENSubmittedExercise,
    SubmittedExercises: translationENSubmittedExercises,
    QuizManagement: translationENQuizManagement,
    ExerciseManagement: translationENExerciseManagement,
    CoursesManagement: translationENCourseManagement


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
