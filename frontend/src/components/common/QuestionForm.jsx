import React from "react"; 
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react"; // icône poubelle

export default function QuestionForm({ questions, onQuestionsChange }) {
  const { t } = useTranslation("createQuiz");

  /* ================== QUESTION HANDLERS ================== */
  const updateQuestionText = (qIndex, text) => {
    const next = [...questions];
    next[qIndex].text = text;
    onQuestionsChange(next);
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const next = [...questions];
    next[qIndex][field] = value;
    onQuestionsChange(next);
  };

  const addQuestion = () => {
    const next = [...questions];
    next.push({
      text: "",
      points: 1,
      answers: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
    onQuestionsChange(next);
  };

const removeQuestion = (qIndex) => {
  const next = [...questions];
  const removed = next[qIndex];

  if (removed.id_qst) {
    // Marquer pour suppression mais ne pas supprimer de l'array
    removed._delete = true;
  } else {
    // Si c'est une question ajoutée et jamais sauvegardée, on peut la retirer
    next.splice(qIndex, 1);
  }

  onQuestionsChange(next);
};




  /* ================== ANSWER HANDLERS ================== */
  const updateAnswerText = (qIndex, aIndex, text) => {
    const next = [...questions];
    next[qIndex].answers[aIndex].text = text;
    onQuestionsChange(next);
  };

  const addAnswer = (qIndex) => {
    const next = [...questions];
    next[qIndex].answers.push({ text: "", isCorrect: false });
    onQuestionsChange(next);
  };

  const removeAnswer = (qIndex, aIndex) => {
    const next = [...questions];
    const [removed] = next[qIndex].answers.splice(aIndex, 1);

    if (removed.id_option) {
      next[qIndex].removedOptions = [...(next[qIndex].removedOptions || []), removed.id_option];
    }

    onQuestionsChange(next);
  };

  const markCorrectAnswer = (qIndex, aIndex) => {
    const next = [...questions];
    next[qIndex].answers = next[qIndex].answers.map((a, i) => ({
      ...a,
      isCorrect: i === aIndex
    }));
    onQuestionsChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {questions.filter(q => !q._delete).map((q, qIndex) => (
        <div key={qIndex} className="rounded-xl shadow-sm p-4 bg-grad-3 relative">
          {/* Bouton trash question */}
          <button
            type="button"
            onClick={() => removeQuestion(qIndex)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>

          <h3 className="font-semibold mb-2">{t("question")} {qIndex + 1}</h3>

          {/* Question text */}
          <input
            type="text"
            value={q.text}
            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            placeholder={t("questionText")}
            className="w-full shadow-md text-sm border rounded-xl px-3 py-2 text-black"
          />

{/* Score input */}
<div className="flex items-center gap-2 mt-2 mb-2">
  

  <input
    type="number"
    min={1}
    value={q.points || 1}
    onChange={(e) =>
      handleQuestionChange(
        qIndex,
        "points",
        parseFloat(e.target.value) || 1
      )
    }
    className="w-20 text-center border border-gray-300 rounded-md px-2 py-1 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
  />

  <span className="text-sm text-gray-600 font-medium">
    points
  </span>
</div>



          {/* Answers */}
          <div className="mt-3">
            <p className="text-sm mb-2">{t("answers")}</p>
            {q.answers.map((a, aIndex) => (
              <div key={aIndex} className="flex items-center gap-2 mb-2 relative">
                {/* Radio button pour la réponse correcte */}
                <input
                  type="radio"
                  name={`correct-answer-${qIndex}`}
                  checked={a.isCorrect}
                  onChange={() => markCorrectAnswer(qIndex, aIndex)}
                  className="w-4 h-4 shadow-md"
                />
                <span className="font-semibold">{String.fromCharCode(65 + aIndex)}.</span>
                <input
                  type="text"
                  value={a.text}
                  onChange={(e) => updateAnswerText(qIndex, aIndex, e.target.value)}
                  placeholder={
                    aIndex === 0
                      ? t("answerOptionA")
                      : aIndex === 1
                      ? t("answerOptionB")
                      : t("answerOption")
                  }
                  className="flex-1 text-sm border rounded-xl px-3 py-2 text-black shadow-md"
                  style={{ borderColor: "#e5e7eb", background: "white" }}
                />
                {/* Bouton trash option */}
                <button
                  type="button"
                  onClick={() => removeAnswer(qIndex, aIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Ajouter une réponse */}
            <button
              type="button"
              onClick={() => addAnswer(qIndex)}
              className="px-20 rounded-lg text-white text-sm bg-grad-1 lg:ml-40 whitespace-nowrap py-1 mt-2 hover:brightness-90 transition-colors"
            >
              {t("addAnswer")}
            </button>
          </div>
        </div>
      ))}

      {/* Ajouter une question */}
      <button
        type="button"
        onClick={addQuestion}
        className="px-4 py-2 rounded-lg text-white bg-grad-1 font-semibold hover:brightness-90 mt-4"
      >
        {t("addQuestion")}
      </button>
    </div>
  );
}