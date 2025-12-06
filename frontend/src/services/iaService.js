// services/iaservice.js
import axios from "axios";

const LOCALAI_URL = "http://localhost:8080/v1/chat/completions";

export async function getAIAnswer(question) {
  try {
    const payload = {
      model: "codegemma-2b-Q4_K_M",  // ton modèle local
      messages: [
        { role: "user", content: question }
      ]
    };

    const response = await axios.post(LOCALAI_URL, payload);
    const answer = response.data.choices[0].message.content;
    return answer;

  } catch (error) {
    console.error("Erreur IA:", error.message);
    return "Erreur lors de la génération de la réponse.";
  }
}
