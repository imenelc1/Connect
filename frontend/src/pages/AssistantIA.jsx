import React, { useState, useRef, useEffect, useContext } from "react";
import { X, Send, Maximize2, Minimize2 } from "lucide-react";
import Mascotte from "../assets/head_mascotte.svg";
import { getAIAnswer, getSystemPrompt } from "../services/iaService";
import ExerciseContext from "../context/ExerciseContext";
import { loadChat, saveChat } from "../utils/memory";

export default function AssistantIA({ onClose }) {
  const exercise = useContext(ExerciseContext);

  // 🔥 récupérer dynamiquement le nom de l'étudiant
  const [student, setStudent] = useState({ name: "", level: "Débutant" });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        const parsed = JSON.parse(storedUser);
        const userObj = parsed.user || parsed.utilisateur || parsed;
        setStudent({ name: `${userObj.prenom || ""} ${userObj.nom || ""}`, level: "Débutant" });
      }
    } catch (err) {
      console.error("Erreur récupération étudiant:", err);
    }
  }, []);

  const stored = loadChat(exercise.id);

  const [messages, setMessages] = useState(
    stored?.messages || [
      {
        id: 1,
        from: "bot",
        text: `Bonjour ${student.name || "étudiant"} 👋  
Je suis ton Coach C.  
Explique-moi ce qui te bloque.`,
      },
    ]
  );

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const scrollRef = useRef(null);
  const windowRef = useRef(null);
  const pos = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  // Auto-scroll + sauvegarde
  useEffect(() => {
    saveChat(exercise.id, messages, student);
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, student]);

  // Drag & drop
  const startDrag = (e) => {
    pos.current.ox = e.clientX - pos.current.x;
    pos.current.oy = e.clientY - pos.current.y;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  };
  const drag = (e) => {
    pos.current.x = e.clientX - pos.current.ox;
    pos.current.y = e.clientY - pos.current.oy;
    if (windowRef.current) {
      windowRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    }
  };
  const stopDrag = () => {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
  };

  // Détection FR/EN
  const detectLanguage = (text = "") =>
    /je|tu|pas|comment|pourquoi/i.test(text) ? "fr" : "en";

  // Envoi message
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const lang = detectLanguage(input);
    const userMsg = { id: Date.now(), from: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = getSystemPrompt({
        lang,
        exercise,
        student,
        memory: messages.slice(-5),
      });

      const answer = await getAIAnswer({
        systemPrompt,
        userPrompt: input,
        lang,
      });

      setMessages((m) => [...m, { id: Date.now() + 1, from: "bot", text: answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 2,
          from: "bot",
          text:
            lang === "en"
              ? "❌ An error occurred. Please try again."
              : "❌ Une erreur est survenue. Réessaie.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={windowRef}
        className={`pointer-events-auto absolute bottom-6 right-6 bg-surface rounded-xl shadow-2xl border flex flex-col transition-all
        ${expanded ? "w-[720px] h-[560px]" : "w-[360px] h-[420px]"}`}
      >
        {/* Header */}
        <div
          onMouseDown={startDrag}
          className="cursor-grab active:cursor-grabbing flex items-center justify-between px-4 py-3 bg-grad-1 text-white rounded-t-xl"
        >
          <div className="flex items-center gap-2">
            <img src={Mascotte} className="w-8 h-8 rounded-full" />
            <div>
              <p className="font-semibold leading-none">Assistant IA</p>
              <span className="text-xs opacity-80">Coach C</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={handleClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : ""}`}>
              {m.from === "bot" && (
                <img src={Mascotte} className="w-8 h-8 rounded-full mr-2" />
              )}
              <div
                className={`max-w-[75%] text-sm p-3 rounded-2xl whitespace-pre-wrap
                ${
                  m.from === "user"
                    ? "bg-grad-1 text-white rounded-br-sm"
                    : "bg-[rgb(var(--color-card))] text-[rgb(var(--color-text))] rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <img src={Mascotte} className="w-7 h-7 rounded-full" />
              {detectLanguage(input) === "en"
                ? "Assistant is typing…"
                : "L’assistant écrit…"}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t">
          <div className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                detectLanguage(input) === "en"
                  ? "Type your question…"
                  : "Écris ta question…"
              }
              className="w-full rounded-full border px-4 py-2 pr-12 text-sm"
            />
            <button
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}