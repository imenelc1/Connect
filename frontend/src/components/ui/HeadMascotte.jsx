import React, { useState, useContext, useEffect, useRef } from "react";
import Mascotte from "../../assets/head_mascotte.svg";
import AssistantIA from "../../pages/AssistantIA";
import ExerciseContext from "../../context/ExerciseContext";

/* ===================== CONFIG ===================== */
const NOTIF_DURATION = 4500;
const INACTIVITY_DELAY = 60000;

/* ===================== COMPONENT ===================== */
export default function HeadMascotte() {
  const exercise = useContext(ExerciseContext);

  const [openAssistant, setOpenAssistant] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const lastNotifRef = useRef(null);

  /* ===================== HELPERS ===================== */
  const pushNotification = (text, type = "info") => {
    // ⛔ anti-spam (même message)
    if (lastNotifRef.current === text) return;
    lastNotifRef.current = text;

    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, NOTIF_DURATION);
  };

  /* ===================== INACTIVITY ===================== */
  useEffect(() => {
    if (!exercise?.code) return;

    const timer = setTimeout(() => {
      pushNotification("💡 Tu veux un indice pour avancer ?", "hint");
    }, INACTIVITY_DELAY);

    return () => clearTimeout(timer);
  }, [exercise?.code]);

  /* ===================== COMPILATION ERRORS ===================== */
  useEffect(() => {
    if (!exercise?.output) return;

    if (/error|warning|undefined reference|expected|compile/i.test(exercise.output)) {
      notifyHint("Je vois une erreur dans ton code. Tu veux que je t’aide ?");
    }

  }, [exercise?.output]);

  /* ===================== IA MESSAGE ===================== */
  const handleNewMessage = (msg) => {
    if (msg?.text) {
      pushNotification(msg.text, "info");
    }
  };

  /* ===================== CLICK HANDLER ===================== */
  const handleOpenAssistant = () => {
    setOpenAssistant(true);
    setNotifications([]);
  };

  /* ===================== JSX ===================== */
  return (
    <>
      <div className="relative">
        {/* Mascotte */}
        <img
          src={Mascotte}
          alt="Mascotte"
          className="w-10 h-10 cursor-pointer hidden sm:block hover:scale-105 transition"
          onClick={handleOpenAssistant}
        />

        {/* Notifications */}
        <div className="absolute -top-2 -right-2 flex flex-col gap-2 z-50">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={handleOpenAssistant}
              className={`
                cursor-pointer pointer-events-auto
                rounded-xl px-3 py-2 max-w-xs
                shadow-lg animate-slide-in
                text-sm flex items-center gap-2
                ${n.type === "error"
                  ? "bg-red-500 text-white"
                  : n.type === "hint"
                    ? "bg-[rgb(var(--color-secondary2))] text-white"
                    : "bg-white text-gray-800"}
              `}
            >
              <img src={Mascotte} className="w-6 h-6 rounded-full" />
              <span className="leading-tight">{n.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assistant IA */}
      {openAssistant && (
        <AssistantIA
          onClose={() => setOpenAssistant(false)}
          onNewMessage={handleNewMessage}
        />
      )}
    </>
  );
}
