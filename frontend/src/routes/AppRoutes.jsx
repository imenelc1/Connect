import { Routes, Route, Navigate } from "react-router-dom";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student-signup" />} />

      <Route path="/student-signup" element={<StudentSignup />} />
      <Route path="/instructor-signup" element={<InstructorSignup />} />
    </Routes>
  );
};

export default AppRoutes;
