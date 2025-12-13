import React from "react"; 
import { useTranslation } from "react-i18next";

export default function QuestionForm({ questions, onQuestionsChange }) {
  const { t } = useTranslation("createQuiz");

  const updateQuestionText = (qIndex, text) => {
    const next = [...questions];
    next[qIndex].text = text;
    onQuestionsChange(next);
  };
   const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    onQuestionsChange(updated);
  };

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
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="rounded-xl shadow-sm p-4 bg-grad-3">
          <h3 className="font-semibold mb-2">
            {t("question")} {qIndex + 1}
          </h3>

          {/* Question text */}
          <input
            type="text"
            value={q.text}
            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            placeholder={t("questionText")}
            className="w-full text-sm border rounded-xl px-3 py-2 text-black"
          />
            {/* Score input */}
          <input
            type="number"
            min={1}
            value={q.points || 1}
            onChange={(e) => handleQuestionChange(qIndex, "points", parseFloat(e.target.value) || 1)}
            placeholder="Points for this question"
            className="w-24 mb-2"
          />

          {/* Answers */}
          <div className="mt-3">
            <p className="text-sm mb-2">{t("answers")}</p>
            {q.answers.map((a, aIndex) => (
              <div key={aIndex} className="flex items-center gap-2 mb-2">
                {/* Radio button pour la réponse correcte */}
                <input
                  type="radio"
                  name={`correct-answer-${qIndex}`}
                  checked={a.isCorrect}
                  onChange={() => markCorrectAnswer(qIndex, aIndex)}
                  className="w-4 h-4"
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
                  className="flex-1 text-sm border rounded-xl px-3 py-2 text-black"
                  style={{ borderColor: "#e5e7eb", background: "white" }}
                />
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
    </div>
  );
}
