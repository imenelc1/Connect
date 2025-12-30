// import React from "react";
// import AppRoutes from "./routes/AppRoutes.jsx";
// import { Toaster } from "react-hot-toast";
// <Toaster position="top-center" />

// export default function App() {
//   return <AppRoutes />;
// }

import React from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./context/NotificationContext";
import SessionTracker from "./components/layout/SessionTracker.jsx";

export default function App() {
  // Si token déjà présent dans localStorage, l'ajouter aux headers
  const token = localStorage.getItem("token");

  return (
    <>
     <SessionTracker />
     <NotificationProvider>
      <Toaster position="top-center" />
      <AppRoutes />
    </NotificationProvider>
    </>
  );
}
