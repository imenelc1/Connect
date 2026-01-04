import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "../context/PrivateRoute.jsx";

/* ================= PUBLIC ================= */
import Acceuil from "../pages/Acceuil.jsx";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";
import LoginInstructor from "../pages/LoginInstructor";
import LoginStudent from "../pages/LoginStudent";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import WelcomeResetPassword from "../pages/WelcomeResetPassword.jsx";

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
import SubmittedExoTheory from "../pages/SubmittedExoTheory.jsx";

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
import VoirCoursAdmin from "../pages/VoirCoursAdmin.jsx";
import VoirQuizAdmin from "../pages/VoirQuizAdmin.jsx";

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
        <Route path="/welcome-reset-password/:token" element={<WelcomeResetPassword />} />

        {/* ========= DASHBOARDS ========= */}
        <Route path="/dashboard-etu" element={
          <PrivateRoute allowedRoles={["etudiant"]}>
            <Dashboardetu />
          </PrivateRoute>
        }/>
        <Route path="/dashboard-ens" element={
          <PrivateRoute allowedRoles={["enseignant"]}>
            <Dashboardens />
          </PrivateRoute>
        }/>
        <Route path="/dashboard-admin" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Dashboard />
          </PrivateRoute>
        }/>

        {/* ========= COMMON ========= */}
        <Route path="/settings" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <Setting />
          </PrivateRoute>
        }/>
        <Route path="/community" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <CommunityPage />
          </PrivateRoute>
        }/>
        <Route path="/badges" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <Badges />
          </PrivateRoute>
        }/>
        <Route path="/my-students" element={
          <PrivateRoute allowedRoles={["enseignant"]}>
            <MyStudents />
          </PrivateRoute>
        }/>
        <Route path="/spaces" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <Spaces />
          </PrivateRoute>
        }/>

        {/* ========= COURSES ========= */}
        <Route path="/all-courses" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <AllCoursesPage />
          </PrivateRoute>
        }/>
        <Route path="/CourseDetails/:id" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <CourseDetails />
          </PrivateRoute>
        }/>
        <Route path="/course-details" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <CourseDetails />
          </PrivateRoute>
        }/>
        <Route path="/Seecourses/:id" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <Courses />
          </PrivateRoute>
        }/>
        <Route path="/courses/edit/:id" element={
          <PrivateRoute allowedRoles={["enseignant"]}>
            <CourseUpdate />
          </PrivateRoute>
        }/>
        <Route path="/courses" element={
          <PrivateRoute allowedRoles={["enseignant"]}>
            <CourseUpdate />
          </PrivateRoute>
        }/>
        <Route path="/CoursInfo" element={
          <PrivateRoute allowedRoles={["enseignant","admin"]}>
            <CoursInfo />
          </PrivateRoute>
        }/>

        {/* ========= EXERCISES ========= */}
        <Route path="/all-exercises" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <AllExercisesPage />
          </PrivateRoute>
        }/>
        <Route path="/ListeExercices" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <CourseExercisesPage />
          </PrivateRoute>
        }/>
        <Route path="/ListeExercices/:coursId" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <ListeExercicesPage />
          </PrivateRoute>
        }/>
        <Route path="/student-exercice" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <StudentExercice />
          </PrivateRoute>
        }/>
        <Route path="/student-exercises/:studentId" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <StudentExercice />
          </PrivateRoute>
        }/>
        <Route path="/students/:studentId/progression" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <ProgressExercice />
          </PrivateRoute>
        }/>
        <Route path="/start-exercise/:exerciceId" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <TheoryExercisePage />
          </PrivateRoute>
        }/>
        <Route path="/start-exerciseCode/:exerciceId" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <CodeExercisePage />
          </PrivateRoute>
        }/>
        <Route path="/submitted-exercise/:tentativeId" element={
          <PrivateRoute allowedRoles={["etudiant"]}>
            <SubmittedExercise />
          </PrivateRoute>
        }/>
        <Route path="/SubmittedExos" element={
          <PrivateRoute allowedRoles={["etudiant"]}>
            <SubmittedExercises />
          </PrivateRoute>
        }/>
        <Route path="/submitted-exercise-theory/:tentativeId" element={
          <PrivateRoute allowedRoles={["etudiant"]}>
            <SubmittedExoTheory />
          </PrivateRoute>
        }/>
        <Route path="/submitted-exercise-theory/" element={
          <PrivateRoute allowedRoles={["etudiant"]}>
            <SubmittedExoTheory />
          </PrivateRoute>
        }/>
        <Route path="/progress-exercice" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <ProgressExercice />
          </PrivateRoute>
        }/>
        <Route path="/progress-student/" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <ProgressStudent />
          </PrivateRoute>
        }/>
        <Route path="/new-exercise" element={
          <PrivateRoute allowedRoles={["enseignant"]}>
            <NewExercise />
          </PrivateRoute>
        }/>
        <Route path="/exercise-preview" element={
          <PrivateRoute allowedRoles={["enseignant"]}>
            <ExercisePreview />
          </PrivateRoute>
        }/>
        <Route path="/exercices/edit/:id" element={
          <PrivateRoute allowedRoles={["enseignant"]}>
            <UpdateExercice />
          </PrivateRoute>
        }/>

        {/* ========= QUIZZES ========= */}
        <Route path="/all-quizzes" element={
          <PrivateRoute allowedRoles={["etudiant","enseignant","admin"]}>
            <AllQuizzesPage />
          </PrivateRoute>
        }/>
        <Route path="/create-quiz" element={
          <PrivateRoute allowedRoles={["enseignant"]}>
            <CreateQuiz />
          </PrivateRoute>
        }/>
        <Route path="/quiz-preview/:exerciceId" element={
          <PrivateRoute allowedRoles={["enseignant"]}>
            <QuizPreview />
          </PrivateRoute>
        }/>
        <Route path="/quiz-intro/:exerciceId" element={
          <PrivateRoute allowedRoles={["etudiant"]}>
            <QuizIntroPage />
          </PrivateRoute>
        }/>
        <Route path="/quizTake/:exerciceId" element={
          <PrivateRoute allowedRoles={["etudiant"]}>
            <QuizTakePage />
          </PrivateRoute>
        }/>
        <Route path="/QuizRecape/:exerciceId" element={
          <PrivateRoute allowedRoles={["etudiant"]}>
            <QuizRecapPage />
          </PrivateRoute>
        }/>
        <Route path="/quiz/edit/:exerciceId" element={
          <PrivateRoute allowedRoles={["enseignant"]}>
            <UpdateQuiz />
          </PrivateRoute>
        }/>

        {/* ========= ADMIN ========= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/CourseManagement" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <CoursesManagement />
          </PrivateRoute>
        }/>
        <Route path="/ExerciseManagement" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <ExercisesManagement />
          </PrivateRoute>
        }/>
        <Route path="/badgesManagement" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <BadgesManagement />
          </PrivateRoute>
        }/>
        <Route path="/QuizManagement" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <QuizManagement />
          </PrivateRoute>
        }/>
        <Route path="/StudentsManagement" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <StudentsManagement />
          </PrivateRoute>
        }/>
        <Route path="/validation-courses" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <ValidationCourses />
          </PrivateRoute>
        }/>
        <Route path="/ForumManagement" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <ForumManagement />
          </PrivateRoute>
        }/>
        <Route path="/SpacesManagement" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <SpacesManagement />
          </PrivateRoute>
        }/>
        <Route path="/InstructorsManagement" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <InstructorsManagement />
          </PrivateRoute>
        }/>
        <Route path="/cours/:id_cours" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <VoirCoursAdmin />
          </PrivateRoute>
        }/>
        <Route path="/Voir-quiz/:exerciceId" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <VoirQuizAdmin />
          </PrivateRoute>
        }/>

      </Routes>
    </BrowserRouter>
  );
}
