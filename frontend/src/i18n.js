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

import translationFRNavbar from "./locales/Navbar/fr-Navbar/translation.json";
import translationENNavbar from "./locales/Navbar/en-Navbar/translation.json";

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

import translationFRSetting from "./locales/Settings/fr-Setting/translation.json";
import translationENSetting from "./locales/Settings/en-Setting/translation.json";

import translationFRDashboard from "./locales/Dashboard/fr/translation.json";
import translationENDashboard from "./locales/Dashboard/en/translation.json";

import translationFRBadges from "./locales/badges/fr.json";
import translationENBadges from "./locales/badges/en.json";

import translationFRQuiz1 from "./locales/quiz1/fr.json";
import translationENQuiz1 from "./locales/quiz1/en.json";

import translationFRquiz2 from "./locales/quiz2/fr.json";
import translationENquiz2 from "./locales/quiz2/en.json";

import translationFRrecquiz from "./locales/recquiz/fr.json";
import translationENrecquiz from "./locales/recquiz/en.json";

import frCourses from "./locales/courses/fr-courses/translation.json";
import enCourses from "./locales/courses/en-courses/translation.json";

import translationFRMyStudents from "./locales/MyStudents/fr-MyStudents/translation.json";
import translationENMyStudents from "./locales/MyStudents/en-MyStudents/translation.json";

import translationFRSpaces from "./locales/Spaces/fr-Spaces/translation.json";
import translationENSpaces from "./locales/Spaces/en-Spaces/translation.json";

import translationFRCommunity from "./locales/Community/fr/translation.json";
import translationENCommunity from "./locales/Community/en/translation.json";

import translationENExerciceStudent from "./locales/exerciceStudent/en/translation.json";
import translationFRExerciceStudent from "./locales/exerciceStudent/fr/translation.json";

import translationENProgressExercice from "./locales/ProgressionExo/en/translation.json";
import translationFRProgressExercice from "./locales/ProgressionExo/fr/translation.json";

import translationENProgressStudent from "./locales/ProgressionStudent/en/translation.json";
import translationFRProgressStudent from "./locales/ProgressionStudent/fr/translation.json";

import translationENStartExo from "./locales/StartExercise/en-Exo/translation.json";
import translationFRStartExo from "./locales/StartExercise/fr-Exo/translation.json";

import translationFRCourseDetails from "./locales/CourseDetails/fr_CourseDetails/translation.json";
import translationENCourseDetails from "./locales/CourseDetails/en_CourseDetails/translation.json";

import translationFRSubmittedExercise from "./locales/SubmittedExo/fr-SubExo/translation.json";
import translationENSubmittedExercise from "./locales/SubmittedExo/en-SubExo/translation.json";

import translationFRExercisePage from "./locales/exercisepage/fr-exercisepage/translation.json";
import translationENExercisePage from "./locales/exercisepage/en-exercisepage/translation.json";

import translationFRSubmittedExercises from "./locales/SubmittedExos/SubmittedExos-fr/translation.json";
import translationENSubmittedExercises from "./locales/SubmittedExos/SubmittedExos-en/translation.json";

import translationFRQuizManagement from "./locales/QuizManagement/QuizManagement-fr/translation.json";
import translationENQuizManagement from "./locales/QuizManagement/QuizManagement-en/translation.json";

import translationFRExerciseManagement from "./locales/ExerciseManagement/ExerciseManagement-fr/translation.json";
import translationENExerciseManagement from "./locales/ExerciseManagement/ExerciseManagement-en/translation.json";

import translationFRCourseManagement from "./locales/CourseManagement/CourseManagement-fr/translation.json";
import translationENCourseManagement from "./locales/CourseManagement/CourseManagement-en/translation.json";

import translationFRValidationCourses from "./locales/ValidationCourses/fr-validationcourses/translation.json";
import translationENValidationCourses from "./locales/ValidationCourses/en-validationcourses/translation.json";

import translationFRDashboardAdmin from "./locales/DashboardAdmin/fr-dashboardadmin/translation.json";
import translationENDashboardAdmin from "./locales/DashboardAdmin/en-dashboardadmin/translation.json";

