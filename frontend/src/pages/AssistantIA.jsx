import React, { useState, useRef, useEffect, useContext } from "react";
import { X, Send, Maximize2, Minimize2 } from "lucide-react";
import Mascotte from "../assets/head_mascotte.svg";
import { getAIAnswer, getSystemPrompt } from "../services/iaService";
import ExerciseContext from "../context/ExerciseContext";
import { loadChat, saveChat } from "../utils/memory";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { loadStudentProfile, saveStudentProfile } from "../utils/studentProfile";

/* ---------- Utils ---------- */
const detectLanguage = (t = "") =>
  /[àâçéèêëîïôûùüÿñæœ]/i.test(t) ? "fr" : "en";

const isExerciseMisunderstood = (msg = "") =>
  /je comprends pas|j'ai pas compris|pas compris|rien compris|c'est flou/i.test(
    msg.toLowerCase()
  );

export default function AssistantIA({ onClose }) {
  const exercise = useContext(ExerciseContext);

  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [profile, setProfile] = useState(null);

  const scrollRef = useRef(null);

  /* ---------- Load profile ---------- */
  useEffect(() => {
    if (!exercise?.id) return;
    setProfile(loadStudentProfile(exercise.id) || {});
  }, [exercise?.id]);

  /* ---------- Load student ---------- */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const u = JSON.parse(stored)?.user || JSON.parse(stored);
    setStudent({
      name: `${u?.prenom || ""} ${u?.nom || ""}`.trim() || "Étudiant",
      level: "Débutant",
    });
  }, []);

  /* ---------- Load chat ---------- */
  useEffect(() => {
    if (!student || !exercise?.id) return;

    const storedChat = loadChat(exercise.id);

    if (storedChat?.messages?.length) {
      setMessages(storedChat.messages);
    } else {
      setMessages([
        {
          id: 1,
          from: "bot",
          text: `Bonjour ${student.name} 👋  
Je suis ton **Coach C**.  
Explique-moi ce qui te bloque.`,
        },
      ]);
    }
  }, [student, exercise?.id]);

  /* ---------- Save + Auto-scroll ---------- */
  useEffect(() => {
    if (!student || !exercise?.id) return;
    saveChat(exercise.id, messages, student);

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, student, exercise?.id]);

  /* ---------- Send Message ---------- */
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const lang = detectLanguage(userText);

    const userMsg = { id: Date.now(), from: "user", text: userText };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    /* --- Case: misunderstanding (no AI call) --- */
    if (isExerciseMisunderstood(userText)) {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          from: "bot",
          text: `
### 🔍 Explication simple (sans code)

L’exercice te demande **une seule chose** :

👉 prendre **un nombre**  
👉 dire s’il est **pair** ou **impair**

#### Exemple
- 4 → pair  
- 7 → impair  

🎯 Pour l’instant, on ne code pas — on clarifie le but.

❓ Est-ce que c’est plus clair maintenant ?
          `,
        },
      ]);
      return;
    }

    /* --- Normal AI answer --- */
    setLoading(true);
    setHintLevel((h) => Math.min(h + 1, 3));

    try {
      const systemPrompt = getSystemPrompt({
        lang,
        exercise,
        student,
        memory: messages.slice(-6),
        profile,
      });

      const answer = await getAIAnswer({
        systemPrompt,
        userPrompt: `
NIVEAU D’INDICE AUTORISÉ : ${hintLevel}/3

CODE ÉTUDIANT :
${exercise?.code || "aucun code soumis"}

QUESTION :
${userText}
`,
      });

      setMessages((m) => [
        ...m,
        { id: Date.now() + 2, from: "bot", text: answer },
      ]);

      const updatedProfile = {
        ...profile,
        hintsUsed: (profile?.hintsUsed || 0) + 1,
        lastInteraction: Date.now(),
      };

      saveStudentProfile(exercise.id, updatedProfile);
      setProfile(updatedProfile);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 3,
          from: "bot",
          text: "❌ Une erreur est survenue. Réessaie dans un instant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className={`pointer-events-auto absolute bottom-6 right-6 bg-surface rounded-xl shadow-2xl border flex flex-col
        ${expanded ? "w-[720px] h-[560px]" : "w-[360px] h-[420px]"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-grad-1 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <img src={Mascotte} className="w-8 h-8" />
            <div>
              <p className="font-semibold">Assistant IA</p>
              <span className="text-xs opacity-80">
                Coach C • {student.name}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "user" ? "justify-end" : ""}`}
            >
              {m.from === "bot" && (
                <img src={Mascotte} className="w-7 h-7 mr-2" />
              )}
              <div
                className={`p-4 rounded-2xl text-sm max-w-[75%]
                ${
                  m.from === "user"
                    ? "bg-grad-1 text-white"
                    : "bg-card text-text"
                }`}
              >
                {m.from === "bot" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text}
                  </ReactMarkdown>
                ) : (
                  <p>{m.text}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <p className="text-xs text-gray-400">L’assistant écrit…</p>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t">
          <div className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Explique ton problème…"
              className="w-full rounded-full border px-4 py-2 pr-12"
            />
            <button
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white w-8 h-8 rounded-full"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}