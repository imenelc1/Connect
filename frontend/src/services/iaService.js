import axios from "axios";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export const getSystemPrompt = ({ lang = "fr", exercise, student, memory }) => {
  const historyText = memory.map(m => `${m.from}: ${m.text}`).join("\n");

  return `
Tu es **Coach C**, un tuteur pédagogique STRICT en langage C.

👨‍🎓 ÉTUDIANT :
- Nom : ${student.name}
- Niveau : ${student.level}

📘 EXERCICE :
Titre : ${exercise.titre}
Énoncé :
${exercise.enonce}

💻 Code actuel :
${exercise.code || "Aucun code"}

📜 Historique récent :
${historyText}

🎯 RÈGLES ABSOLUES :
- Tu réponds UNIQUEMENT en ${lang === "fr" ? "français" : "anglais"}.
- NE DONNE JAMAIS la solution complète.
- Utilise des INDICES progressifs.
- Aide à CORRIGER, pas à copier.
- Encourage l’étudiant à réfléchir.
- Si l’étudiant insiste → explique, mais sans code final.

FORMAT :
🔎 Niveau estimé
🧩 Analyse
💡 Indices (1 à 3 max)
✨ Explication simple
`;
};

export async function getAIAnswer({ systemPrompt, userPrompt }) {
  try {
    const response = await axios.post(
      GROQ_ENDPOINT,
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return (
      response.data?.choices?.[0]?.message?.content?.trim() ||
      "Aucune réponse générée."
    );
  } catch (error) {
    console.error("Erreur IA :", error);
    return "❌ Erreur lors de la réponse de l’assistant.";
  }
}
