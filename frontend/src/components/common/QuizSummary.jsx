import React from "react";
import { useTranslation } from "react-i18next";
import { Clock, HelpCircle, Target, BarChart3, Repeat } from "lucide-react";

/* ===================================================
   QuizSummary
   Composant pour afficher un résumé d’un quiz
   Props:
     - totalQuestions : nombre total de questions
     - duration : durée du quiz en minutes
     - passingScore : le score minimum du quiz
     - maxAttempts : nombre maximum de tentatives (0 = illimité)
=================================================== */

export default function QuizSummary({ totalQuestions, totalPoints, duration, passingScore, maxAttempts }) {
  const { t } = useTranslation("createQuiz");
  const passPoints = Math.ceil((passingScore / 100) * totalPoints);

  //liste des items a afficher dans le resumé
  const items = [
    {
      label: t("totalQuestions"), // étiquette traduite
      value: totalQuestions, //nombre de questions
      icon: <HelpCircle className="w-4 h-4" /> //icon
    },
    {
      label: t("totalPoints"),
      value: totalPoints,
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      label: t("passScore"),
      value: `${passPoints} pts`, //score minimum
      icon: <Target className="w-4 h-4" />
    },
    {
      label: t("durationLabel"),
      value: `${duration} ${t("minutes")}`, //duree en minute
      icon: <Clock className="w-4 h-4" />
    },
    {
      label: t("maxAttempts"),
      value: maxAttempts === 0 ? t("unlimited") : maxAttempts, //nb max de tentatives (0=illimité)
      icon: <Repeat className="w-4 h-4" />
    }
  ];

  return (
    <div
      className="rounded-3xl shadow-xl p-6 max-w-[20rem] border border-white/10 backdrop-blur bg-grad-3"
    >
      {/* titre */}
      <h2
        className="text-lg font-semibold mb-4 tracking-wide"
        style={{ color: "var(--color-text-main)" }}
      >
        {t("quizSummary")}
      </h2>

      {/* items du resumé */}
      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center pb-2 border-b last:border-b-0 border-white/10"
          >
             {/* Label avec icône */}
            <div className="flex items-center gap-2">
              <span
                className="opacity-80"
                style={{ color: "var(--color-text-muted)" }}
              >
                {item.icon}
              </span>
              <span style={{ color: "var(--color-text-muted)" }}>
                {item.label}
              </span>
            </div>

            {/* Valeur correspondante */}
            <span
              className="font-semibold"
              style={{ color: "var(--color-text-main)" }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