import translationENForumManagement from "./locales/forumManagement/en/translation.json";
import translationFRForumManagement from "./locales/forumManagement/fr/translation.json";

import translationENBadgesManagement from "./locales/badgesManagement/en/translation.json";
import translationFRBadgesManagement from "./locales/badgesManagement/fr/translation.json";

import translationENStudentsManagement from "./locales/StudentsManagement/en/translation.json";
import translationFRStudentsManagement from "./locales/StudentsManagement/fr/translation.json";

import translationFRSpacesPage from "./locales/addSpace/fr.json";
import translationENSpacesPage from "./locales/addSpace/en.json";

import translationFRInstructors from "./locales/addinstructors/fr.json";
import translationENInstructors from "./locales/addinstructors/en.json";

const resources = {
  fr: {
    translation: translationFR,
    acceuil: translationFRAcceuil,
    login: translationFRLogin,
    signup: translationFRSignup,
    navbar: translationFRNavbar,
    contentPage: translationFRContentPage,
    filters: translationFRFilters,
    courseInfo: translationFRCourseInfo,
    newExercise: translationFRNewExercise,
    exercisePreview: translationFRExercisePreview,
    createQuiz: translationFRCreateQuiz,
    setting: translationFRSetting,
    Dashboard: translationFRDashboard,
    badges: translationFRBadges,
    community: translationFRCommunity,
    courses: frCourses,
    quiz1: translationFRQuiz1,
    quiz2: translationFRquiz2,
    quiz3: translationFRrecquiz,
    myStudents: translationFRMyStudents,
    Spaces: translationFRSpaces,
    exerciceStudent: translationFRExerciceStudent,
    startExercise: translationFRStartExo,
    CourseDetails: translationFRCourseDetails,
    SubmittedExercise: translationFRSubmittedExercise,
    SubmittedExercises: translationFRSubmittedExercises,
    exercisePage: translationFRExercisePage,
    ProgressExercice: translationFRProgressExercice,
    ProgressStudent: translationFRProgressStudent,
    QuizManagement: translationFRQuizManagement,
    ExerciseManagement: translationFRExerciseManagement,
    CoursesManagement: translationFRCourseManagement,
    ValidationCourses: translationFRValidationCourses,
    DashboardAdmin: translationFRDashboardAdmin,
    ForumManagement: translationFRForumManagement,
    BadgesManagement: translationFRBadgesManagement,
    StudentsManagement: translationFRStudentsManagement,
    space: translationFRSpacesPage,
    instructors: translationFRInstructors,
  },

  en: {
    translation: translationEN,
    acceuil: translationENAcceuil,
    login: translationENLogin,
    signup: translationENSignup,
    navbar: translationENNavbar,
    contentPage: translationENContentPage,
    filters: translationENFilters,
    courseInfo: translationENCourseInfo,
    newExercise: translationENNewExercise,
    exercisePreview: translationENExercisePreview,
    createQuiz: translationENCreateQuiz,
    setting: translationENSetting,
    Dashboard: translationENDashboard,
    badges: translationENBadges,
    community: translationENCommunity,
    courses: enCourses,
    quiz1: translationENQuiz1,
    quiz2: translationENquiz2,
    quiz3: translationENrecquiz,
    myStudents: translationENMyStudents,
    Spaces: translationENSpaces,
    exerciceStudent: translationENExerciceStudent,
    startExercise: translationENStartExo,
    CourseDetails: translationENCourseDetails,
    SubmittedExercise: translationENSubmittedExercise,
    SubmittedExercises: translationENSubmittedExercises,
    exercisePage: translationENExercisePage,
    ProgressExercice: translationENProgressExercice,
    ProgressStudent: translationENProgressStudent,
    QuizManagement: translationENQuizManagement,
    ExerciseManagement: translationENExerciseManagement,
    CoursesManagement: translationENCourseManagement,
    ValidationCourses: translationENValidationCourses,
    DashboardAdmin: translationENDashboardAdmin,
    ForumManagement: translationENForumManagement,
    BadgesManagement: translationENBadgesManagement,
    StudentsManagement: translationENStudentsManagement,
    space: translationENSpacesPage,
    instructors: translationENInstructors,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("lang") || "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;
