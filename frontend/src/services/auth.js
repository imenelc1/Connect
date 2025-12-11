import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Récupération sécurisée du user
    const storedUser = localStorage.getItem("user");
    let parsedUser = null;

    try {
      parsedUser = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("Erreur JSON du user :", err);
      localStorage.removeItem("user");
    }

    setUser(parsedUser);

    // Récupération du token
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
