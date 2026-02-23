import React, { useState, useEffect, useRef, useContext } from "react";
import { X, Send, Maximize2, Minimize2 } from "lucide-react";
import Mascotte from "../assets/head_mascotte.svg";
import ExerciseContext from "../context/ExerciseContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSystemPrompt, getAIAnswer } from "../services/iaService";
import { useTranslation } from "react-i18next";
import TheoryExerciseContext from "../context/TheoryExerciseContext";

const detectLanguage = (text) =>
  /[àâçéèêëîïôûùüÿñæœ]/i.test(text) ? "fr" : "en";
const isExerciseQuestion = (msg) =>
  /je comprends pas|j'ai pas compris|pas compris|rien compris|c'est flou/i.test(
    msg.toLowerCase()
  );
const asksAboutCode = (msg) =>
  /mon code|le code|ça marche pas|bug|erreur|probleme/i.test(msg.toLowerCase());

import axios from "axios";

const API_URL = "https://connect-1-t976.onrender.com/api/badges/ai-explanation-badge/"; // ton endpoint Django

async function awardAIBadge() {
  try {
    const res = await axios.post(
      API_URL,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ou selon ton auth
        },
      }
    );
    console.log(res.data.message);
    return res.data;
  } catch (err) {
    console.error("Erreur badge IA :", err.response?.data || err);
  }
}

