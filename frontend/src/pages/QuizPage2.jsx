import React, { useState } from "react";
import { FaClock, FaMedal, FaStar } from "react-icons/fa";
import ContentProgress from "../components/common/ContentProgress";
import Button from "../components/common/Button";
import { useTranslation } from "react-i18next";
import "../styles/index.css";

export function QuizPage2() {
  const { t, i18n } = useTranslation("quiz2");

  const quiz = {
    titre: t("title"),          // Traduit le titre
    description: t("description"), 
    duree: 30,
    niveau: t("level"),         // Traduit le niveau
    questions: [
      {
        id: 1,
        texte: "Qu'est-ce qu'un algorithme ?",
        options: [
          "Un programme exécutable.",
          "Une suite d'instructions logiques pour résoudre un problème",
          "Une variable"
        ]
      },
      {
        id: 2,
        texte: "Une boucle permet de…",
        options: [
          "Répéter des instructions",
          "Créer une variable",
          "Arrêter un programme"
        ]
      },
      {
        id: 3,
        texte: "La boucle for est utilisée pour…",
        options: [
          "Parcourir une séquence",
          "Créer une fonction",
          "Afficher un message"
        ]
      },
      {
        id: 4,
        texte: "La boucle while s’exécute tant que…",
        options: [
          "Une condition est vraie",
          "Le programme est terminé",
          "Une variable existe"
        ]
      }
    ]
  };

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleSelect = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const q = quiz.questions[currentQuestion];
  const progressValue = ((currentQuestion + 1) / quiz.questions.length) * 100;

  // Fonction pour tester la traduction
  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  return (
    <div
      className="min-h-screen flex flex-col px-4 md:px-8 py-4 md:py-6"
      style={{ background: "rgb(var(--color-bg))" }}
    >
      {/* Bouton test traduction */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400 text-sm"
        >
          Test Traduction
        </button>
      </div>

      <h1 className="text-xl md:text-3xl font-bold text-center mt-2 mb-4 md:mb-6 text-[rgb(var(--color-primary))]">
        {quiz.titre}
      </h1>

      <div className="flex-1 w-full rounded-2xl shadow-lg mt-4 md:mt-10 gap-10 p-4 md:p-6 bg-grad-2">
        {/* Stats */}
        <div className="flex flex-col md:flex-row md:justify-center gap-6 md:gap-x-80 text-xs md:text-sm mb-6">
          <div className="px-6 md:px-8 py-2 rounded-md shadow-sm flex items-center gap-6 justify-center bg-blue text-white">
            <FaClock /> {quiz.duree} {t("minutes")}
          </div>
          <div className="px-6 md:px-8 py-2 rounded-md shadow-sm flex items-center gap-6 justify-center bg-purple text-white">
            <FaMedal /> {quiz.questions.length} {t("points")}
          </div>
          <div
            className="px-6 md:px-8 py-2 rounded-md shadow-sm flex items-center gap-6 justify-center"
            style={{ background: "rgb(var(--color-pink))", color: "white" }}
          >
            <FaStar /> {quiz.niveau}
          </div>
        </div>

        {/* Progress */}
        <p className="text-sm mb-1 text-[rgb(var(--color-gray))]">
          {t("question")} {currentQuestion + 1} / {quiz.questions.length}
        </p>
        <ContentProgress value={progressValue} className="mb-6" />

        {/* Question */}
        <div className="rounded-xl shadow-sm p-3 md:p-4 bg-grad-3 mb-6">
          <h3 className="font-semibold mb-1 flex items-center gap-2 text-sm md:text-base">
            <div
              className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-md text-white text-xs md:text-sm font-bold"
              style={{ background: "rgb(var(--color-primary))" }}
            >
              {currentQuestion + 1}
            </div>
            <span>{q.texte}</span>
          </h3>

          <p className="text-xs md:text-sm text-[rgb(var(--color-gray))] mb-2">
            1 {t("point")}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-2">
            {q.options.map((opt, index) => (
              <label
                key={index}
                className="flex items-center gap-3 cursor-pointer border rounded-md px-3 py-2 shadow-sm bg-white"
              >
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={answers[q.id] === opt}
                  onChange={() => handleSelect(q.id, opt)}
                  className="accent-blue-500"
                />
                <span className="text-sm md:text-base text-black/70">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between w-full">
          <Button
            text={`< ${t("prev")}`}
            onClick={prevQuestion}
            variant="quizPrev"
            disabled={currentQuestion === 0}
          />
          <Button
            text={`${t("next")} >`}
            onClick={nextQuestion}
            variant="quizNext"
            disabled={currentQuestion === quiz.questions.length - 1}
          />
        </div>
      </div>
    </div>
  );
}
