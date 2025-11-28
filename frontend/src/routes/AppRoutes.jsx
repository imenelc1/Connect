import { BrowserRouter, Routes, Route } from "react-router-dom";
import Acceuil from "../pages/acceuil";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";
import LoginInstructor from "../pages/LoginInstructor";
import LoginStudent from "../pages/LoginStudent";
import AllCoursesPage from "../pages/AllCoursesPage";
import NewExercise from "../pages/NewExercice";
import ExercisePreview from "../pages/ExercisePreview";
import CoursInfo from "../pages/CoursInfo";
import AllExercisesPage from "../pages/AllExercisesPage";
import AllQuizzesPage from "../pages/AllQuizzesPage";
import CreateQuiz from "../pages/CreateQuiz";
import QuizPreview from "../pages/QuizPreview";
import Setting from "../pages/Setting";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Acceuil />} />
        <Route path="/choice" element={<Choice />} />

       {/* SIGNUP */}
        <Route path="/signup/instructor" element={<InstructorSignup />} />
        <Route path="/signup/student" element={<StudentSignup />} />

        {/* LOGIN */}
        <Route path="/login/instructor" element={<LoginInstructor />} />
        <Route path="/login/student" element={<LoginStudent />} />

        {/* ALL COURSES */}
        <Route path="/all-courses" element={<AllCoursesPage />} />

        {/* ALL EXERCISES */}
        <Route path="/all-exercises" element={<AllExercisesPage />} />

        {/* ALL QUIZZES */}
        <Route path="/all-quizzes" element={<AllQuizzesPage />} />

        {/*new exercise*/}
        <Route path="/new-exercise" element={<NewExercise />} />
        <Route path="/exercise-preview" element={<ExercisePreview />} />

        {/*new course*/}
        <Route path="/CoursInfo" element={<CoursInfo />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/preview" element={<QuizPreview />} />

        {/*settings*/}
        <Route path="/settings" element={<Setting />} />

      </Routes>
    </BrowserRouter>
  );
}
