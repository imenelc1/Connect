import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Si pas connecté → déterminer vers quel login aller
  if (!user) {
    const isTeacherPage = location.pathname.includes("ens"); 
    return (
      <Navigate
        to={isTeacherPage ? "/login/instructor" : "/login/student"}
        replace
      />
    );
  }

  return children;
}
