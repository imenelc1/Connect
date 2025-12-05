import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/common/LogoComponent";
import { FaClock, FaMedal, FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function QuizPreview() {
  const { state } = useLocation();
  const quiz = state?.quizData;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("createQuiz");

  const [answers, setAnswers] = useState({});

  if (!quiz) {
    return <div className="p-8">{t("noData")}</div>;
  }

  const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmit = () => {
    alert(t("sendQuiz"));
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  return (
    <div
      className="min-h-screen flex flex-col px-4 md:px-8 py-4 md:py-6"
      style={{ background: "rgb(var(--color-bg))" }}
    >

      {/* HEADER RIGHT ACTIONS */}
      <div className="absolute top-4 right-4 flex items-center gap-3">

        {/* SWITCH LANGUE */}
        <div
          onClick={toggleLanguage}
          className="cursor-pointer p-2 rounded-md shadow-sm bg-white/20 backdrop-blur hover:bg-white/30 transition"
        >
          <Globe size={18} />
        </div>

        {/* EXIT PREVIEW */}
        <button
          onClick={() => navigate("/create-quiz")}
          className="px-3 md:px-4 py-2 rounded-md shadow-md text-white text-xs md:text-sm font-medium"
          style={{ background: "rgb(var(--color-primary))" }}
        >
          {t("exitPreview")}
        </button>

      </div>

      {/* TITLE */}
      <h1 className="text-xl md:text-3xl font-bold text-center mt-10 mb-4 md:mb-6 text-muted">
        {quiz.title || t("title")}
      </h1>

      {/* DESCRIPTION */}
      <p className="text-sm text-grayc mb-4 md:mb-6 px-2 text-left">
        {quiz.description || t("description")}
      </p>

      {/* OVERVIEW */}
      <div className="flex-1 w-full rounded-2xl shadow-lg mt-4 md:mt-10 p-4 md:p-6 bg-grad-2">

        {/* TOP INFO CARDS */}
        <div className="flex flex-col md:flex-row md:justify-center gap-3 md:gap-x-80 text-xs md:text-sm mb-6">

          <div className="px-6 md:px-8 py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-blue text-white">
            <FaClock /> {quiz.duration} {t("minutes")}
          </div>

          <div
            className="px-6 md:px-8 py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-purple text-white"
          >
            <FaMedal /> {totalPoints} {t("points")}
          </div>

          <div
            className="px-6 md:px-8 py-2 rounded-md shadow-sm flex items-center gap-2 justify-center"
            style={{ background: "rgb(var(--color-pink))", color: "white" }}
          >
            <FaStar /> {quiz.level || t("level")}
          </div>

        </div>

        {/* QUESTIONS */}
        <div className="flex flex-col gap-4">
          {quiz.questions.map((q, index) => (
            <div key={index} className="rounded-xl shadow-sm p-3 md:p-4 bg-grad-3">

              <h3 className="font-semibold mb-1 flex items-center gap-2 text-sm md:text-base">
                <div
                  className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-md text-white text-xs md:text-sm font-bold"
                  style={{ background: "rgb(var(--color-primary))" }}
                >
                  {index + 1}
                </div>
                <span>{q.text || t("questionText")}</span>
              </h3>

              <p className="text-xs md:text-sm text-grayc mb-2">
                {q.points || 1} {t("points")}
              </p>

              <div className="flex flex-col gap-2">
                {q.answers.map((a, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-3 cursor-pointer border rounded-md px-3 py-2 shadow-sm bg-white"
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={answers[index] === i}
                      onChange={() => handleAnswerChange(index, i)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm md:text-base text-black/50">
                      {a.text || t("answerOption")}
                    </span>
                  </label>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* SUBMIT */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          className="px-5 md:px-6 py-2 md:py-3 rounded-xl text-white text-sm md:text-base font-medium"
          style={{ background: "rgb(var(--color-primary))" }}
        >
          {t("sendQuiz")}
        </button>
      </div>

    </div>
  );
}
