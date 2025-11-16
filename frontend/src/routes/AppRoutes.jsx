import React from "react";
import { Routes, Route } from "react-router-dom";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/student-signup" element={<StudentSignup />} />
      <Route path="/instructor-signup" element={<InstructorSignup />} />
      {/* Ajoutez d'autres routes ici */}
    </Routes>
  );
};

export default AppRoutes;
