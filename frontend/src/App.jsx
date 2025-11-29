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

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-center" />
    </>
  );
}
