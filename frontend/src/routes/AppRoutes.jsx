 import { BrowserRouter, Routes, Route } from "react-router-dom";
import Acceuil from "../pages/Acceuil";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";
import LoginInstructor from "../pages/LoginInstructor";
import LoginStudent from "../pages/LoginStudent";
import CreateQuiz from "../pages/CreateQuiz"; // Ajoutez cette ligne
import QuizPreview from "../pages/QuizPreview"; // Ajoutez cette lign
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
        {/* QUIZ */}
        <Route path="/create-quiz" element={<CreateQuiz />} /> {/* Ajoutez cette ligne */}
          <Route path="/preview" element={<QuizPreview />} />
      </Routes>
      
    </BrowserRouter>
  );
}