export default function AssistantIA({
  onClose,
  mode = "generic",
  course = null,
}) {
  const { t } = useTranslation("assistant");

  // ---------------- STATE ----------------
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [helpLevel, setHelpLevel] = useState(0);
  const [aiBadgeSent, setAiBadgeSent] = useState(false);

  // ---------------- CONTEXTS ----------------
  const codingExercise = useContext(ExerciseContext);
  const theoryExercise = useContext(TheoryExerciseContext);

  // 🎯 Exercice unifié (code OU théorie)
  const exercise =
    codingExercise?.id
      ? codingExercise
      : theoryExercise?.id
        ? theoryExercise
        : null;

  // 🎯 Mode réel
  const actualMode =
    codingExercise?.id
      ? "exercise"
      : theoryExercise?.id
        ? "theory"
        : mode;

 const chatTargetId =
  actualMode === "exercise"
    ? exercise?.id
    : actualMode === "theory"
      ? exercise?.id     
      : actualMode === "course"
        ? course?.id
        : "global";


  const scrollRef = useRef(null);

  // ---------------- UTILS ----------------
  const hasMeaningfulCode = (code, defaultCode) => {
    if (!code) return false;
    const normalize = (str) =>
      str
        .replace(/\s+/g, "")
        .replace(/\/\*.*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");
    return normalize(code) !== normalize(defaultCode);
  };

  // ---------------- LOAD STUDENT ----------------
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const u = JSON.parse(stored);
    setStudent({
      id: u.user_id,
      name: `${u.prenom || ""} ${u.nom || ""}`.trim() || t("student"),
    });
  }, []);

  // ---------------- LOAD CHAT ----------------
  useEffect(() => {
    if (!student?.id) return;

    const key = `edu.chat.${student.id}.${actualMode}.${chatTargetId}`;
    const storedChat = localStorage.getItem(key);

    if (storedChat) {
      const parsed = JSON.parse(storedChat);
      if (parsed?.messages?.length) {
        setMessages(parsed.messages);
        return;
      }
    }

    setMessages([
      {
        id: Date.now(),
        from: "bot",
        text:
          actualMode === "exercise"
            ? `Bonjour ${student.name} 👋  
Je vois que tu travailles sur l'exercice **${exercise?.titre || ""}**.  
Explique-moi ce qui te bloque.`
            : actualMode === "theory"
              ? `Bonjour ${student.name} 👋  
Je suis là pour t'aider à comprendre cet exercice théorique.`
              : `Bonjour ${student.name} 👋  
Je suis ton assistant IA.`,
      },
    ]);
  }, [student, actualMode, chatTargetId, exercise]);

  // ---------------- SAVE CHAT + SCROLL ----------------
  useEffect(() => {
    if (!student?.id) return;

    localStorage.setItem(
      `edu.chat.${student.id}.${actualMode}.${chatTargetId}`,
      JSON.stringify({ messages })
    );

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, student, actualMode, chatTargetId]);

  // ---------------- SEND MESSAGE ----------------
  const handleSend = async () => {
    if (!input.trim() || loading || !student?.id) return;

    const userText = input.trim();
    const lang = detectLanguage(userText);

    setMessages((m) => [...m, { id: Date.now(), from: "user", text: userText }]);
    setInput("");

    setLoading(true);

    // 🔍 Détection théorie
    const isTheory = actualMode === "theory";

    // ---------------- RÈGLES PÉDAGOGIQUES ----------------
    let pedagogicRule = "";

    if (isTheory) {
      pedagogicRule = `
Aide l'étudiant progressivement :
- Reformule la question
- Explique les concepts clés
- Donne un exemple abstrait
- Ne donne JAMAIS la réponse finale exacte
`;
    }

    else if (actualMode === "exercise" && asksAboutCode(userText)) {
      pedagogicRule = `
Analyse le code existant.
Explique précisément ce qui ne va pas.
Ne donne PAS la solution complète.
`;
    }

    else if (actualMode === "exercise" && isExerciseQuestion(userText)) {
      const nextLevel = helpLevel + 1;
      setHelpLevel(nextLevel);

      if (
        nextLevel >= 3 &&
        !hasMeaningfulCode(exercise?.code, exercise?.defaultCode)
      ) {
        pedagogicRule = `
Le code est encore vide ou basique.
Refuse la solution complète.
Donne seulement des indices.
`;
      } else if (nextLevel === 1) {
        pedagogicRule = `Donne des indices uniquement.`;
      } else if (nextLevel === 2) {
        pedagogicRule = `Explique la logique avec pseudo-code.`;
      } else {
        pedagogicRule = `
Donne maintenant la solution complète en C,
avec explication ligne par ligne.
`;
      }
    }

    // ---------------- CONTEXTE TECHNIQUE ----------------
    const technicalContext = isTheory
      ? `
ÉNONCÉ :
${exercise?.enonce}

RÉPONSE DE L'ÉTUDIANT :
${exercise?.reponse || "Aucune réponse"}
`
      : `
ÉNONCÉ :
${exercise?.enonce}

CODE :
\`\`\`c
${exercise?.code || "// Aucun code"}
\`\`\`

SORTIE :
${exercise?.output || "Aucune sortie"}
`;

    // ---------------- PROMPT FINAL ----------------
    const systemPrompt =
      getSystemPrompt({
        lang,
        mode: actualMode,
        exercise,
        student,
        memory: messages.slice(-6),
        courseContext: course?.context || "",
      }) +
      "\n\n### CONTEXTE TECHNIQUE\n" +
      technicalContext +
      "\n\n### RÈGLES PÉDAGOGIQUES\n" +
      pedagogicRule;

    try {
      const answer = await getAIAnswer({
        systemPrompt,
        userPrompt: userText,
      });

      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "bot", text: answer },
      ]);

      if (actualMode !== "exercise" && !aiBadgeSent) {
        await awardAIBadge();
        setAiBadgeSent(true);
      }
    } finally {
      setLoading(false);
    }
  };


  if (!student?.id) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className={`pointer-events-auto absolute bottom-6 right-6 bg-surface rounded-xl shadow-2xl border flex flex-col
        ${expanded ? "w-[720px] h-[560px]" : "w-[360px] h-[420px]"}`}>

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-grad-1 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <img src={Mascotte} className="w-8 h-8" />
            <div>
              <p className="font-semibold">
                {actualMode === "course"
                  ? "Assistant Cours"
                  : actualMode === "exercise"
                    ? "Assistant Exercice"
                    : "Assistant IA"}
              </p>
              <span className="text-xs opacity-80">{student.name}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={onClose}><X size={18} /></button>
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
                className={`p-4 rounded-2xl text-sm max-w-[75%] ${m.from === "user"
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
              placeholder={actualMode === "course" ? "Pose une question sur le cours…" : "Explique ton problème…"}
              className="w-full rounded-full border border-input-border px-4 py-2 pr-12
          bg-input-bg text-input-text placeholder-input-placeholder
          dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-light"
            />
            <button
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center
          bg-grad-button text-white hover:opacity-90 transition"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}