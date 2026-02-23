// src/pages/ExercisePage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, Globe } from "lucide-react";
import { MdAutoAwesome } from "react-icons/md";
import { useParams } from "react-router-dom";

import NavBar from "../components/common/Navbar";
import Mascotte from "../assets/head_mascotte.svg";
import HeadMascotte from "../components/ui/HeadMascotte";

import AssistantIA from "./AssistantIA";
import progressionService from "../services/progressionService";
import toast from "react-hot-toast";
import TheoryExerciseContext from "../context/TheoryExerciseContext";
export default function TheoryExercisePage() {
  const [openAssistant, setOpenAssistant] = useState(false);
  const [answer, setAnswer] = useState("");
  const [exercise, setExercise] = useState(null);
  const { exerciceId } = useParams();
  const [loadingExercise, setLoadingExercise] = useState(true);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [aiAllowed, setAiAllowed] = useState(true); // par défaut IA activée

  const [startTime, setStartTime] = useState(Date.now());

  const { t, i18n } = useTranslation("exercisePage");

  /* ================= USER ================= */
  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined"
      ? JSON.parse(storedUser)
      : null;

  // ✅ NORMALISATION ICI (CLÉ UNIQUE)
  const userId =
    userData?.id_utilisateur ??
    userData?.user_id ??
    userData?.id ??
    null;

  const isStudent = userData?.role === "etudiant";

  /* ================= TIMER ================= */
  useEffect(() => {
    if (exercise) setStartTime(Date.now());
  }, [exercise]);

  const getTempsPasse = () =>
    Math.floor((Date.now() - startTime) / 1000);

  /* ================= SAVE DRAFT ================= */
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

      setFeedback(res.data?.feedback || t("draft_saved"));
      toast.success(t("solution_saved"));
    } catch (error) {
      toast.error(t("save_error"));
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEND SOLUTION ================= */
  const handleSendSolution = async () => {
    if (!exercise) return;

    try {
      setLoading(true);

      await progressionService.submitTentative({
        exercice_id: exercise.id_exercice,
        reponse: answer,
        output: "",
        etat: "soumis",
        temps_passe: getTempsPasse(),
      });

      toast.success(t("solution_sent"));

      const canSubmitRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dashboard/tentatives/can-submit/${exercise.id_exercice}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const canSubmitData = await canSubmitRes.json();
      setCanSubmit(canSubmitData.can_submit);

      if (!canSubmitData.can_submit) {
        toast.error(t("all_attempts_used"));
      }
    } catch (error) {
      toast.error(t("send_error"));
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH EXERCISE ================= */
  useEffect(() => {
    if (!exerciceId) return;

    const fetchExercise = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/exercices/${exerciceId}/`
        );
        if (!response.ok) throw new Error();
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

  /* ================= CAN SUBMIT ================= */
  useEffect(() => {
    if (!exerciceId || !isStudent) return;

    fetch(
      `${import.meta.env.VITE_API_URL}/api/dashboard/tentatives/can-submit/${exerciceId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => setCanSubmit(data.can_submit))
      .catch(() => setCanSubmit(false));
  }, [exerciceId, isStudent]);

  /* ================= LAST TENTATIVE ================= */
  useEffect(() => {
    if (!exercise || !isStudent || !userId) return;

    const fetchLastTentative = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/${exercise.id_exercice}/utilisateur/${userId}/tentativerep/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) return;

        const last = await res.json();
        if (last?.reponse) setAnswer(last.reponse);
      } catch (err) {
        console.error(t("loadAttemptError"), err);
      }
    };

    fetchLastTentative();
  }, [exercise, isStudent, userId]);


  // Verifier si on active l'IA ou non

  useEffect(() => {
    if (!exercise || !isStudent || !userId) return;

    const checkAIStatus = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/spaces/exercice/${exercise.id_exercice}/student/${userId}/check/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) throw new Error(t("aiStatusCheckFailed"));

        const data = await res.json();

        // Désactiver l'IA si un espace commun existe et ai_enabled === false
        if (data.same_space) {
          const disabled = data.spaces.some(space => space.ai_enabled === false);
          setAiAllowed(!disabled); // false = désactivé
        } else {
          setAiAllowed(true); // pas d'espace commun = IA activée
        }
      } catch (err) {
        console.error(t("aiCheckError"), err);
        setAiAllowed(true); // fallback : IA activée
      }
    };

    checkAIStatus();
  }, [exercise, userId, isStudent]);



  const switchLang = () =>
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
  // / États de l'interface
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Gestion de la responsivité
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  /* ================= RENDER ================= */
  return (
    <TheoryExerciseContext.Provider
      value={{
        id: exercise?.id_exercice,
        titre: exercise?.titre_exo,
        enonce: exercise?.enonce,
        reponse: answer,
        type: "theory",
      }}
    >

      <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
        {/* Sidebar */}
        <div>
          <NavBar />
        </div>


        <div className={`
            flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
            ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
          `}>
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 md:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-muted mb-2">
                {t("exercise_title")}
              </h1>
              <p className="text-[rgb(var(--color-text))] text-base sm:text-lg md:text-xl font-medium">
                {t("question_title")}
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 md:gap-5">


              <HeadMascotte
                courseData={exercise}
                aiEnabled={aiAllowed} // <-- nouveau prop
              />



            </div>
          </div>

          {/* EXERCISE CARD */}
          <div className="border border-[rgb(var(--color-gray-light))] 
                bg-card shadow-card rounded-2xl 
                px-4 sm:px-5 md:px-6 py-5 mb-12
                w-full max-w-full break-words">
            {exercise ? (
              <>
                <p className="font-semibold text-muted text-lg sm:text-xl md:text-xl">
                  {t("exercise_label")}
                  <span className="font-normal text-[rgb(var(--color-text))] ml-2 text-base sm:text-lg">
                    {exercise.titre_exo}
                  </span>
                </p>
                <p className="text-[rgb(var(--color-gray))] mt-2 text-sm sm:text-base">
                  {exercise.enonce}
                </p>
              </>
            ) : (
              <p className="text-red-500 text-sm">{t("exercise_load_error")}</p>

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
              className="w-full min-h-[150px] sm:min-h-[200px] md:min-h-[250px] p-5 rounded-2xl border border-gray-300 bg-card text-[rgb(var(--color-text))] text-base sm:text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:shadow-md resize-none transition-all duration-200 hover:shadow-md"
            />
            <div className="absolute top-2 right-4 text-xs text-gray-400">
              {answer.length} / 1000 | {answer.split("\n").length} {t("lines")}
            </div>
          </div>

          {/* TIP BLOCK */}
          <div className="border border-[rgb(var(--color-gray-light))] bg-grad-3 shadow-card rounded-xl px-4 sm:px-5 md:px-6 py-4 mt-10 mb-12">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white shadow"
                style={{ backgroundImage: "var(--grad-1)" }}
              >
                <MdAutoAwesome size={18} />
              </div>
              <div>
                <p className="font-semibold text-muted text-base sm:text-lg ">
                  {t("tip_title")}
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
              {t("save")}
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
          {/* <div className="p-6 sm:p-7 md:p-8 rounded-2xl shadow-card border mb-24" style={{ backgroundImage: "var(--grad-8)" }}>
          <p className="font-semibold text-[rgb(var(--color-primary))] text-base sm:text-lg mb-1">
            {t("feedback_title")}
          </p>
          <p className="text-[rgb(var(--color-gray))] text-xs sm:text-sm mb-6 sm:mb-8">
            {t("feedback_subtitle")}
          </p>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6"> */}
          {/* <div className="flex gap-3 text-2xl sm:text-3xl">
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
            </div> */}

          {/* <div className="flex justify-between w-full text-xs sm:text-sm font-medium mt-2">
              <span className="w-24 text-left label-very-easy">{t("labels.veryEasy")}</span>
              <span className="w-24 text-center label-moderate">{t("labels.moderate")}</span>
              <span className="w-24 text-right label-very-difficult">{t("labels.veryDifficult")}</span>
            </div>
          </div> */}

          {/* <p className="text-[rgb(var(--color-primary))] text-xs sm:text-sm flex items-center gap-2">
            {t("need_help")}
          </p>
        </div> */}

          {/* HELP BUTTON */}
          <div className="flex justify-center my-10 md:my-12">
            <button
              onClick={() => {
                if (!aiAllowed) {
                  toast.error(t("assistant_disabled") || "Assistant IA désactivé pour cet exercice");
                  return;
                }
                setOpenAssistant(true);
              }}
              disabled={!aiAllowed}
              className={`flex items-center gap-3 px-4 sm:px-5 py-2 rounded-full border shadow transition
    ${aiAllowed
                  ? "bg-grad-1 hover:brightness-95 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"}
  `}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center">
                <MessageCircle size={16} strokeWidth={1.7} />
              </div>
              <span className="text-xs sm:text-sm font-medium">
                {t("need_help")}
              </span>
            </button>

          </div>
        </div>

        {/* ASSISTANT IA */}
        {openAssistant && (
          <AssistantIA
            onClose={() => setOpenAssistant(false)}
            mode="exercise"      // très important pour que l'IA sache que c'est un exo
            course={null}        // pas de cours ici
          />
        )}
      </div>
    </TheoryExerciseContext.Provider>
  );
}
