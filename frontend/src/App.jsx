import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import StudentSignup from "./pages/StudentSignUp";
import InstructorSignup from "./pages/InstructorSignUp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/signup/instructor" element={<InstructorSignup />} />
        <Route path="*" element={<Navigate to="/signup/student" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
