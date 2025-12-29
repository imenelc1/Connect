import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaClock, FaMedal, FaStar, FaHome } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Button from "../components/common/Button";

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

  if (loading) return <div className="p-8 text-center">{t("loading")}</div>;
  if (!quiz) return <div className="p-8 text-center">{t("noData")}</div>;

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.score, 0);

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 py-6 bg-[rgb(var(--color-bg))]">

      {/* TITRE */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mt-10 text-muted">
        {quiz.exercice.titre}
      </h1>

      {/* ENONCÉ */}
      <p className="text-grayc mt-4 max-w-3xl mx-auto text-sm sm:text-base">
        {quiz.exercice.enonce}
      </p>

      {/* INFOS DU QUIZ */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-8 text-sm">
        <div className="flex items-center gap-2 bg-blue text-white px-4 sm:px-6 py-2 rounded-md w-full sm:w-auto justify-center">
          <FaClock />
          {quiz.activerDuration
            ? `${quiz.durationMinutes} ${t("minutes")}`
            : t("nonLimited")}
        </div>

        <div className="flex items-center gap-2 bg-purple text-white px-4 sm:px-6 py-2 rounded-md w-full sm:w-auto justify-center">
          <FaMedal /> {totalPoints} {t("points")}
        </div>

        <div className="flex items-center gap-2 bg-pink text-white px-4 sm:px-6 py-2 rounded-md w-full sm:w-auto justify-center">
          <FaStar /> {quiz.exercice.niveau}
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="mt-10 max-w-4xl mx-auto flex flex-col gap-4">
        {quiz.questions.map((q, index) => (
          <div key={q.id} className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-3">
            <h3 className="font-semibold text-sm sm:text-base">
              {index + 1}. {q.texte}
            </h3>

            <p className="text-xs sm:text-sm text-grayc">
              {q.score} {t("points")}
            </p>

            <ul className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <li
                  key={opt.id}
                  className="border rounded-md px-3 py-2 bg-gray-50 w-full text-sm sm:text-base"
                >
                  {opt.texte}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* BOUTON RETOUR */}
        <Button
          className="w-full sm:w-auto mt-6 self-center"
          text={<span className="flex items-center gap-2"><FaHome /> {t("backMenu")}</span>}
          variant="quizBack"
          onClick={() => navigate("/all-quizzes")}
        />
      </div>
    </div>
  );
}
