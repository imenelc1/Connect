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

        {/*new exercise*/}
        <Route path="/new-exercise" element={<NewExercise />} />
        <Route path="/exercise-preview" element={<ExercisePreview />} />

        {/*new course*/}
        <Route path="/CoursInfo" element={<CoursInfo />} />



      </Routes>
    </BrowserRouter>
  );
}
