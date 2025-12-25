import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages publiques
import Acceuil from "../pages/Acceuil.jsx";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";
import LoginInstructor from "../pages/LoginInstructor";
import LoginStudent from "../pages/LoginStudent";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Pages privées
import Dashboardens from "../pages/dash-ens";
import Dashboardetu from "../pages/dash-etu";
import Setting from "../pages/Setting";
import AllCoursesPage from "../pages/AllCoursesPage";
import Courses from "../pages/Courses";
import CourseDetails from "../pages/CourseDetails.jsx";
import CoursInfo from "../pages/CoursInfo";
import CourseUpdate from "../pages/CourseUpdate";

// Pages exercices & quiz
import CourseExercisesPage from "../pages/AllExercisesPage";
import ListeExercicesPage from "../pages/ListeExercicesPage";
import StudentExercice from "../pages/exerciceStudent";
import StartExercise from "../pages/CodeExercisePage.jsx";
import ExercisePage from "../pages/ExercisePage";
import TheoryExercisePage from "../pages/TheoryExercisePage.jsx";
import SubmittedExercise from "../pages/SubmittedExercise.jsx";
import SubmittedExercises from "../pages/SubmittedExercises";
import ProgressExercice from "../pages/ProgressionExo";
import ProgressStudent from "../pages/ProgressionStudent";

import NewExercise from "../pages/NewExercice";
import ExercisePreview from "../pages/ExercisePreview";
import UpdateExercice from "../pages/UpdateExercice.jsx";

import AllQuizzesPage from "../pages/AllQuizzesPage";
import CreateQuiz from "../pages/CreateQuiz";
import QuizPreview from "../pages/QuizPreview";
import { QuizTakePage } from "../pages/QuizTakePage.jsx";
import QuizIntroPage from "../pages/QuizIntroPage";
import QuizRecapPage from "../pages/QuizRecapPage";

// Pages admin
import Dashboard from "../pages/Dashboard";
import AdminLogin from "../pages/AdminLogin.jsx";
import CoursesManagement from "../pages/CourseManagement";
import StudentsMangement from "../pages/studentsManagement.jsx";
import BadgesManagement from "../pages/badgesManagement.jsx";
import QuizManagement from "../pages/QuizManagement";
import ExercisesManagement from "../pages/ExerciseManagement";
import ValidationCourses from "../pages/ValidationCourses";
import ForumManagement from "../pages/forumManagement.jsx";
import Badges from "../pages/Badges";
import CommunityPage from "../pages/CommunityPage";
import MyStudents from "../pages/MyStudents";
import Spaces from "../pages/Spaces";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ------------------------- */}
        {/*       ROUTES PUBLIQUES    */}
        {/* ------------------------- */}
        <Route path="/" element={<Acceuil />} />
        <Route path="/choice" element={<Choice />} />
        <Route path="/signup/instructor" element={<InstructorSignup />} />
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/login/instructor" element={<LoginInstructor />} />
        <Route path="/login/student" element={<LoginStudent />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ------------------------- */}
        {/*       ROUTES DASHBOARD    */}
        {/* ------------------------- */}
        <Route path="/dashboard-ens" element={<Dashboardens />} />
        <Route path="/dashboard-etu" element={<Dashboardetu />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/all-courses" element={<AllCoursesPage />} />
        <Route path="/course-details/:id" element={<CourseDetails />} />
        <Route path="/courses/edit/:id" element={<CourseUpdate />} />
        <Route path="/see-courses/:id" element={<Courses />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/my-students" element={<MyStudents />} />
        <Route path="/spaces" element={<Spaces />} />

        {/* ------------------------- */}
        {/*       ROUTES EXERCICES & QUIZ */}
        {/* ------------------------- */}
        <Route path="/all-exercises" element={<CourseExercisesPage />} />
        <Route path="/liste-exercices/:coursId" element={<ListeExercicesPage />} />
        <Route path="/student-exercice" element={<StudentExercice />} />
        <Route path="/exercise-page" element={<ExercisePage />} />
        <Route path="/start-exercise/:exerciceId" element={<TheoryExercisePage />} />
        <Route path="/start-exercise-code/:exerciceId" element={<StartExercise />} />
        <Route path="/submitted-exercise/:tentativeId" element={<SubmittedExercise />} />
        <Route path="/submitted-exercises" element={<SubmittedExercises />} />
        <Route path="/progress-exercice" element={<ProgressExercice />} />
        <Route path="/progress-student" element={<ProgressStudent />} />
        <Route path="/new-exercise" element={<NewExercise />} />
        <Route path="/exercise-preview" element={<ExercisePreview />} />
        <Route path="/exercices/edit/:id" element={<UpdateExercice />} />

        <Route path="/all-quizzes" element={<AllQuizzesPage />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/quiz/edit/:exerciceId" element={<UpdateExercice />} />
        <Route path="/quiz-preview" element={<QuizPreview />} />
        <Route path="/quiz-intro/:exerciceId" element={<QuizIntroPage />} />
        <Route path="/quizTake/:exerciceId" element={<QuizTakePage />} />
        <Route path="/quiz-recap/:exerciceId" element={<QuizRecapPage />} />

        {/* ------------------------- */}
        {/*       ROUTES ADMIN        */}
        {/* ------------------------- */}
        <Route path="/dashboard-admin" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/course-management" element={<CoursesManagement />} />
        <Route path="/students-management" element={<StudentsMangement />} />
        <Route path="/badges-management" element={<BadgesManagement />} />
        <Route path="/quiz-management" element={<QuizManagement />} />
        <Route path="/exercises-management" element={<ExercisesManagement />} />
        <Route path="/validation-courses" element={<ValidationCourses />} />
        <Route path="/forum-management" element={<ForumManagement />} />
      </Routes>
    </BrowserRouter>
  );
}
