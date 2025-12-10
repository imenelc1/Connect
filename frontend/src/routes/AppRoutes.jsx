import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Pages publiques
import Acceuil from "../pages/Acceuil.jsx";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";
import LoginInstructor from "../pages/LoginInstructor";
import LoginStudent from "../pages/LoginStudent";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Pages privées (protégées)
import Dashboardens from "../pages/dash-ens";
import Dashboardetu from "../pages/dash-etu";
import Setting from "../pages/Setting";
import AllCoursesPage from "../pages/AllCoursesPage";
import AllExercisesPage from "../pages/AllExercisesPage";
import AllQuizzesPage from "../pages/AllQuizzesPage";
import NewExercise from "../pages/NewExercice";
import ExercisePreview from "../pages/ExercisePreview";
import CoursInfo from "../pages/CoursInfo";
import CreateQuiz from "../pages/CreateQuiz";
import QuizPreview from "../pages/QuizPreview";
import CourseUpdate from "../pages/CourseUpdate";
import CommunityPage from "../pages/CommunityPage";
import Badges from "../pages/Badges";
import Courses from "../pages/Courses";
import MyStudents from "../pages/MyStudents";
import Spaces from "../pages/Spaces";
import ListeExercicesPage from "../pages/ListeExercicesPage";
import StudentExercice from "../pages/exerciceStudent";
import StartExercise from "../pages/StartExercise";
import ExercisePage from "../pages/ExercisePage";
import CourseDetails from "../pages/CourseDetails.jsx";
import SubmittedExercise from "../pages/SubmittedExercise.jsx";
import ProgressExercice from "../pages/ProgressionExo";
import ProgressStudent from "../pages/ProgressionStudent";
import { QuizPage2 } from "../pages/QuizPage2";
import QuizPage1 from "../pages/QuizPage1";
import QuizRecapPage from "../pages/QuizRecapPage";
import SubmittedExercises from "../pages/SubmittedExercises";

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
        {/*       ROUTES PROTÉGÉES   */}
        {/* ------------------------- */}
        <Route
          path="/dashboard-ens"
          element={
            <ProtectedRoute>
              <Dashboardens />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard-etu"
          element={
            <ProtectedRoute>
              <Dashboardetu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />

        <Route
          path="/all-courses"
          element={
            <ProtectedRoute>
              <AllCoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/all-exercises"
          element={
            <ProtectedRoute>
              <AllExercisesPage />
            </ProtectedRoute>
          }
        />

        {/* QUIZ AND EXERCISE PAGES */}

        <Route
          path="/SubmittedExo"
          element={
            <ProtectedRoute>
              <SubmittedExercise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/SubmittedExos"
          element={
            <ProtectedRoute>
              <SubmittedExercises />
            </ProtectedRoute>
          }
        />

        <Route
          path="/all-quizzes"
          element={
            <ProtectedRoute>
              <AllQuizzesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-exercise"
          element={
            <ProtectedRoute>
              <NewExercise />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exercise-preview"
          element={
            <ProtectedRoute>
              <ExercisePreview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/CoursInfo"
          element={
            <ProtectedRoute>
              <CoursInfo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-quiz"
          element={
            <ProtectedRoute>
              <CreateQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preview"
          element={
            <ProtectedRoute>
              <QuizPreview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/edit/:id"
          element={
            <ProtectedRoute>
              <CourseUpdate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/badges"
          element={
            <ProtectedRoute>
              <Badges />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-students"
          element={
            <ProtectedRoute>
              <MyStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/spaces"
          element={
            <ProtectedRoute>
              <Spaces />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ListeExercices"
          element={
            <ProtectedRoute>
              <ListeExercicesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-exercice"
          element={
            <ProtectedRoute>
              <StudentExercice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progressExercice"
          element={
            <ProtectedRoute>
              <ProgressExercice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progressStudent"
          element={
            <ProtectedRoute>
              <ProgressStudent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz1"
          element={
            <ProtectedRoute>
              <QuizPage1 />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <QuizPage2 />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz3"
          element={
            <ProtectedRoute>
              <QuizRecapPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/start-exercise"
          element={
            <ProtectedRoute>
              <StartExercise />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exercise-page"
          element={
            <ProtectedRoute>
              <ExercisePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course-details"
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/submitted-exercise"
          element={
            <ProtectedRoute>
              <SubmittedExercise />
            </ProtectedRoute>
          }
        />

        

        {/* Course details */}
       <Route path="/CourseDetails/:id" element={<CourseDetails />} />
        {/* Students */}
        <Route path="/MyStudents" element={<MyStudents />} />
      </Routes>
    </BrowserRouter>
  );
}
