import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaClock, FaMedal, FaStar, FaHome } from "react-icons/fa";
import { Globe } from "lucide-react";
import Button from "../components/common/Button";
import { useTranslation } from "react-i18next";

export default function QuizPreview() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation("createQuiz");
  const { exerciceId } = useParams();

  useEffect(() => {
    if (!exerciceId) return;

    fetch(`http://localhost:8000/api/quiz/api/quiz/${exerciceId}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Quiz non trouvé");
        return res.json();
      })
      .then((data) => {
        const q = Array.isArray(data) ? data[0] : data;

        setQuiz({
          id: q.id,
          scoreMinimum: q.scoreMinimum,
          durationMinutes: q.duration_minutes,
          activerDuration: q.activerDuration,
          nbMaxTentative: q.nbMax_tentative,
          exercice: {
            titre: q.exercice?.titre_exo,
            enonce: q.exercice?.enonce,
            niveau: q.exercice?.niveau_exo,
          },
          questions: q.questions.map((question) => ({
            id: question.id_qst,
            texte: question.texte_qst,
            score: question.score,
            options: question.options.map((opt) => ({
              id: opt.id_option,
              texte: opt.texte_option,
            })),
          })),
        });

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [exerciceId]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!quiz) return <div className="p-8 text-center">{t("noData")}</div>;

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.score, 0);

  return (
    <div className="min-h-screen px-2 sm:px-6 md:px-8 py-6 bg-[rgb(var(--color-bg))]">

   

      {/* TITRE */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mt-10 text-muted px-2">
        {quiz.exercice.titre}
      </h1>

      {/* ENONCÉ */}
      <p className="text-grayc mt-4 max-w-3xl mx-auto text-sm sm:text-base md:text-lg px-2 sm:px-0">
        {quiz.exercice.enonce}
      </p>

      {/* INFOS */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mt-8 text-sm sm:text-base">
        <div className="flex items-center gap-2 bg-blue text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-md text-sm sm:text-base">
          <FaClock />
          {quiz.activerDuration
            ? `${quiz.durationMinutes} ${t("minutes")}`
            : t("nonLimited")}
        </div>

        <div className="flex items-center gap-2 bg-purple text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-md text-sm sm:text-base">
          <FaMedal /> {totalPoints} {t("points")}
        </div>

        <div className="flex items-center gap-2 bg-pink text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-md text-sm sm:text-base">
          <FaStar /> {quiz.exercice.niveau}
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="mt-10 max-w-4xl w-full px-2 sm:px-4 mx-auto flex flex-col gap-4">
        {quiz.questions.map((q, index) => (
          <div key={q.id} className="bg-card rounded-xl shadow p-3 sm:p-4 md:p-6 flex flex-col gap-2">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1">
              {index + 1}. {q.texte}
            </h3>

            <p className="text-xs sm:text-sm text-grayc mb-2">
              {q.score} {t("points")}
            </p>

            <ul className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <li
                  key={opt.id}
                  className=" rounded-md px-2 sm:px-3 py-1.5 sm:py-2 bg-grad-2 w-full text-sm sm:text-base text-black dark:text-grayc"
                >
                  {opt.texte}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <Button
          text={
            <span className="flex items-center gap-2">
              <FaHome /> {t("backMenu")}
            </span>
          }
          variant="quizBack"
          className="mt-4 w-full sm:w-auto bg-grad-2"
          onClick={() => navigate("/all-quizzes")}
        />
      </div>
    </div>
  );
}
