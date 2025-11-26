import React from "react";
import useI18n from "../../i18n";

export default function QuestionForm({ questions, onQuestionsChange }) {
  const { t } = useI18n();

  const updateQuestionText = (index, text) => {
    const next = [...questions];
    next[index].text = text;
    onQuestionsChange(next);
  };

  const addAnswer = (qIndex) => {
    const next = [...questions];
    next[qIndex].answers.push({ text: "", isCorrect: false });
    onQuestionsChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="rounded-xl shadow-sm p-4" style={{ background: "var(--grad-5)" }}>
          <h3 className="font-semibold mb-2">
            {t("question")} {qIndex + 1}
          </h3>

          <input
            type="text"
            value={q.text}
            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            placeholder={t("questionText")}
            className="w-full text-sm border rounded-xl px-3 py-2"
            style={{ borderColor: "#e5e7eb", background: "white" }}
          />

          <div className="mt-3">
            <p className="text-sm mb-2">{t("answers")}</p>
            {q.answers.map((a, aIndex) => (
              <div key={aIndex} className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{String.fromCharCode(65 + aIndex)}.</span>
                <input
                  type="text"
                  value={a.text}
                  onChange={(e) => {
                    const next = [...questions];
                    next[qIndex].answers[aIndex].text = e.target.value;
                    onQuestionsChange(next);
                  }}
                  placeholder={
                    aIndex === 0
                      ? t("answerOptionA")
                      : aIndex === 1
                      ? t("answerOptionB")
                      : t("answerOption")
                  }
                  className="flex-1 text-sm border rounded-xl px-3 py-2"
                  style={{ borderColor: "#e5e7eb", background: "white" }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addAnswer(qIndex)}
              className="px-3 py-2 rounded-md text-white text-sm"
              style={{ background: "rgb(var(--color-primary))" }}
            >
              {t("addAnswer")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
