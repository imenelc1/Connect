import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaMedal, FaStar, FaTrophy } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Button from "../components/common/Button";
import "../styles/index.css";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";
export default function QuizPage1() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("quiz1");
  const [lang, setLang] = useState("fr");

  const switchLang = () => {
    const newLang = lang === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  const quiz = {
    titre: t("titre"),
    slogan: t("slogan"),
    description: [t("desc1"), t("desc2"), t("desc3")],
    duree: 30,
    points: 4,
    niveau: t("niveau"),
    nombreQuestions: 4
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 py-6" style={{ background: "rgb(var(--color-bg))" }}>
      
      {/* Bouton test traduction */}
      <div className="self-end mb-4">
        <button
          onClick={switchLang}
          className="px-4 py-2 bg-gray-200 rounded-md shadow-sm hover:bg-gray-300"
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>
      </div>

      <h1 className="text-2xl md:text-4xl font-bold text-center text-[rgb(var(--color-primary))] mb-6">{quiz.titre}</h1>

      {/* Carte principale */}
      <div className="bg-white rounded-2xl shadow-lg bg-[rgb(var(--color-gray-light))] bg-grad-6 p-10 w-full max-w-3xl mb-10 min-h-[500px] flex flex-col justify-center">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-[rgb(var(--color-primary))] flex items-center justify-center text-white text-2xl shadow-md">
            <FaTrophy size={40} />
          </div>
        </div>

        <h2 className="text-lg md:text-xl font-semibold text-center text-[rgb(var(--color-text))] mb-2">{quiz.slogan}</h2>

        <div className="text-sm md:text-base text-center text-[rgb(var(--color-gray))] max-w-2xl mx-auto mb-16 leading-relaxed">
          {quiz.description.map((phrase, i) => (
            <p key={i} className="mb-2">{phrase}</p>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 text-sm md:text-base mb-20">
          <div className="flex items-center gap-2 bg-blue text-white px-4 py-2 rounded-md shadow-sm">
            <FaClock /> {quiz.duree} {t("minutes")}
          </div>
          <div className="flex items-center gap-2 bg-purple text-white px-4 py-2 rounded-md shadow-sm">
            <FaMedal /> {quiz.points} {t("points")}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-md shadow-sm" style={{ background: "rgb(var(--color-pink))", color: "white" }}>
            <FaStar /> {quiz.niveau}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-10 text-sm md:text-base text-[rgb(var(--color-text))] mb-20 w-full max-w-2xl mx-auto text-center">
          <p className="mb-4"><strong>{t("nombreQuestions")} :</strong> {quiz.nombreQuestions} {t("questions")}</p>
          <p className="mb-4"><strong>{t("dureeEstimee")} :</strong> {quiz.duree} {t("minutes")}</p>
          <p><strong>{t("pointsTotaux")} :</strong> {quiz.points} {t("points")}</p>
        </div>

        <div className="flex flex-col items-center w-full gap-6">
          <Button text={t("start")} variant="quizStart" onClick={() => console.log("Start quiz")} />
          <Button text={t("back")} variant="quizBack" onClick={() => navigate("/menu")} />
        </div>
      </div>
    </div>
  );
}
