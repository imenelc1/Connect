import React from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import { Toaster } from "react-hot-toast";

export default function App() {
  // Si token déjà présent dans localStorage, l'ajouter aux headers
  const token = localStorage.getItem("token");

  return (
    <>
      <Toaster position="top-center" />
      <AppRoutes />
    </>
  );
}
