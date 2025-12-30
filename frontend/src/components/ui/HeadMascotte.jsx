import React, { useState, useContext, useEffect } from "react";
import Mascotte from "../../assets/head_mascotte.svg";
import AssistantIA from "../../pages/AssistantIA";
import ExerciseContext from "../../context/ExerciseContext";

export default function HeadMascotte() {

  const exercise = useContext(ExerciseContext);

  const [openAssistant, setOpenAssistant] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // ------------------ NOTIFICATION HINT ------------------
  const notifyHint = (text) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text }]);

    // Auto-disparition
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // ------------------ INACTIVITÉ → PROPOSE AIDE ------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      if (exercise?.code)
        notifyHint("Tu veux un indice sur ton code ?");
    }, 60000); // 1 min sans modification

    return () => clearTimeout(timer);
  }, [exercise?.code]);

  // ------------------ ERREUR COMPILATION → COACH PROPOSE AIDE ------------------
  useEffect(() => {
    if (!exercise?.output) return;

    if (
      exercise.output.includes("error") ||
      exercise.output.includes("warning")
    ) {
      notifyHint("Je vois une erreur… tu veux que je t’explique ?");
    }
  }, [exercise?.output]);

  // ------------------ MESSAGE ASSISTANT IA ------------------
  const handleNewMessage = (msg) => {
    notifyHint(msg.text);
  };

  return (
    <>
      <div className="relative">
        <img
          src={Mascotte}
          alt="Mascotte"
          className="w-10 h-10 cursor-pointer hidden sm:block"
          onClick={() => setOpenAssistant(true)}
        />

        {/* Notifications bulles */}
        <div className="absolute -top-2 -right-2 flex flex-col gap-2 z-50 pointer-events-none">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="pointer-events-auto bg-white shadow-card rounded-xl px-3 py-2 max-w-xs animate-dropdown text-sm text-gray-800"
            >
              <div className="flex items-center gap-2">
                <img src={Mascotte} className="w-6 h-6 rounded-full" />
                <span>{n.text}</span>
              </div>
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
