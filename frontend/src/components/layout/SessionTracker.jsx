import { useEffect, useRef } from "react";

export default function SessionTracker() {
  const sessionStartRef = useRef(Date.now());

  useEffect(() => {
    const sendSession = async () => {
      const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      if (duration < 30) return;

      try {
        await fetch(
          `http://localhost:8000/api/dashboard/add-session/`,
          {
            method: "POST",
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ duration })
          }
        );
        sessionStartRef.current = Date.now(); // reset chrono
      } catch (err) {
        console.error("Erreur ajout session :", err);
      }
    };

    // Envoie toutes les 5 minutes (300000 ms)
    const interval = setInterval(sendSession, 300000);

    // Envoie quand l'utilisateur quitte la page ou change d'onglet
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendSession();
      }
    };

    window.addEventListener("beforeunload", sendSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", sendSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null; // ce composant n'affiche rien
}
