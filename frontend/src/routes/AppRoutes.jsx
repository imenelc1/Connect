import { BrowserRouter, Routes, Route } from "react-router-dom";
import Acceuil from "../pages/Acceuil";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Acceuil />} />
        <Route path="/choice" element={<Choice />} />

        <Route path="/student-signup" element={<StudentSignup />} />
        <Route path="/instructor-signup" element={<InstructorSignup />} />
      </Routes>
    </BrowserRouter>
  );
}
