import React, { useEffect, useState } from "react";
import { FaTrophy, FaRedoAlt, FaHome } from "react-icons/fa";
import Button from "../components/common/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { getCurrentUserId } from "../hooks/useAuth";

export default function QuizRecapPage() {
  const navigate = useNavigate();
  const { exerciceId } = useParams();
  const currentUserId = getCurrentUserId();
  const { t } = useTranslation("quiz3");

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Changement de langue
  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  // ================= FETCH QUIZ + RÉPONSES =================
  useEffect(() => {
    const fetchQuizRecap = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/quiz/exercice/${exerciceId}/utilisateur/${currentUserId}/`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) throw new Error("Quiz non trouvé");
        const data = await res.json();
        setQuiz(data); // l'API renvoie directement un objet
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchQuizRecap();
  }, [exerciceId, currentUserId]);

  if (loading) return <p>Chargement du quiz...</p>;
  if (!quiz) return <p>Quiz introuvable.</p>;
  const totalPoints = quiz.quiz.questions ? quiz.quiz.questions.reduce((acc, q) => acc + q.score, 0) : 0;


  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 bg-bg text-textc">


      {/* Titre */}
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
        {quiz.titre_exo}
      </h1>




      {/* Icône */}
      <div className="w-full max-w-md bg-card border border-blue/20 rounded-2xl shadow-lg p-8 flex flex-col items-center mb-10">

        {/* Icône */}
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white shadow-md mb-4">
          <FaTrophy size={40} />
        </div>

        {/* Score */}
        <div className="text-3xl font-bold mb-3">
          {quiz.quiz.reponse_quiz_utilisateur?.score_total || 0} / {totalPoints}
        </div>

        {/* Message */}
        {quiz.quiz.reponse_quiz_utilisateur?.score_total >= quiz.quiz.scoreMinimum ||
          quiz.quiz.reponse_quiz_utilisateur?.score_total === totalPoints ? (
          <p className="text-green text-lg font-medium">
            {t("congrats")}
          </p>
        ) : (
          <p className="text-red text-lg font-medium">
            {t("tryAgain")}
          </p>
        )}
      </div>


      {/* Récapitulatif des réponses */}
      <h3 className="text-2xl font-semibold text-textc mb-6">
        {t("recap")}
      </h3>

      <div className="w-full max-w-3xl flex flex-col gap-6">
        {quiz.quiz.questions.map((q, index) => (
          <div
            key={q.id_qst}
            className="bg-card rounded-2xl p-6 shadow-md text-textc border border-blue/20"
          >


            {/* Numéro + question */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-primary text-white font-bold text-sm">
                {index + 1}
              </div>
              <p className="font-semibold text-base md:text-lg">
                {q.texte_qst}
              </p>
            </div>


            {/* Points */}
            <p className="text-sm text-grayc mb-4">
              {q.score} {t("point")}
            </p>


            {/* Options */}
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => {
                const isSelected = q.reponse_utilisateur?.option_choisie?.id_option === opt.id_option;
                const isCorrect = opt.texte_option === q.reponse_correcte;

                let classes =
                  "rounded-lg px-4 py-2 border text-sm transition";

                if (isCorrect) {
                  classes += " border-green bg-green/20 text-green font-medium";
                }

                if (isSelected && !isCorrect) {
                  classes += " border-red bg-red/20 text-red font-medium";
                }

                if (!isSelected && !isCorrect) {
                  classes += " border-grayc/30 bg-surface";
                }


                return (
                  <div key={opt.id_option} className={classes}>
                    {opt.texte_option}
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {/* Boutons */}
      <div className="flex justify-center mt-12">
        <Button
          variant="quizBack"
          onClick={() => navigate("/all-quizzes")}
          text={
            <span className="flex items-center gap-2">
              <FaHome />
              {t("backMenu")}
            </span>
          }
        />
      </div>


    </div>

  );
}
