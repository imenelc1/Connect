import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaClock, FaMedal, FaStar, FaTrophy } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Button from "../components/common/Button";
import "../styles/index.css";

export default function QuizPage1() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("quiz1");
  const { exerciceId  } = useParams();

  const [lang, setLang] = useState("fr");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);

  const switchLang = () => {
    const newLang = lang === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  useEffect(() => {
  fetch(`http://localhost:8000/api/quiz/api/quiz/${exerciceId }/`)
    .then(res => {
      if (!res.ok) throw new Error("Quiz non trouvé");
      return res.json();
    })
    .then(data => {
      const q = Array.isArray(data) ? data[0] : data;

      const formatted=({
        quizId: q.id,                         // ✅ ID DU QUIZ
        //exerciceId: q.exercice?.exercice_id,
        title: q.exercice?.titre_exo,
        description: q.exercice?.enonce,
        level: q.exercice?.niveau_exo,
        duration: q.duration,
        points: q.scoreMinimum,
        question: q.questions.length,
        activer:q.activerDuration
      });
      setQuiz(formatted);

      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
});


  /* ================= LOADING ================= */

  /* ================= NOT FOUND ================= */
  

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 md:px-8 py-6"
      style={{ background: "rgb(var(--color-bg))" }}
    >
      {/* SWITCH LANG */}
      <div className="self-end mb-4">
        <button
          onClick={switchLang}
          className="px-4 py-2 bg-gray-200 rounded-md shadow-sm hover:bg-gray-300"
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>
      </div>

      {/* TITLE */}
      <h1 className="text-2xl md:text-4xl font-bold text-center text-[rgb(var(--color-primary))] mb-6">
        {quiz.title}
      </h1>

      {/* MAIN CARD */}
      <div className="bg-white rounded-2xl shadow-lg bg-grad-6 p-10 w-full max-w-3xl mb-10 min-h-[500px] flex flex-col justify-center">

        {/* ICON */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-[rgb(var(--color-primary))] flex items-center justify-center text-white shadow-md">
            <FaTrophy size={40} />
          </div>
        </div>

        {/* SLOGAN */}
        <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
          {t("slogan")}
        </h2>

        {/* DESCRIPTION */}
        <p className="text-sm md:text-base text-center text-grayc max-w-2xl mx-auto mb-10 leading-relaxed">
          {quiz.description}
        </p>

        {/* STATS */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 text-sm md:text-base mb-16">
            {quiz.activer && (
    <div className="flex items-center gap-2 bg-blue text-white px-4 py-2 rounded-md shadow-sm">
      <FaClock /> {quiz.duration} {t("minutes")}
    </div>
  )}

          <div className="flex items-center gap-2 bg-purple text-white px-4 py-2 rounded-md shadow-sm">
            <FaMedal /> {quiz.points} {t("points")}
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2 rounded-md shadow-sm text-white"
            style={{ background: "rgb(var(--color-pink))" }}
          >
            <FaStar /> {quiz.level}
          </div>
        </div>

        {/* DETAILS */}
        <div className="bg-white rounded-xl shadow-md p-8 text-sm md:text-base mb-16 w-full max-w-2xl mx-auto text-center">
          <p className="mb-3">
            <strong>{t("nombreQuestions")} :</strong> {quiz.question } {t("questions")}
          </p>
       {quiz.activer && (
    <p className="mb-3">
      <strong>{t("dureeEstimee")} :</strong> {quiz.duration} {t("minutes")}
    </p>
  )}
          <p>
            <strong>{t("pointsTotaux")} :</strong> {quiz.points} {t("points")}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col items-center w-full gap-6">
          <Button
            text={t("start")}
            variant="quizStart"
            onClick={() => navigate(`/quiz/${exerciceId}`)}
          />
          <Button
            text={t("back")}
            variant="quizBack"
            onClick={() => navigate("/all-quizzes")}
          />
        </div>
      </div>
    </div>
  );
}
