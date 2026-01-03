import React, { useState, useEffect, useRef, useContext } from "react";
import { X, Send, Maximize2, Minimize2 } from "lucide-react";
import Mascotte from "../assets/head_mascotte.svg";
import ExerciseContext from "../context/ExerciseContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSystemPrompt, getAIAnswer } from "../services/iaService";

const detectLanguage = text => /[àâçéèêëîïôûùüÿñæœ]/i.test(text) ? "fr" : "en";
const isExerciseQuestion = msg => /je comprends pas|j'ai pas compris|pas compris|rien compris|c'est flou/i.test(msg.toLowerCase());
const asksAboutCode = msg =>
  /mon code|le code|ça marche pas|bug|erreur|probleme/i.test(msg.toLowerCase());


import axios from "axios";

const API_URL = "http://localhost:8000/api/badges/ai-explanation-badge/"; // ton endpoint Django

async function awardAIBadge() {
  try {
    const res = await axios.post(API_URL, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}` // ou selon ton auth
      }
    });
    console.log(res.data.message);
    return res.data;
  } catch (err) {
    console.error("Erreur badge IA :", err.response?.data || err);
  }
}


export default function AssistantIA({ onClose, mode = "generic", course = null }) {
  const exercise = useContext(ExerciseContext);  // récupère l'exercice
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [helpLevel, setHelpLevel] = useState(0);
  const hasMeaningfulCode = (code, defaultCode) => {
    if (!code) return false;

    const normalize = str =>
      str.replace(/\s+/g, "").replace(/\/\*.*?\*\//g, "").replace(/\/\/.*$/gm, "");

    return normalize(code) !== normalize(defaultCode);
  };


  const scrollRef = useRef(null);

  // Mode dynamique si exercice détecté
  const actualMode = exercise?.id ? "exercise" : mode;
  const chatTargetId = actualMode === "exercise"
    ? exercise?.id
    : actualMode === "course"
      ? course?.id
      : "global";

  // ---------- Load student ----------
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const u = JSON.parse(stored);
    setStudent({ id: u.user_id, name: `${u.prenom || ""} ${u.nom || ""}`.trim() || "Étudiant" });
  }, []);

  // ---------- Load chat ----------
  useEffect(() => {
    if (!student?.id) return;
    const storedChat = localStorage.getItem(`edu.chat.${student.id}.${actualMode}.${chatTargetId}`);
    if (storedChat) {
      const parsed = JSON.parse(storedChat);
      if (parsed?.messages?.length) setMessages(parsed.messages);
    } else {
      setMessages([{
        id: Date.now(),
        from: "bot",
        text: actualMode === "exercise"
          ? `Bonjour ${student.name} 👋\nJe vois que tu travailles sur l'exercice : **${exercise?.titre || "en cours"}**.\nExplique-moi ce que tu ne comprends pas et je t'aiderai étape par étape.`
          : actualMode === "course"
            ? `Bonjour ${student.name} 👋\nJe suis ton assistant cours pour ce cours.`
            : `Bonjour ${student.name} 👋\nJe suis ton assistant IA.`
      }]);
    }
  }, [student, actualMode, chatTargetId, exercise]);

  // ---------- Persist chat + scroll ----------
  useEffect(() => {
    if (!student?.id) return;
    localStorage.setItem(
      `edu.chat.${student.id}.${actualMode}.${chatTargetId}`,
      JSON.stringify({ messages, updatedAt: Date.now() })
    );
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, student, actualMode, chatTargetId]);

  // ---------- Send message ----------
  const handleSend = async () => {
    if (!input.trim() || loading || !student?.id) return;
    const userText = input.trim();
    const lang = detectLanguage(userText);

    setMessages(m => [...m, { id: Date.now(), from: "user", text: userText }]);
    setInput("");


    let pedagogicRule = "";

    // 🧠 Cas 1 : question sur le CODE
    if (actualMode === "exercise" && asksAboutCode(userText)) {
      pedagogicRule = `
Analyse le code fourni ci-dessus.
Explique précisément ce qui ne va pas.
N'écris PAS la solution complète.
N'améliore pas le code.
Indique les erreurs logiques, syntaxiques ou conceptuelles.
`;
    }

    // 🧠 Cas 2 : blocage pédagogique (progressif)
    else if (actualMode === "exercise" && isExerciseQuestion(userText)) {
      const nextLevel = helpLevel + 1;
      setHelpLevel(nextLevel);

      // 🔒 Blocage si aucun code écrit
      if (
        nextLevel >= 3 &&
        !hasMeaningfulCode(exercise?.code, exercise?.defaultCode)
      ) {
        pedagogicRule = `
Refuse de donner la solution complète.
Explique que le code actuel est encore le code de base.
Invite l'étudiant à essayer d'écrire une première version liée à l'exercice.
Donne seulement des indices.
Sois encourageant.
`;
      }


      else if (nextLevel === 1) {
        pedagogicRule = `
Donne UNIQUEMENT des indices.
Explique le principe sans écrire de code.
`;
      }

      else if (nextLevel === 2) {
        pedagogicRule = `
Explique la logique étape par étape.
Tu peux utiliser du pseudo-code.
Ne donne PAS la solution complète.
`;
      }

      else {
        pedagogicRule = `
Donne maintenant la solution complète en C,
avec une explication ligne par ligne.
Ne pose AUCUNE question à l'étudiant.
`;
      }
    }


    setLoading(true);
    try {
      const systemPrompt =
        getSystemPrompt({
          lang,
          mode: actualMode,
          exercise,
          student,
          memory: messages.slice(-6),
          courseContext: course?.context || ""
        }) +
        `

### CONTEXTE TECHNIQUE ACTUEL (NE PAS AFFICHER TEL QUEL À L'ÉTUDIANT)

ÉNONCÉ DE L'EXERCICE :
${exercise?.enonce || "Non disponible"}

CODE ACTUEL DE L'ÉTUDIANT :
\`\`\`c
${exercise?.code || "// Aucun code pour le moment"}
\`\`\`

SORTIE / ERREURS ACTUELLES :
${exercise?.output || "Aucune sortie"}

INSTRUCTIONS IMPORTANTES :
- Analyse TOUJOURS le code avant de répondre
- Si l'étudiant demande "quel est le problème", explique ce qui ne va pas dans CE code
- Ne demande JAMAIS à l'étudiant de coller son code
- Adapte ton aide au niveau pédagogique (indices → explication → solution)
` +
        "\n" +
        pedagogicRule;



      const answer = await getAIAnswer({ systemPrompt, userPrompt: userText });
      setMessages(m => [...m, { id: Date.now() + 2, from: "bot", text: answer }]);

      // Ici on appelle le badge IA
      if (actualMode !== "exercise") { // ou condition si tu veux uniquement pour IA générique
        const badgeRes = await awardAIBadge();
        if (badgeRes?.message) {
          alert(badgeRes.message); // ou toast si tu utilises react-toastify
        }
      }

    } finally { setLoading(false); }
    console.log("Appel badge IA...");
    const badgeRes = await awardAIBadge();
    console.log("Réponse badge :", badgeRes);

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
                {actualMode === "course" ? "Assistant Cours" : actualMode === "exercise" ? "Assistant Exercice" : "Assistant IA"}
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
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : ""}`}>
              {m.from === "bot" && <img src={Mascotte} className="w-7 h-7 mr-2" />}
              <div className={`p-4 rounded-2xl text-sm max-w-[75%] ${m.from === "user" ? "bg-grad-1 text-white" : "bg-card text-text"}`}>
                {m.from === "bot" ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown> : <p>{m.text}</p>}
              </div>
            </div>
          ))}
          {loading && <p className="text-xs text-gray-400">L’assistant écrit…</p>}
        </div>

        {/* Input */}
        <div className="p-3 border-t">
          <div className="relative">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={actualMode === "course" ? "Pose une question sur le cours…" : "Explique ton problème…"}
              className="w-full rounded-full border px-4 py-2 pr-12"
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