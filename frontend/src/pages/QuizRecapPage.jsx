import React, { useEffect, useState } from "react";
import { FaTrophy, FaRedoAlt, FaHome } from "react-icons/fa";
import Button from "../components/common/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

export default function QuizRecapPage() {
  const navigate = useNavigate();
  const { exerciceId } = useParams();
  const { t } = useTranslation("quiz3");

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Changement de langue
  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  /* ================= FETCH QUIZ + RÉPONSES ================= */
 useEffect(() => {
  const fetchQuizRecap = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/quiz/${exerciceId}/recap/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error("Quiz non trouvé");
      const data = await res.json();
      setQuiz(data[0]); // le backend renvoie un tableau
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  fetchQuizRecap();
}, [exerciceId]);

  if (loading) return <p>Chargement du quiz...</p>;
  if (!quiz) return <p>Quiz introuvable.</p>;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-background">

      {/* Bouton traduction */}
      <div className="w-full flex justify-end mb-4">
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 rounded-md text-sm font-semibold shadow-md"
          style={{ background: "rgb(var(--color-primary))", color: "white" }}
        >
          {i18n.language === "fr" ? "EN 🇬🇧" : "FR 🇫🇷"}
        </button>
      </div>

      {/* Titre */}
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">
        {quiz.exercice?.titre_exo}
      </h1>

      {/* Carte principale */}
      <div className="rounded-2xl shadow-lg p-8 w-full max-w-3xl flex flex-col items-center text-center mb-10 bg-blue_primary_light">
        {/* Icône */}
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl shadow-md mb-2">
          <FaTrophy size={40} />
        </div>

        {/* Score */}
        <div className="text-3xl font-bold mb-4 text-textc">
          {quiz.tentative?.score_total || 0} / {quiz.questions.length}
        </div>

        {/* Félicitations */}
        {quiz.tentative?.score_total >= quiz.scoreMinimum ? (
          <p className="text-green-600 text-xl mb-4">{t("congrats")}</p>
        ) : (
          <p className="text-red-600 text-xl mb-4">{t("tryAgain")}</p>
        )}

        {/* Récapitulatif des réponses */}
        <h3 className="text-xl font-semibold text-textc mb-4">{t("recap")}</h3>
        <div className="w-full max-w-3xl flex flex-col gap-6">
          {quiz.questions.map((q, index) => (
            <div key={q.id_qst} className="bg-card rounded-xl p-6 shadow-md text-left text-textc border border-blue">

              {/* Numéro + question */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 flex items-center justify-center rounded-md text-white font-bold text-sm bg-primary">
                  {index + 1}
                </div>
                <p className="font-semibold">{q.texte_qst}</p>
              </div>

              {/* Points */}
              <p className="text-sm text-grayc mb-2">{q.score} {t("point")}</p>

              {/* Options */}
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const isSelected = opt.id_option === q.student_answer_id;
                  const isCorrect = opt.texte_option === q.reponse_correcte;

                  let classes = "rounded-md p-1 border border-gray-300 bg-white text-textc";

                  if (isSelected && isCorrect) {
                    classes = "rounded-md p-1 border border-blue bg-blue-200 text-white";
                  } else if (isSelected && !isCorrect) {
                    classes = "rounded-md p-1 border border-red-500 bg-red-200 text-white";
                  } else if (!isSelected && isCorrect) {
                    classes = "rounded-md p-1 border border-blue-300 bg-blue-100 text-textc";
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
        <div className="flex flex-col md:flex-row gap-36 mt-10">
          <Button
            text={<span className="flex items-center gap-2"><FaHome /> {t("backMenu")}</span>}
            variant="quizBack"
            onClick={() => navigate("/all-quizzes")}
          />
          <Button
            text={<span className="flex items-center gap-2"><FaRedoAlt /> {t("reset")}</span>}
            variant="quizStart"
            onClick={() => navigate(`/QuizTake/${exerciceId}`)}
          />
        </div>

      </div>
    </div>
  );
}
