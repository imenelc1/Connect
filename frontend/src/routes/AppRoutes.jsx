import { BrowserRouter, Routes, Route } from "react-router-dom";
import Acceuil from "../pages/Acceuil";
import Choice from "../pages/Choice";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Acceuil />} />
        <Route path="/choice" element={<Choice />} />
      </Routes>
    </BrowserRouter>
  );
}
