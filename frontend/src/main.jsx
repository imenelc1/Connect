// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import DarkModeHandler from "./context/DarkModeHandler.jsx";
import "./styles/index.css";
import "./i18n";  
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <DarkModeHandler />
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
