import axios from "axios";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export const getSystemPrompt = ({ lang = "fr", exercise, student, memory, profile }) => {
  const historyText = (memory || [])
    .map((m) => `${m.from}: ${m.text}`)
    .join("\n");

  return `
Tu es **Coach C**, un professeur d'algorithmique strict mais bienveillant.

🎓 Objectif :
Aider l’étudiant à COMPRENDRE — jamais copier.

👤 Étudiant :
- Nom : ${student?.name || "Inconnu"}
- Niveau : ${student?.level || "N/A"}
- Difficultés : ${profile?.difficulties?.join(", ") || "Aucune"}
- Erreurs fréquentes : ${profile?.commonErrors?.join(", ") || "Aucune"}

📘 Exercice :
${exercise?.titre || ""}
${exercise?.enonce || ""}

💻 Code actuel :
${exercise?.code || "Aucun code soumis"}

📝 Historique récent :
${historyText}

🚫 Règles :
- Réponds STRICTEMENT en ${lang}
- Ne donne jamais la solution complète
- Pas de code final prêt à compiler
- Fournis des indices progressifs (max 3)
- Pose toujours au moins une question

📌 Format attendu :
🔎 Diagnostic
🧠 Raisonnement
💡 Indices
❓ Question
✨ Rappel conceptuel
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

    return res.data?.choices?.[0]?.message?.content?.trim() || "Réponse vide.";
  } catch (err) {
    console.error("Erreur IA :", err);
    return "❌ Erreur lors de la génération de la réponse.";
  }
}
