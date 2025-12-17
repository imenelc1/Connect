import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      try {
        const payload = jwtDecode(token);

        setUser({
          id: payload.user_id,
          role: payload.role,
          username: payload.username,
          email: payload.email,
        });

      } catch (err) {
        console.error("TOKEN INVALID → logout auto");
        localStorage.removeItem("access_token");
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
