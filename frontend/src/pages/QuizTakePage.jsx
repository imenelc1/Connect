import React, { useEffect, useState, useContext } from "react";
import { FaClock, FaMedal, FaStar } from "react-icons/fa";
import ContentProgress from "../components/common/ContentProgress";
import Button from "../components/common/Button";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUserId } from "../hooks/useAuth";

export function QuizTakePage() {
  const { t, i18n } = useTranslation("quiz2");
  const { exerciceId } = useParams();
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null); // Timer global
  const currentUserId = getCurrentUserId();

  /* ================= FETCH QUIZ ================= */
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
          quizId: q.id,
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

        setQuiz(formattedQuiz);

        if (formattedQuiz.activerDuration) {
          setSecondsLeft(formattedQuiz.durationMinutes * 60);
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [exerciceId]);

  /* ================= TIMER GLOBAL ================= */
  useEffect(() => {
    if (secondsLeft === null || !quiz?.activerDuration) return;

    if (secondsLeft <= 0) {
      submitQuiz(); // soumission automatique
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, quiz]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ================= LOGIQUE QUIZ ================= */
  const q = quiz?.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progressValue = quiz ? (answeredCount / quiz.questions.length) * 100 : 0;

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const submitQuiz = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/quiz/quiz/submit/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            utilisateur: currentUserId,
            quiz_id: quiz.quizId,
            answers: answers,
          }),
        }
      );

      const data = await response.json();

      navigate(`/QuizRecape/${exerciceId}`, {
        state: data,
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la soumission du quiz");
    }
  };

  const nextQuestion = () => {
    if (!answers[q.id]) return;

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  /* ================= USER ================= */
  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined"
      ? JSON.parse(storedUser)
      : null;

  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";

  if (loading || !quiz) return <p>Chargement...</p>;

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex flex-col px-3 py-3">
      <div className="flex justify-end">
        <UserCircle
          initials={initials}
          onToggleTheme={toggleDarkMode}
          onChangeLang={(lang) => i18n.changeLanguage(lang)}
        />
      </div>

      <h1 className="text-2xl font-bold text-center mb-6">{quiz.exercice.titre}</h1>

      <div className="rounded-2xl shadow-lg p-4 bg-grad-2">
        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6 text-white">
          {quiz.activerDuration && (
            <div className="flex items-center gap-2 bg-blue px-4 py-2 rounded text-white">
              <FaClock /> {formatTime(secondsLeft)}
            </div>
          )}
          <div className="flex items-center gap-2 bg-purple px-4 py-2 rounded">
            <FaMedal /> {quiz.scoreMinimum}
          </div>

          <div className="flex items-center gap-2 bg-pink px-4 py-2 rounded">
            <FaStar /> {quiz.exercice.niveau}
          </div>
        </div>

        <p className="text-sm mb-2">
          {t("question")} {currentQuestion + 1} / {quiz.questions.length}
        </p>

        <ContentProgress value={progressValue} className="mb-6" />

        <div className="bg-white rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-3">{q.texte}</h3>

          <div className="flex flex-col gap-2">
            {q.options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={answers[q.id] === opt.id}
                  onChange={() => handleSelect(q.id, opt.id)}
                />
                <span>{opt.texte}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button text={`< ${t("prev")}`} onClick={prevQuestion} disabled={currentQuestion === 0} />
          <Button text={`${t("next")} >`} onClick={nextQuestion} disabled={!answers[q.id]} />
        </div>
      </div>
    </div>
  );
}
