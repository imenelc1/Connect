import { BrowserRouter, Routes, Route } from "react-router-dom";

/* ================= PUBLIC ================= */
import Acceuil from "../pages/Acceuil.jsx";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";
import LoginInstructor from "../pages/LoginInstructor";
import LoginStudent from "../pages/LoginStudent";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

/* ================= DASHBOARDS ================= */
import Dashboardens from "../pages/dash-ens";
import Dashboardetu from "../pages/dash-etu";
import Dashboard from "../pages/Dashboard";

/* ================= COMMON ================= */
import Setting from "../pages/Setting";
import CommunityPage from "../pages/CommunityPage";
import Badges from "../pages/Badges";
import MyStudents from "../pages/MyStudents";
import Spaces from "../pages/Spaces";
import WelcomeResetPassword from "../pages/WelcomeResetPassword.jsx";

/* ================= COURSES ================= */
import AllCoursesPage from "../pages/AllCoursesPage";
import CourseDetails from "../pages/CourseDetails.jsx";
import Courses from "../pages/Courses";
import CourseUpdate from "../pages/CourseUpdate";
import CoursInfo from "../pages/CoursInfo";

/* ================= EXERCISES ================= */
import AllExercisesPage from "../pages/AllExercisesPage";
import CourseExercisesPage from "../pages/AllExercisesPage";
import ListeExercicesPage from "../pages/ListeExercicesPage";
import StudentExercice from "../pages/exerciceStudent";
import TheoryExercisePage from "../pages/TheoryExercisePage.jsx";
import CodeExercisePage from "../pages/CodeExercisePage.jsx";
import SubmittedExercise from "../pages/SubmittedExercise.jsx";
import SubmittedExercises from "../pages/SubmittedExercises";
import NewExercise from "../pages/NewExercice";
import ExercisePreview from "../pages/ExercisePreview";
import UpdateExercice from "../pages/UpdateExercice.jsx";
import ProgressExercice from "../pages/ProgressionExo";
import ProgressStudent from "../pages/ProgressionStudent";

/* ================= QUIZZES ================= */
import AllQuizzesPage from "../pages/AllQuizzesPage";
import CreateQuiz from "../pages/CreateQuiz";
import QuizPreview from "../pages/QuizPreview";
import QuizIntroPage from "../pages/QuizIntroPage";
import { QuizTakePage } from "../pages/QuizTakePage.jsx";
import QuizRecapPage from "../pages/QuizRecapPage";

/* ================= ADMIN ================= */
import AdminLogin from "../pages/AdminLogin.jsx";
import CoursesManagement from "../pages/CourseManagement";
import BadgesManagement from "../pages/badgesManagement.jsx";
import QuizManagement from "../pages/QuizManagement";
import ExercisesManagement from "../pages/ExerciseManagement";
import ValidationCourses from "../pages/ValidationCourses";
import ForumManagement from "../pages/forumManagement.jsx";
import SpacesManagement from "../pages/SpacesManagement.jsx";
import InstructorsManagement from "../pages/InstructorsManagement.jsx";
import StudentsManagement from "../pages/studentsManagement.jsx";
import UpdateQuiz from "../pages/UpdateQuiz.jsx";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========= PUBLIC ========= */}
        <Route path="/" element={<Acceuil />} />
        <Route path="/choice" element={<Choice />} />
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/signup/instructor" element={<InstructorSignup />} />
        <Route path="/login/student" element={<LoginStudent />} />
        <Route path="/login/instructor" element={<LoginInstructor />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ========= DASHBOARDS ========= */}
        <Route path="/dashboard-etu" element={<Dashboardetu />} />
        <Route path="/dashboard-ens" element={<Dashboardens />} />
        <Route path="/dashboard-admin" element={<Dashboard />} />

        {/* ========= COMMON ========= */}
        <Route path="/settings" element={<Setting />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/badges" element={<Badges/>} />
        <Route path="/my-students" element={<MyStudents />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/welcome-reset-password/:token" element={<WelcomeResetPassword />} />


        {/* ========= COURSES ========= */}
        <Route path="/all-courses" element={<AllCoursesPage />} />
        <Route path="/CourseDetails/:id" element={<CourseDetails />} />
        <Route path="/course-details" element={<CourseDetails />} />
        <Route path="/Seecourses/:id" element={<Courses />} />
        <Route path="/courses/edit/:id" element={<CourseUpdate />} />
        <Route path="/courses" element={<CourseUpdate />} />
        <Route path="/CoursInfo" element={<CoursInfo />} />

        {/* ========= EXERCISES ========= */}
        <Route path="/all-exercises" element={<AllExercisesPage />} />
        <Route path="/ListeExercices" element={<CourseExercisesPage />} />
        <Route path="/ListeExercices/:coursId" element={<ListeExercicesPage />} />

        <Route path="/student-exercice" element={<StudentExercice />} />
        <Route path="/student-exercises/:studentId" element={<StudentExercice />} />
        <Route path="/students/:studentId/progression" element={<ProgressExercice />} />
        
        <Route path="/start-exercise/:exerciceId" element={<TheoryExercisePage />} />
        <Route path="/start-exerciseCode/:exerciceId" element={<CodeExercisePage />} />
        <Route path="/submitted-exercise/:tentativeId" element={<SubmittedExercise />} />
        <Route path="/SubmittedExos" element={<SubmittedExercises />} />
        <Route path="/progress-exercice" element={<ProgressExercice />} />
       
        <Route path="/progress-student/" element={<ProgressStudent />} />
        <Route path="/new-exercise" element={<NewExercise />} />
        <Route path="/exercise-preview" element={<ExercisePreview />} />
        <Route path="/exercices/edit/:id" element={<UpdateExercice />} />
       

         {/* ========= QUIZZES ========= */}
       <Route path="/all-quizzes" element={<AllQuizzesPage />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/quiz-preview/:exerciceId" element={<QuizPreview />} />
        <Route path="/quiz-intro/:exerciceId" element={<QuizIntroPage />} />
        <Route path="/quizTake/:exerciceId" element={<QuizTakePage />} />
        <Route path="/QuizRecape/:exerciceId" element={<QuizRecapPage />} />
        <Route path="/quiz/edit/:exerciceId" element={<UpdateQuiz />} />
        {/* ========= ADMIN ========= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/CourseManagement" element={<CoursesManagement />} />
        <Route path="/ExerciseManagement" element={<ExercisesManagement />} />
        <Route path="/badgesManagement" element={<BadgesManagement />} />
        <Route path="/QuizManagement" element={<QuizManagement />} />
        <Route path="/StudentsManagement" element={<StudentsManagement />} />
        <Route path="/validation-courses" element={<ValidationCourses />} />
        <Route path="/ForumManagement" element={<ForumManagement />} />
         <Route path="/SpacesManagement" element={<SpacesManagement />} />
         <Route path="/InstructorsManagement" element={<InstructorsManagement />} />

   
      </Routes>
    </BrowserRouter>
  );
}