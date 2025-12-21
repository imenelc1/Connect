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
import CourseUpdate from "../pages/CourseUpdate";
import CoursInfo from "../pages/CoursInfo";

// Pages Exos & Quiz (version 1)
import CourseExercisesPage from "../pages/AllExercisesPage";
import AllQuizzesPage from "../pages/AllQuizzesPage";
import NewExercise from "../pages/NewExercice";
import ExercisePreview from "../pages/ExercisePreview";
import ListeExercicesPage from "../pages/ListeExercicesPage";
import StudentExercice from "../pages/exerciceStudent";
import StartExercise from "../pages/CodeExercisePage.jsx";
import ExercisePage from "../pages/ExercisePage";
import TheoryExercisePage from "../pages/TheoryExercisePage.jsx";
import SubmittedExercise from "../pages/SubmittedExercise.jsx";
import SubmittedExercises from "../pages/SubmittedExercises";
import ProgressExercice from "../pages/ProgressionExo";
import ProgressStudent from "../pages/ProgressionStudent";
import QuizPage1 from "../pages/QuizIntroPage";
import QuizPage2 from "../pages/QuizTakePage";
import QuizRecapPage from "../pages/QuizRecapPage";
import UpdateExercice from "../pages/UpdateExercice.jsx";
import CreateQuiz from "../pages/CreateQuiz";

// Community, Badges, Spaces, Students
import CommunityPage from "../pages/CommunityPage";
import Badges from "../pages/Badges";
import MyStudents from "../pages/MyStudents";
import Spaces from "../pages/Spaces";

// Admin / Management
import QuizManagement from "../pages/QuizManagement";
import ExercisesManagement from "../pages/ExerciseManagement";
import CoursesManagement from "../pages/CourseManagement";
import ValidationCourses from "../pages/ValidationCourses";
import Dashboard from "../pages/Dashboard";
import AdminLogin from "../pages/AdminLogin.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ------------------------- */}
        {/*       ROUTES PUBLIQUES    */}
        {/* ------------------------- */}
        <Route path="/" element={<Acceuil />} />
        <Route path="/choice" element={<Choice />} />

        {/* Signup */}
        <Route path="/signup/instructor" element={<InstructorSignup />} />
        <Route path="/signup/student" element={<StudentSignup />} />

        {/* Login */}
        <Route path="/login/instructor" element={<LoginInstructor />} />
        <Route path="/login/student" element={<LoginStudent />} />

        {/* Password reset */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ------------------------- */}
        {/*       ROUTES COURS       */}
        {/* ------------------------- */}
        <Route path="/dashboard-ens" element={<Dashboardens />} />
        <Route path="/dashboard-etu" element={<Dashboardetu />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/all-courses" element={<AllCoursesPage />} />
        <Route path="/CoursInfo" element={<CoursInfo />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/edit/:id" element={<CourseUpdate />} />
        <Route path="/CourseDetails/:id" element={<CourseDetails />} />
        <Route path="/Seecourses/:id" element={<Courses />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/my-students" element={<MyStudents />} />
        <Route path="/spaces" element={<Spaces />} />

        {/* ------------------------- */}
        {/*       ROUTES EXOS & QUIZ */}
        {/* ------------------------- */}
        <Route path="/all-exercises" element={<CourseExercisesPage />} />
        <Route path="/all-quizzes" element={<AllQuizzesPage />} />
        <Route path="/new-exercise" element={<NewExercise />} />
        <Route path="/exercise-preview" element={<ExercisePreview />} />
        <Route path="/ListeExercices/:coursId" element={<ListeExercicesPage />} />
        <Route path="/student-exercice" element={<StudentExercice />} />
        <Route path="/progressExercice" element={<ProgressExercice />} />
        <Route path="/progressStudent" element={<ProgressStudent />} />
        <Route path="/quiz1/:exerciceId" element={<QuizPage1 />} />
        <Route path="/quiz/:exerciceId" element={<QuizPage2 />} />
        <Route path="/quiz3" element={<QuizRecapPage />} />
        <Route path="/exercise-page" element={<ExercisePage />} />
        <Route path="/course-details" element={<CourseDetails />} />
        <Route path="/SubmittedExo" element={<SubmittedExercise />} />
        <Route path="/SubmittedExos" element={<SubmittedExercises />} />
        <Route path="/start-exerciseCode/:exerciceId" element={<StartExercise />} />
        <Route path="/start-exercise/:exerciceId" element={<TheoryExercisePage />} />

        <Route path="/submitted-exercise/:tentativeId"element={<SubmittedExercise />}/>

        <Route path="/exercices/edit/:id" element={<UpdateExercice />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />

        {/* ------------------------- */}
        {/*       ROUTES ADMIN        */}
        {/* ------------------------- */}
        <Route path="/QuizManagement" element={<QuizManagement />} />
        <Route path="/ExerciseManagement" element={<ExercisesManagement />} />
        <Route path="/CourseManagement" element={<CoursesManagement />} />
        <Route path="/ValidationCourses" element={<ValidationCourses />} />
        <Route path="/Dashboard-admin" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}
