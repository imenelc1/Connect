import axios from "axios";

// Clé API Groq
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Cache simple pour éviter les requêtes répétées
const cache = new Map();

/**
 * Envoie le code ou la question à Llama-4 Scout 17B
 * @param {string} codeOrQuestion - code C ou question sur algorithme
 * @returns {Promise<string>} - réponse du modèle
 */
export async function getAIAnswer(codeOrQuestion) {
  // Vérifie si la réponse est déjà dans le cache
  if (cache.has(codeOrQuestion)) {
    return cache.get(codeOrQuestion);
  }

  // Limite la taille du code pour éviter trop de tokens (ex: max 2000 caractères)
  const limitedQuestion = codeOrQuestion.length > 2000
    ? codeOrQuestion.slice(0, 2000) + "\n// [Le code a été tronqué pour respecter la limite]"
    : codeOrQuestion;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct", // modèle recommandé
        messages: [
          { role: "system", content: "Tu es un professeur de programmation en C. Tu expliques le code clairement en français." },
          { role: "user", content: limitedQuestion }
        ],
        max_tokens: 512,
        temperature: 0.2,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    const answer = response.data?.choices?.[0]?.message?.content || "Aucune réponse générée.";

    // Sauvegarde dans le cache
    cache.set(codeOrQuestion, answer);

    return answer;
  } catch (error) {
    console.error("Erreur IA:", error.message, error.response?.data);

    // Gestion simple des erreurs de quota ou dépassement
    if (error.response?.status === 429) {
      return "Trop de requêtes en même temps, veuillez réessayer plus tard.";
    }

    return error.response?.data?.error?.message || "Erreur lors de la génération de la réponse.";
  }
}
