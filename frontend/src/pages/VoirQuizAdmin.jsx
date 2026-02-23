import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaClock, FaMedal, FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import Button from "../components/common/Button";
import { FaTrophy, FaRedoAlt, FaHome } from "react-icons/fa";


export default function VoirQuizAdmin() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation("createQuiz");
  const { exerciceId } = useParams();

  useEffect(() => {
    if (!exerciceId) return;

    fetch(`${import.meta.env.VITE_API_BASE}/api/quiz/api/quiz/${exerciceId}/`)
      .then((res) => {
        if (!res.ok) throw new Error(t("errors.quizNotFound"));

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

  if (loading) return <div className="p-8">{t("loading")}</div>;

  if (!quiz) return <div className="p-8">{t("noData")}</div>;

  const totalPoints = quiz.questions.reduce(
    (sum, q) => sum + q.score,
    0
  );

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 bg-surface">

      {/* ACTIONS */}
      <div className="absolute top-4 right-4 flex gap-3">
        <div
          onClick={toggleLanguage}
          className="cursor-pointer p-2 rounded-md bg-white/20 hover:bg-white/30"
        >
          <Globe size={18} />
        </div>


      </div>

      {/* TITRE */}
      <h1 className="text-2xl md:text-3xl font-bold text-center mt-10 text-muted">
        {quiz.exercice.titre}
      </h1>

      {/* ENONCÉ */}
      <p className="text-grayc mt-4 max-w-3xl mx-auto">
        {quiz.exercice.enonce}
      </p>

      {/* INFOS */}
      <div className="flex justify-center gap-6 mt-8 text-sm">

        <div className="flex items-center gap-2 bg-blue text-white px-6 py-2 rounded-md">
          <FaClock />
          {quiz.activerDuration
            ? `${quiz.durationMinutes} ${t("minutes")}`
            : t("nonLimited")}
        </div>

        <div className="flex items-center gap-2 bg-purple text-white px-6 py-2 rounded-md">
          <FaMedal /> {totalPoints} {t("points")}
        </div>

        <div className="flex items-center gap-2 bg-pink text-white px-6 py-2 rounded-md">
          <FaStar /> <FaStar /> {t(`levels.${quiz.exercice.niveau}`)}

        </div>

      </div>

      {/* QUESTIONS */}
      <div className="mt-10 max-w-4xl mx-auto flex flex-col gap-4">

        {quiz.questions.map((q, index) => (
          <div
            key={q.id}
            className="bg-card rounded-xl shadow p-4"
          >
            <h3 className="font-semibold mb-2">
              {index + 1}. {q.texte}
            </h3>

            <p className="text-xs text-grayc mb-3">
              {q.score} {t("points")}
            </p>

            <ul className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <li
                  key={opt.id}
                  className="border rounded-md px-3 py-2 bg-card"
                >
                  {opt.texte}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Button
          text={<span className="flex items-center gap-2"><FaHome /> {t("backMenu")}</span>}
          variant="quizBack"
          onClick={() => navigate("/QuizManagement")}
        />
      </div>

    </div>
  );
}