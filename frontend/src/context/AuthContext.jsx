import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Charger la session si un token existe
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

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
