import { BrowserRouter, Routes, Route } from "react-router-dom";
import Acceuil from "../pages/acceuil";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";
import LoginInstructor from "../pages/LoginInstructor";
import LoginStudent from "../pages/LoginStudent";
import AllCoursesPage from "../pages/AllCoursesPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/acceuil" element={<Acceuil />} />
        <Route path="/choice" element={<Choice />} />

       {/* SIGNUP */}
        <Route path="/signup/instructor" element={<InstructorSignup />} />
        <Route path="/signup/student" element={<StudentSignup />} />

        {/* LOGIN */}
        <Route path="/login/instructor" element={<LoginInstructor />} />
        <Route path="/login/student" element={<LoginStudent />} />

        <Route path="/all-courses" element={<AllCoursesPage />} />

      </Routes>
    </BrowserRouter>
  );
}
