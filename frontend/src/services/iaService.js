import axios from "axios";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export const getSystemPrompt = ({
  lang = "fr",
  mode = "generic",
  exercise,
  student,
  memory,
  courseContext = ""
}) => {
  const historyText = (memory || [])
    .map(m => `${m.from}: ${m.text}`)
    .join("\n");

  if (mode === "exercise" && exercise) {
    return `
Tu es un Coach Exercice pédagogique.
Tu aides l'étudiant à comprendre sans tricher.

Exercice :
Titre : ${exercise.titre}
Énoncé : ${exercise.enonce}

Historique :
${historyText}

Réponds STRICTEMENT en ${lang}.
`;
  }

  if (mode === "course" && courseContext) {
    return `
Tu es Coach Cours.
Cours :
${courseContext.slice(0, 3000)}

Historique :
${historyText}

Réponds STRICTEMENT en ${lang}.
`;
  }

  return `
Tu es Coach IA.
🧠 Explication
💡 Exemple
❓ Question
`;
};

export async function getAIAnswer({ systemPrompt, userPrompt }) {
  try {
    const res = await axios.post(
      GROQ_ENDPOINT,
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data?.choices?.[0]?.message?.content?.trim() || "Réponse vide.";
  } catch (err) {
    console.error("❌ Erreur IA :", err);
    return "❌ Erreur lors de la génération.";
  }
}
