import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Charger la session au démarrage
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = jwtDecode(token);

        setUser({
          id: payload.user_id,
          role: payload.role,
          email: payload.email,
        });

      } catch (err) {
        console.error("TOKEN INVALID → logout auto");
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, []);

  // 👉 Fonction login (manquante dans ton code)
  const loginUser = (token) => {
    localStorage.setItem("token", token);

    const payload = jwtDecode(token);

    setUser({
      id: payload.user_id,
      role: payload.role,
      email: payload.email,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
