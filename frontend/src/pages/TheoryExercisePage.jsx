// src/pages/ExercisePage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, Globe } from "lucide-react";
import { MdAutoAwesome } from "react-icons/md";
import { useParams } from "react-router-dom";

import NavBar from "../components/common/NavBar";
import Mascotte from "../assets/head_mascotte.svg";
import AssistantIA from "./AssistantIA";
import progressionService from "../services/progressionService";
import toast from "react-hot-toast";

export default function TheoryExercisePage() {
  const [openAssistant, setOpenAssistant] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [answer, setAnswer] = useState("");
  const [exercise, setExercise] = useState(null);
  const { exerciceId } = useParams();
  const [loadingExercise, setLoadingExercise] = useState(true);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (exercise) setStartTime(Date.now());
  }, [exercise]);

  // Fonction utilitaire pour calculer le temps passé en secondes
  const getTempsPasse = () => Math.floor((Date.now() - startTime) / 1000);

  // ------------------- SAVE DRAFT -------------------
  const handleSaveDraft = async () => {
    if (!exercise) return;

    try {
      setLoading(true);

      const res = await progressionService.createTentative({
        exercice_id: exercise.id_exercice,
        reponse: answer,
        output: "",
        etat: "brouillon",
        temps_passe: getTempsPasse(),
      });

      setFeedback(res.data?.feedback || "Brouillon sauvegardé !");
      toast.success("Solution sauvegardée !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error.response || error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- SEND SOLUTION -------------------
  const handleSendSolution = async () => {
    if (!exercise) return;

    try {
      setLoading(true);

      const res = await progressionService.submitTentative({
        exercice_id: exercise.id_exercice,
        reponse: answer,
        output: "",
        etat: "soumis",
        temps_passe: getTempsPasse(),
      });

      setFeedback(res.data?.feedback || "Solution envoyée !");
      toast.success("Solution envoyée !");
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error.response || error);

      if (error.response && error.response.status === 403) {
        toast.error("Vous n'êtes pas autorisé à soumettre cet exercice !");
      } else {
        toast.error("Erreur lors de l'envoi");
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------- FETCH EXERCISE -------------------
  useEffect(() => {
    if (!exerciceId) return;

    const fetchExercise = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/exercices/${exerciceId}/`);
        if (!response.ok) throw new Error("Erreur lors de la récupération de l'exercice");
        const data = await response.json();
        setExercise(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingExercise(false);
      }
    };

    fetchExercise();
  }, [exerciceId]);

  const { t, i18n } = useTranslation("exercisePage");
  const switchLang = () => i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");

  const getStarGradient = (i) => {
    if (i <= 2) return "star-very-easy";
    if (i <= 4) return "star-moderate";
    return "star-difficult";
  };

  const [canSubmit, setCanSubmit] = useState(false);

  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";
  const isStudent = userData.role === "etudiant";

  useEffect(() => {
    if (!exerciceId) return;

    fetch(`http://localhost:8000/api/dashboard/tentatives/can-submit/${exerciceId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => setCanSubmit(data.can_submit))
      .catch(() => setCanSubmit(false));
  }, [exerciceId]);


  return (
    <div className="flex bg-[rgb(var(--color-surface))] min-h-screen">
      <div className="hidden lg:block">
        <NavBar />
      </div>
      <div className="lg:hidden w-full">
        <NavBar />
      </div>

      <div className="flex-1 lg:ml-72 px-4 sm:px-6 md:px-10 lg:px-12 py-6 sm:py-8 md:py-10 w-full">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 md:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[rgb(var(--color-primary))] mb-2">
              {t("exercise_title")}
            </h1>
            <p className="text-[rgb(var(--color-text))] text-base sm:text-lg md:text-xl font-medium">
              {t("question_title")}
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <button
              onClick={switchLang}
              className="p-2 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-gray-light))] rounded-xl shadow hover:brightness-95 transition flex items-center justify-center"
            >
              <Globe size={18} className="text-[rgb(var(--color-primary))]" />
            </button>

            <button
              onClick={() => setOpenAssistant(true)}
              className="flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl bg-[rgb(var(--color-primary))] text-white font-medium shadow-md hover:brightness-110 transition text-xs sm:text-sm md:text-base"
            >
              <MessageCircle size={18} strokeWidth={1.8} /> AI Assistant
            </button>

            <img
              src={Mascotte}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11"
              alt="Mascotte"
            />
          </div>
        </div>

        {/* EXERCISE CARD */}
        <div className="border border-[rgb(var(--color-gray-light))] bg-[rgb(var(--grad-6))] shadow-card rounded-2xl px-4 sm:px-5 md:px-6 py-5 mb-12">
          {exercise ? (
            <>
              <p className="font-semibold text-[rgb(var(--color-primary))] text-lg sm:text-xl md:text-xl">
                Exercice
                <span className="font-normal text-[rgb(var(--color-text))] ml-2 text-base sm:text-lg">
                  {exercise.titre_exo}
                </span>
              </p>
              <p className="text-[rgb(var(--color-gray))] mt-2 text-sm sm:text-base">
                {exercise.enonce}
              </p>
            </>
          ) : (
            <p className="text-red-500 text-sm">Impossible de charger l'exercice.</p>
          )}
        </div>

        {/* SOLUTION AREA */}
        <h2 className="text-lg sm:text-xl font-semibold text-[rgb(var(--color-primary))] mb-3">
          {t("your_solution")}
        </h2>

        <div className="relative w-full mb-10">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t("write_here")}
            className="w-full min-h-[150px] sm:min-h-[200px] md:min-h-[250px] p-5 rounded-2xl border border-gray-300 bg-white text-[rgb(var(--color-text))] text-base sm:text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:shadow-md resize-none transition-all duration-200 hover:shadow-md"
          />
          <div className="absolute top-2 right-4 text-xs text-gray-400">
            {answer.length} / 1000 | {answer.split("\n").length} {t("lines")}
          </div>
        </div>

        {/* TIP BLOCK */}
        <div className="border border-[rgb(var(--color-gray-light))] bg-[rgb(var(--grad-7))] shadow-card rounded-xl px-4 sm:px-5 md:px-6 py-4 mt-10 mb-12">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white shadow"
              style={{ backgroundImage: "var(--grad-1)" }}
            >
              <MdAutoAwesome size={18} />
            </div>
            <div>
              <p className="font-semibold text-[rgb(var(--color-primary))] text-base sm:text-lg">
                Tip
              </p>
              <p className="text-xs sm:text-sm text-[rgb(var(--color-gray))] mt-1">
                {t("advice_text")}
              </p>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        {isStudent && (<div className="flex justify-around mb-5">
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="px-8 py-3 rounded-xl font-semibold shadow-md
            bg-white border border-[rgb(var(--color-primary))]
            text-[rgb(var(--color-primary))]"
          >
            Sauvegarder
          </button>

          <button
            onClick={handleSendSolution}
            disabled={!canSubmit || loading}
            className={`
    px-8 py-3 rounded-xl font-semibold shadow-lg transition
    ${!canSubmit || loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60 pointer-events-none"
                : "text-white hover:opacity-90"}
  `}
            style={
              !canSubmit || loading
                ? { backgroundImage: "none" }
                : { backgroundImage: "var(--grad-1)" }
            }
          >
            {t("send_solution")}
          </button>



        </div>)}

        {/* FEEDBACK */}
        <div className="p-6 sm:p-7 md:p-8 rounded-2xl shadow-card border mb-24" style={{ backgroundImage: "var(--grad-8)" }}>
          <p className="font-semibold text-[rgb(var(--color-primary))] text-base sm:text-lg mb-1">
            {t("feedback_title")}
          </p>
          <p className="text-[rgb(var(--color-gray))] text-xs sm:text-sm mb-6 sm:mb-8">
            {t("feedback_subtitle")}
          </p>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="flex gap-3 text-2xl sm:text-3xl">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  className={`cursor-pointer text-transparent bg-clip-text drop-shadow 
                    ${getStarGradient(i)} 
                    ${(hover || rating) >= i ? "opacity-100 scale-110" : "opacity-40"} 
                    transition-all duration-150`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="flex justify-between w-full text-xs sm:text-sm font-medium mt-2">
              <span className="w-24 text-left label-very-easy">{t("labels.veryEasy")}</span>
              <span className="w-24 text-center label-moderate">{t("labels.moderate")}</span>
              <span className="w-24 text-right label-very-difficult">{t("labels.veryDifficult")}</span>
            </div>
          </div>

          <p className="text-[rgb(var(--color-primary))] text-xs sm:text-sm flex items-center gap-2">
            {t("need_help")}
          </p>
        </div>

        {/* HELP BUTTON */}
        <div className="flex justify-center my-10 md:my-12">
          <button
            onClick={() => setOpenAssistant(true)}
            className="flex items-center gap-3 px-4 sm:px-5 py-2 rounded-full bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-gray-light))] shadow hover:brightness-95 transition"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-[rgb(var(--color-gray-light))] flex items-center justify-center">
              <MessageCircle size={16} strokeWidth={1.7} />
            </div>
            <span className="text-xs sm:text-sm text-[rgb(var(--color-primary))] font-medium">
              {t("need_help")}
            </span>
          </button>
        </div>
      </div>

      {/* ASSISTANT IA */}
      {openAssistant && (
        <>
          <div className="fixed inset-0 z-50 lg:hidden bg-white">
            <AssistantIA onClose={() => setOpenAssistant(false)} fullscreen />
          </div>

          <div className="hidden lg:block fixed bottom-6 right-6 w-[380px] z-50">
            <AssistantIA onClose={() => setOpenAssistant(false)} />
          </div>
        </>
      )}
    </div>
  );
}
