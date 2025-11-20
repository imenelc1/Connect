import React from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import { Toaster } from "react-hot-toast";
import "./i18n";
<Toaster position="top-center" />

export default function App() {
  return <AppRoutes />;
}

