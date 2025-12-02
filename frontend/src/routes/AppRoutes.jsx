import { BrowserRouter, Routes, Route } from "react-router-dom";
import Acceuil from "../pages/Acceuil";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";
import LoginInstructor from "../pages/LoginInstructor";
import LoginStudent from "../pages/LoginStudent";
import AllCoursesPage from "../pages/AllCoursesPage";
import NewExercise from "../pages/NewExercice";
import ExercisePreview from "../pages/ExercisePreview";
import AllExercisesPage from "../pages/AllExercisesPage";
import AllQuizzesPage from "../pages/AllQuizzesPage";
import CoursInfo from "../pages/CoursInfo";
import CommunityPage from "../pages/CommunityPage";
import CreateQuiz from "../pages/CreateQuiz";
import QuizPreview from "../pages/QuizPreview";
import Setting from "../pages/Setting";
import Dashboardens from "../pages/dash-ens";
import Dashboardetu from "../pages/dash-etu";

import Badges from "../pages/Badges"; // Ajoutez cette lign

import Courses from "../pages/Courses";
import MyStudents from "../pages/MyStudents";
import Spaces from "../pages/Spaces";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import ListeExercicesPage from "../pages/ListeExercicesPage";
import { QuizPage2 } from "../pages/QuizPage2";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Acceuil />} />
        <Route path="/choice" element={<Choice />} />

        {/* SIGNUP */}
        {/* SIGNUP */}
        <Route path="/signup/instructor" element={<InstructorSignup />} />
        <Route path="/signup/student" element={<StudentSignup />} />

        {/* LOGIN */}
        <Route path="/login/instructor" element={<LoginInstructor />} />
        <Route path="/login/student" element={<LoginStudent />} />

        {/* ALL COURSES */}
        <Route path="/all-courses" element={<AllCoursesPage />} />
        {/* ALL Exercises */}
        <Route path="/all-exercises" element={<AllExercisesPage />} />
        {/* ALL QUIZZES */}
        <Route path="/all-quizzes" element={<AllQuizzesPage />} />

        {/* ALL EXERCISES */}
        <Route path="/all-exercises" element={<AllExercisesPage />} />

        {/* ALL QUIZZES */}
        <Route path="/all-quizzes" element={<AllQuizzesPage />} />

        {/* NEW */}
        <Route path="/new-exercise" element={<NewExercise />} />
        <Route path="/exercise-preview" element={<ExercisePreview />} />

        {/* COURSE INFO */}
        <Route path="/CoursInfo" element={<CoursInfo />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/preview" element={<QuizPreview />} />

        {/* COMMUNITY PAGE */}
        <Route path="/community" element={<CommunityPage />} />
        {/*settings*/}
        <Route path="/settings" element={<Setting />} />
        {/*dashboard*/}
        <Route path="/dashboard-ens" element={<Dashboardens />} />
        <Route path="/dashboard-etu" element={<Dashboardetu />} />

        <Route path="/badges" element={<Badges />} />
        {/*new exercise*/}
        <Route path="/new-exercise" element={<NewExercise />} />
        <Route path="/exercise-preview" element={<ExercisePreview />} />
        {/* courses */}
        <Route path="/courses" element={<Courses />} />
        {/*new course*/}
        <Route path="/CoursInfo" element={<CoursInfo />} />
        {/* My Students */}
        <Route path="/my-students" element={<MyStudents />} />
        {/* Spaces */}
        <Route path="/spaces" element={<Spaces />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/ListeExercices" element={<ListeExercicesPage />} />



          <Route path="/quiz" element={<QuizPage2 />} />



      </Routes>
    </BrowserRouter>
  );
}
