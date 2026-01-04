import React, { useState, useEffect, useRef, useContext } from "react";
import Mascotte from "../../assets/head_mascotte.svg";
import AssistantIA from "../../pages/AssistantIA";
import ExerciseContext from "../../context/ExerciseContext";

const NOTIF_DURATION = 4500;

export default function HeadMascotte({ courseData = null , aiEnabled = true}) {
  const exercise = useContext(ExerciseContext);

  const [openAssistant, setOpenAssistant] = useState(false);
  const [assistantMode, setAssistantMode] = useState("generic");
  const [currentCourse, setCurrentCourse] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const lastNotifRef = useRef(null);

  // 🔎 Détection automatique du contexte (fix boucle infinie)
  useEffect(() => {
    if (exercise?.id && assistantMode !== "exercise") {
      setAssistantMode("exercise");
      setCurrentCourse(null);
      return;
    }

    if (courseData?.id && assistantMode !== "course") {
      setAssistantMode("course");
      const context =
        courseData.sections
          ?.map((sec) =>
            sec.lessons.map((lec) => lec.content || "").join("\n")
          )
          .join("\n\n") || "";
      setCurrentCourse({ ...courseData, context });
      return;
    }

    if (!exercise?.id && !courseData?.id && assistantMode !== "generic") {
      setAssistantMode("generic");
      setCurrentCourse(null);
    }
  }, [exercise, courseData, assistantMode]);

  // ---------------- Notifications ----------------
  const pushNotification = (text, type = "info") => {
    if (lastNotifRef.current === text) return;
    lastNotifRef.current = text;
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(
      () =>
        setNotifications((prev) => prev.filter((n) => n.id !== id)),
      NOTIF_DURATION
    );
  };


    // ---------------- Gestion clic mascotte ----------------


    const handleMascotteClick = () => {
    if (!aiEnabled) {
      pushNotification("Assistant IA désactivé pour ce cours/exercice.", "error");
      return; // empêche l'ouverture si IA non autorisée
    }else{
    setOpenAssistant(true);

    }
  };
  return (
    <>
      <div className="relative">
        <img
          src={Mascotte}
          alt="Mascotte"
          className="w-10 h-10 cursor-pointer hover:scale-105 transition"
          onClick={handleMascotteClick} 
        />
        <div className="absolute -top-2 -right-2 flex flex-col gap-2 z-50">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={handleMascotteClick}
              className={`rounded-xl px-3 py-2 max-w-xs text-sm flex items-center gap-2 cursor-pointer shadow 
                ${n.type === "error" ? "bg-red-500 text-white" : n.type === "hint" ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`}
            >
              <img src={Mascotte} className="w-6 h-6 rounded-full" />
              <span>{n.text}</span>
            </div>
          ))}
        </div>
      </div>

      {openAssistant && (
        <AssistantIA
          onClose={() => setOpenAssistant(false)}
          mode={assistantMode}
          course={currentCourse}
        />
      )}
    </>
  );
}
