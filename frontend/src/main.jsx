// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import DarkModeHandler from "./context/DarkModeHandler.jsx";
import "./styles/index.css";
import "./i18n";  

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <DarkModeHandler />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
