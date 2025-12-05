// src/pages/ExercisePage.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, Globe } from "lucide-react";
import { MdAutoAwesome } from "react-icons/md";

import NavBar from "../components/common/NavBar";
import Mascotte from "../assets/6.svg";
import AssistantIA from "./AssistantIA";

export default function ExercisePage() {
  const [openAssistant, setOpenAssistant] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const { t, i18n } = useTranslation("exercisePage");

  const switchLang = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const getStarGradient = (i) => {
    if (i <= 2) return "star-very-easy";
    if (i <= 4) return "star-moderate";
    return "star-difficult";
  };

  return (
    <div className="flex bg-[rgb(var(--color-surface))] min-h-screen">

      {/* NAVBAR */}
      <div className="hidden lg:block">
        <NavBar />
      </div>
      <div className="lg:hidden w-full">
        <NavBar />
      </div>

      {/* PAGE CONTENT */}
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

            {/* SWITCH LANG */}
            <button
              onClick={switchLang}
              className="p-2 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-gray-light))] rounded-xl shadow hover:brightness-95 transition flex items-center justify-center"
            >
              <Globe size={18} className="text-[rgb(var(--color-primary))]" />
            </button>

            {/* ASSISTANT IA BUTTON */}
            <button
              onClick={() => setOpenAssistant(true)}
              className="flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl bg-[rgb(var(--color-primary))] text-white font-medium shadow-md hover:brightness-110 transition text-xs sm:text-sm md:text-base"
            >
              <MessageCircle size={18} strokeWidth={1.8} /> AI Assistant
            </button>

            <img src={Mascotte} className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11" alt="Mascotte" />
          </div>
        </div>

        {/* EXERCISE CARD */}
        <div className="border border-[rgb(var(--color-gray-light))] bg-[rgb(var(--grad-6))] shadow-card rounded-2xl px-4 sm:px-5 md:px-6 py-5 mb-12">
          <p className="font-semibold text-[rgb(var(--color-primary))] text-lg sm:text-xl md:text-xl">
            Exercice 1
            <span className="font-normal text-[rgb(var(--color-text))] ml-2 text-base sm:text-lg">
              Somme de deux nombres
            </span>
          </p>

          <p className="text-[rgb(var(--color-gray))] mt-2 text-sm sm:text-base">
            Écrivez un programme C qui affiche la somme de deux entiers
          </p>
        </div>

        {/* SECTION TITLE */}
        <h2 className="text-lg sm:text-xl font-semibold text-[rgb(var(--color-primary))] mb-3">
          Your solution
        </h2>

        {/* CODE EDITOR */}
        <div className="rounded-2xl overflow-hidden shadow-strong w-full mb-10">
          <div className="bg-[rgb(var(--color-gray-light))] h-10 sm:h-11 flex items-center justify-between px-4 sm:px-5 border-b border-[rgb(var(--color-gray))]">
            <span className="font-medium text-xs sm:text-sm text-[rgb(var(--color-text))] opacity-70">
              main.c
            </span>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
            </div>
          </div>

          <textarea
            defaultValue={`#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n  printf("Hello world!\\n");\n  return 0;\n}`}
            className="bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] p-5 sm:p-7 font-mono text-[13px] sm:text-[14px] md:text-[15px] leading-6 sm:leading-7 min-h-[180px] sm:min-h-[250px] md:min-h-[300px] w-full outline-none resize-none"
            spellCheck="false"
          />
        </div>

        {/* TIP BLOCK */}
        <div className="border border-[rgb(var(--color-gray-light))] bg-[rgb(var(--grad-7))] shadow-card rounded-xl px-4 sm:px-5 md:px-6 py-4 mt-10 mb-12">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white shadow"
              style={{ backgroundImage: "var(--grad-1)" }}>
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

        {/* SEND SOLUTION */}
        <div className="flex justify-center mb-16">
          <button
            className="px-8 sm:px-10 md:px-12 py-3 rounded-xl text-white font-semibold shadow-lg hover:opacity-90 transition text-sm sm:text-base"
            style={{ backgroundImage: "var(--grad-1)" }}
          >
            {t("send_solution")}
          </button>
        </div>

        {/* FEEDBACK */}
        <div className="p-6 sm:p-7 md:p-8 rounded-2xl shadow-card border mb-24"
          style={{ backgroundImage: "var(--grad-8)" }}>

          <p className="font-semibold text-[rgb(var(--color-primary))] text-base sm:text-lg mb-1">
            {t("feedback_title")}
          </p>

          <p className="text-[rgb(var(--color-gray))] text-xs sm:text-sm mb-6 sm:mb-8">
            {t("feedback_subtitle")}
          </p>

          {/* STARS */}
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
              {t("ask_help")}
            </span>
          </button>
        </div>
      </div>

      {/* ASSISTANT IA FULL SCREEN MOBILE / POPUP DESKTOP */}
      {openAssistant && (
        <div>
          {/* MOBILE = FULL SCREEN */}
          <div className="fixed inset-0 z-50 lg:hidden bg-white">
            <AssistantIA onClose={() => setOpenAssistant(false)} fullscreen />
          </div>

          {/* DESKTOP = POPUP */}
          <div className="hidden lg:block fixed bottom-6 right-6 w-[380px] z-50">
            <AssistantIA onClose={() => setOpenAssistant(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
