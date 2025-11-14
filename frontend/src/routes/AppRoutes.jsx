// src/Routes/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "../pages/StudentSignUp";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Signup />} />
      {/* Plus tard : ajouter d'autres routes comme Signin */}
    </Routes>
  );
};

export default AppRoutes;
