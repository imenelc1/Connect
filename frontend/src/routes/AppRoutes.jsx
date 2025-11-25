import { BrowserRouter, Routes, Route } from "react-router-dom";
import Acceuil from "../pages/Acceuil";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";
import LoginInstructor from "../pages/LoginInstructor";
import LoginStudent from "../pages/LoginStudent";
import NewExercice from "../pages/NewExercice";
import ExercisePreview from "../pages/ExercisePreview";

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

        {/* NEW EXERCICE  */}
        <Route path="/exercices/new" element={<NewExercice />} />
          {/* PREVIEW EXERCISE  */}
        <Route path="/exercices/Preview" element={<ExercisePreview />} />

      </Routes>
    </BrowserRouter>
  );
}
