import React, { useEffect, useState, useContext } from "react";
import { FaClock, FaMedal, FaStar, FaTrophy, FaRedoAlt, FaHome } from "react-icons/fa";
import Button from "../components/common/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import "../styles/index.css";

export default function RecQuizPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("quiz3");
  const { exerciceId } = useParams();

  // Bouton test traduction
  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  const quiz = {
    titre: t("title"),
    duree: 30,
    niveau: t(`levels.${t("levelKey")}`),
    pointsTotal: 4,
    score: 75,
    pointsObtenus: 3,
    questions: [
      {
        id: 1,
        texte: "Qu'est-ce qu'un algorithme ?",
        points: 1,
        options: [
          "Une suite d'instructions logiques pour résoudre un problème",
          "Un langage de programmation",
          "Un ordinateur",
        ],
        reponse: "Une suite d'instructions logiques pour résoudre un problème",
        bonneReponse: "Une suite d'instructions logiques pour résoudre un problème",
      },
      {
        id: 2,
        texte: "Une boucle permet de…",
        points: 1,
        options: [
          "Créer une variable",
          "Répéter une action tant qu'une condition est vraie",
          "Arrêter un programme",
        ],
        reponse: "Créer une variable",
        bonneReponse: "Répéter une action tant qu'une condition est vraie",
      },
      {
        id: 3,
        texte: "La boucle for est utilisée pour…",
        points: 1,
        options: [
          "Parcourir une séquence",
          "Créer une fonction",
          "Afficher un texte",
        ],
        reponse: "Parcourir une séquence",
        bonneReponse: "Parcourir une séquence",
      },
      {
        id: 4,
        texte: "La boucle while s’exécute tant que…",
        points: 1,
        options: [
          "Une condition est vraie",
          "Un nombre est pair",
          "Un fichier existe",
        ],
        reponse: "Une condition est vraie",
        bonneReponse: "Une condition est vraie",
      },
    ],
  };

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
        {quiz.titre}
      </h1>

      {/* Carte principale */}
      <div className="rounded-2xl shadow-lg p-8 w-full max-w-3xl flex flex-col items-center text-center mb-10 bg-blue_primary_light">
        
        {/* Icône */}
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl shadow-md mb-2">
          <FaTrophy size={40} />
        </div>

        {/* Score */}
        <div className="text-3xl font-bold mb-4 text-textc">{quiz.score}%</div>

        {/* Félicitations */}
        <h2 className="text-2xl font-semibold mb-2 text-grayc">{t("congrats")}</h2>
        <p className="text-base mb-6 text-grayc">
          {t("youScored")} <strong>{quiz.pointsObtenus}</strong> {t("points")} {t("outOf")} <strong>{quiz.pointsTotal}</strong>
        </p>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-16 mb-8 text-sm md:text-base">
          <div className="flex items-center gap-2 px-4 py-2 rounded-md shadow-sm bg-blue text-white">
            <FaClock /> {quiz.duree} {t("minutes")}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-md shadow-sm bg-purple text-white">
            <FaMedal /> {quiz.pointsTotal} {t("points")}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-md shadow-sm bg-pink text-white">
            <FaStar /> {quiz.niveau}
          </div>
        </div>

        {/* Récapitulatif des réponses */}
        <h3 className="text-xl font-semibold text-textc mb-4">{t("recap")}</h3>
        <div className="w-full max-w-3xl flex flex-col gap-6">
          {quiz.questions.map((q, index) => (
            <div key={q.id} className="bg-card rounded-xl p-6 shadow-md text-left text-textc border border-blue">
              
              {/* Numéro + question */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 flex items-center justify-center rounded-md text-white font-bold text-sm bg-primary">
                  {index + 1}
                </div>
                <p className="font-semibold">{q.texte}</p>
              </div>

              {/* Points */}
              <p className="text-sm text-grayc mb-2">{q.points} {t("point")}</p>

              {/* Options */}
              <div className="flex flex-col gap-2">
                {q.options.map((opt, i) => {
                  const isSelected = opt === q.reponse;
                  const isCorrect = opt === q.bonneReponse;

                  let classes = "rounded-md p-1 border border-blue text-textc bg-white";
                  let label = "";

                  if (isSelected && isCorrect) {
                    classes = "rounded-md p-1 border border-blue bg-blue_primary_light text-textc";
                    label = `${t("yourAnswer")}: `;
                  } else if (isSelected && !isCorrect) {
                    classes = "rounded-md p-1 border border-pink bg-pink_clair text-textc";
                    label = `${t("yourAnswer")}: `;
                  } else if (!isSelected && isCorrect && q.reponse !== q.bonneReponse) {
                    classes = "rounded-md p-1 border border-blue bg-blue_primary_light text-textc";
                    label = `${t("correctAnswer")}: `;
                  }

                  return (
                    <div key={i} className={classes}>
                      {label}{opt}
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
            text={
              <span className="flex items-center gap-2">
                <FaHome /> {t("backMenu")}
              </span>
            }
            variant="quizBack"
            onClick={() => navigate("/all-quizzes")}
          />
          <Button
            text={
              <span className="flex items-center gap-2">
                <FaRedoAlt /> {t("reset")}
              </span>
            }
            variant="quizStart"
            onClick={() => navigate(`/quiz/${exerciceId}`)}
          />
        </div>
      </div>
    </div>
  );
}
