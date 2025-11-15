import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import LoginE from "../pages/LoginE";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/loginE" element={<LoginE />} />

      </Routes>
    </BrowserRouter>
  );
}
