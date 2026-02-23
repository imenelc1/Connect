import { useEffect, useRef } from "react";

export default function SessionTracker() {
  const lastSentRef = useRef(Date.now());

  useEffect(() => {
    const sendSession = async () => {
      const now = Date.now();
      const duration = Math.floor((now - lastSentRef.current) / 1000);

      if (duration < 30) return;

      try {
        await fetch("${process.env.REACT_APP_API_URL}/api/dashboard/add-session/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ duration }),
        });

        lastSentRef.current = now; // ⬅️ juste déplacer la référence
      } catch (err) {
        console.error("Erreur ajout session :", err);
      }
    };

    const interval = setInterval(sendSession, 300000);

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
