import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaClock, FaMedal, FaStar, FaTrophy } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Button from "../components/common/Button";
import "../styles/index.css";

export default function QuizIntroPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("quiz1");
  const { exerciceId } = useParams();

  const [lang, setLang] = useState("fr");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  const switchLang = () => {
    const newLang = lang === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  useEffect(() => {
    fetch(`https://connect-1-t976.onrender.com/api/quiz/api/quiz/${exerciceId}/`)
      .then(res => {
       if (!res.ok) throw new Error(t("noQuiz"));
        return res.json();
      })
      .then(data => {
        const q = Array.isArray(data) ? data[0] : data;

        const formatted = {
          quizId: q.id,
          title: q.exercice?.titre_exo,
          description: q.exercice?.enonce,
          level: q.exercice?.niveau_exo,
          duration: q.duration_minutes,
          points: q.scoreMinimum,
          question: q.questions.length,
          activer: q.activerDuration,
          questions: q.questions.map((question) => ({
            id: question.id_qst,
            texte: question.texte_qst,
            score: question.score,
            options: question.options.map((opt) => ({
              id: opt.id_option,
              texte: opt.texte_option,
            })),
          })),
        };

        setQuiz(formatted);
      })
      .catch(err => {
        console.error(err);
        setQuiz(null);
      })
      .finally(() => setLoading(false));
  }, [exerciceId]);

  if (loading) {
    return <div className="text-center mt-20 text-lg">{t("loading")}</div>;
  }

  if (!quiz) {
    return <div className="text-center mt-20 text-lg">{t("noQuiz")}</div>;
  }

  const totalPoints = quiz.questions
    ? quiz.questions.reduce((acc, q) => acc + q.score, 0)
    : 0;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 py-6 bg-primary/30">
      {/* TITLE */}
   <h1
  className="w-full max-w-3xl mx-auto px-3
             text-2xl md:text-4xl font-bold text-center
             break-all overflow-hidden
             text-[rgb(var(--color-primary))]
             mb-6"
>
  {quiz.title}
</h1>

      {/* ICON */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[rgb(var(--color-primary))] flex items-center justify-center text-white shadow-md">
          <FaTrophy size={30} md={40} />
        </div>
      </div>

      {/* SLOGAN */}
      <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
        {t("slogan")}
      </h2>

      {/* DESCRIPTION */}
    <p
  className="w-full max-w-2xl mx-auto px-3
             text-sm md:text-base text-center text-grayc
             break-all overflow-hidden
             leading-relaxed mb-8 md:mb-10"
>
  {quiz.description}
</p>


      {/* STATS */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-10 text-sm md:text-base mb-8 md:mb-16">
        {quiz.activer && (
          <div className="flex items-center gap-2 bg-blue text-white px-4 py-2 rounded-md shadow-sm">
            <FaClock /> {quiz.duration} {t("minutes")}
          </div>
        )}

        <div className="flex items-center gap-2 bg-purple text-white px-4 py-2 rounded-md shadow-sm">
          <FaMedal /> {totalPoints} {t("points")}
        </div>

        <div
          className="flex items-center gap-2 px-4 py-2 rounded-md shadow-sm text-white"
          style={{ background: "rgb(var(--color-pink))" }}
        >
          <FaStar /> {t(`levels.${quiz.level.toLowerCase()}`)}
        </div>
      </div>

      {/* DETAILS */}
      <div className="bg-card rounded-xl shadow-md p-6 md:p-8 text-sm md:text-base mb-8 md:mb-16 w-full max-w-2xl mx-auto text-center text-black dark:text-white">
        <p className="mb-3">
          <strong>{t("nombreQuestions")} :</strong> {quiz.question} {t("questions")}
        </p>
        {quiz.activer && (
          <p className="mb-3">
            <strong>{t("dureeEstimee")} :</strong> {quiz.duration} {t("minutes")}
          </p>
        )}
        <p>
          <strong>{t("pointsTotaux")} :</strong> {quiz.points}/{totalPoints} {t("points")}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col items-center w-full gap-4 md:gap-6">
        <Button
          text={t("start")}
          variant="quizStart"
          className="w-full md:w-auto"
          onClick={() => navigate(`/QuizTake/${exerciceId}`)}
        />
        <Button
          text={t("back")}
          variant="quizBack"
          className="w-full md:w-auto"
          onClick={() => navigate("/all-quizzes")}
        />
      </div>
    </div>
  );
}

