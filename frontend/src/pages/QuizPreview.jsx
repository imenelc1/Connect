import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaClock, FaMedal, FaStar, FaHome } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Button from "../components/common/Button";
import Navbar from "../components/common/Navbar";

export default function QuizPreview() {
  const { exerciceId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("createQuiz");

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* Sidebar state */
  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  /* Fetch quiz */
  useEffect(() => {
    if (!exerciceId) return;

    fetch(`${process.env.REACT_APP_API_URL}/api/quiz/api/quiz/${exerciceId}/`)
      .then((res) => {
        if (!res.ok) throw new Error(t("errors.quizNotFound"));
        return res.json();
      })
      .then((data) => {
        const q = Array.isArray(data) ? data[0] : data;

        setQuiz({
          id: q.id,
          durationMinutes: q.duration_minutes,
          activerDuration: q.activerDuration,
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

  if (loading) return <div className="p-6">{t("loading")}</div>;
  if (!quiz) return <div className="p-6">{t("noData")}</div>;

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.score, 0);

  return (
    <div className="flex min-h-screen bg-surface">
      <Navbar />

      <main
        className={`
          flex-1 transition-all duration-300
          px-4 md:px-10 py-8
          ${sidebarCollapsed ? "md:ml-16" : "md:ml-56"}
        `}
      >
        {/* ===== HERO ===== */}
        <section className="max-w-5xl mx-auto text-center mb-10 animate-slide-in">
          <h1 className="
            text-4xl md:text-5xl font-extrabold
            bg-grad-all bg-clip-text text-transparent
          ">
            {quiz.exercice.titre}
          </h1>

          <p className="mt-4 text-gray max-w-3xl mx-auto leading-relaxed">
            {quiz.exercice.enonce}
          </p>
        </section>

        {/* ===== STATS ===== */}
        <section className="
          max-w-4xl mx-auto
          grid grid-cols-1 sm:grid-cols-3 gap-4
          mb-12
        ">
          <StatCard
            icon={
              <span className="text-[rgb(var(--color-primary))] dark:text-[rgb(var(--color-supp))]">
                <FaClock />
              </span>
            }
            label={quiz.activerDuration ? `${quiz.durationMinutes} ${t("minutes")}` : t("unlimited")}
            gradient="bg-grad-2"
          />
          <StatCard
            icon={
              <span className="text-[rgb(var(--color-yellow-code))] dark:text-[rgb(var(--color-icons-about))]">
                <FaMedal />
              </span>
            }
            label={`${totalPoints} ${t("points")}`}
            gradient="bg-grad-3"
          />

          <StatCard
            icon={
              <span className="text-[rgb(var(--color-tertiary))] dark:text-[rgb(var(--color-supp))]">
                <FaStar />
              </span>
            }
            label={t(`levels.${quiz.exercice.niveau}`)}

            gradient="bg-grad-4"
          />
        </section>

        {/* ===== QUESTIONS ===== */}
        <section className="max-w-5xl mx-auto space-y-4">
          {quiz.questions.map((q, index) => (
            <div
              key={q.id}
              className="
                bg-card rounded-2xl p-5
                shadow-card hover:shadow-strong
                transition
              "
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg">
                  {index + 1}. {q.texte}
                </h3>
                <span className="
                  text-sm px-3 py-1 rounded-full
                  bg-primary/10 text-primary font-medium
                ">
                  {q.score} pts
                </span>
              </div>

              <ul className="grid gap-2">
                {q.options.map((opt) => (
                  <li
                    key={opt.id}
                    className="
                      rounded-xl px-4 py-2
                      border border-gray-light
                      bg-grad-2
                      hover:bg-grad-3
                      transition
                    "
                  >
                    {opt.texte}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* ===== ACTION ===== */}
        <div className="flex justify-center mt-12">
          <Button
            variant="quizBack"
            text={
              <span className="flex items-center gap-2">
                <FaHome /> {t("backMenu")}
              </span>
            }
            onClick={() => navigate("/all-quizzes")}
          />
        </div>
      </main>
    </div>
  );
}

/* ===== SMALL COMPONENT ===== */
function StatCard({ icon, label, gradient }) {
  return (
    <div
      className={`
        ${gradient}
        rounded-2xl p-4
        shadow-card
        flex flex-col items-center justify-center
        gap-2
      `}
    >
      <div className="text-primary text-xl">{icon}</div>
      <span className="font-semibold text-sm text-center">{label}</span>
    </div>
  );
}

