import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./AuthContext";

export const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // loader pendant que le contexte charge
  }

  if (!user) {
    // pas connecté → redirige vers login
    return <Navigate to="/login/student" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // rôle non autorisé → redirige vers login approprié selon rôle
    if (user.role === "etudiant") return <Navigate to="/dashboard-etu" replace />;
    if (user.role === "instructor") return <Navigate to="/dashboard-inst" replace />;
    return <Navigate to="/" replace />; // fallback
  }

  return children;
};
