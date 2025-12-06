import React, { useState, useContext, useEffect } from "react";
import {
  Play,
  Square,
  Bug,
  RotateCw,
  Globe,
  MessageCircle,
} from "lucide-react";
import { MdAutoAwesome } from "react-icons/md";
import UserCircle from "../components/common/UserCircle";
import HeadMascotte from "../components/ui/HeadMascotte";
import IaAssistant from "../components/ui/IaAssistant";

import NavBar from "../components/common/NavBar";
import AssistantIA from "../pages/AssistantIA";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import axios from "axios";

export default function StartExercise() {
  const { t, i18n } = useTranslation("startExercise");

  const [openAssistant, setOpenAssistant] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [output, setOutput] = useState("Aucune sortie pour le moment...");
  const [isRunning, setIsRunning] = useState(false);

  const [userCode, setUserCode] = useState(`#include <stdio.h>
#include <stdlib.h>

int main() {
  printf("Hello world!\\n");
  return 0;
}`);

  const getStarGradient = (i) => {
    if (i <= 2) return "star-very-easy";
    if (i <= 4) return "star-moderate";
    return "star-difficult";
  };

  const switchLang = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Exécution en cours...");

    try {
      const response = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
          source_code: userCode,
          language_id: 49, // 49 = C (gcc)
        }
      );

      setOutput(response.data.stdout || response.data.stderr || "Aucune sortie");
    } catch (error) {
      setOutput("Erreur lors de l'exécution du code");
    }

    setIsRunning(false);
  };

  const { toggleDarkMode } = useContext(ThemeContext);

  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";


    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    

useEffect(() => {
  const handler = (e) => setSidebarCollapsed(e.detail);
  window.addEventListener("sidebarChanged", handler);
  return () => window.removeEventListener("sidebarChanged", handler);
}, []);

const sidebarWidth = sidebarCollapsed ?  -200: -50;

  return (
<div
  className="flex-1 p-4 md:p-8 transition-all duration-300 min-w-0"
  style={{ marginLeft: sidebarWidth }}
>

  {/* NAVBAR PC */}
  <div className="hidden lg:block">
    <NavBar />
  </div>

  {/* CONTENT */}
  <div className="flex-1 p-4 md:p-8 lg:ml-72 transition-all duration-300 ml-10">
    {/* HEADER */}
    <div className="flex flex-col md:flex-row md:items-center mb-10 gap-6 md:gap-0">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-extrabold text-muted mb-2">
          {t("header.title")}
        </h1>
        <p className="text-[rgb(var(--color-text))] text-lg md:text-xl opacity-80">
          {t("header.subtitle")}
        </p>
      </div>

      <div className="flex gap-3 items-center md:ml-auto  ml-[280px] -mt-20 md:mt-0">
        <IaAssistant/>
        <HeadMascotte/>
        <UserCircle
          initials={initials}
          onToggleTheme={toggleDarkMode}
          onChangeLang={(lang) => i18n.changeLanguage(lang)}
        />
      </div>
    </div>

    {/* EXERCISE CARD */}
    <div className="w-full p-6 rounded-2xl bg-grad-3 mb-6 md:mb-10">
      <p className="font-semibold text-muted text-[20px]">
        {t("exerciseCard.title")}
        <span className="font-normal text-[rgb(var(--color-text))] ml-3 opacity-70">
          {t("exerciseCard.subtitle")}
        </span>
      </p>
      <p className="mt-3 text-muted text-sm md:text-base">
        {t("exerciseCard.description")}
      </p>
    </div>

    {/* CODE EDITOR */}
    <p className="text-lg md:text-xl font-semibold mb-4">
      {t("editor.yourCode")}
    </p>

    <div className="rounded-2xl overflow-hidden shadow-strong mb-10">
      <div className="h-11 flex items-center justify-between px-5 border-b border-[rgb(var(--color-gray-light))] bg-[rgb(var(--color-gray-light))]">
        <span className="font-medium text-sm text-black opacity-70">
          {t("editor.fileName")}
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
        </div>
      </div>

      <textarea
        value={userCode}
        onChange={(e) => setUserCode(e.target.value)}
        className="bg-code p-7 font-mono text-white text-[15px] leading-7 min-h-[360px] w-full outline-none resize-none text-textc"
        spellCheck="false"
      />
    </div>

    {/* ACTION BUTTONS */}
    <div className="flex flex-col-[2] md:flex-row md:flex-wrap justify-center gap-2 md:gap-5 mt-8 mb-10">
      <ActionButton
        icon={<Play size={18} />}
        label={isRunning ? "Exécution..." : t("buttons.run")}
        bg="var(--grad-button)"
        onClick={runCode}
      />
      <ActionButton
        icon={<Square size={18} />}
        label={t("buttons.stop")}
        bg="linear-gradient(135deg,#ba68c8ff)"
        text="white"
      />
      <ActionButton
        icon={<Bug size={18} />}
        label={t("buttons.debug")}
        bg="linear-gradient(135deg,#A3AAED,#6A76E0)"
      />
      <ActionButton
        icon={<RotateCw size={18} />}
        label={t("buttons.reset")}
        bg="linear-gradient(#FFFFFF,#A3AAED,#A3AAED)"
        text="rgb(var(--color-text))"
      />
    </div>


        {/* TIP CARD */}
        <div
          className="p-6 rounded-2xl border  mb-12 bg-grad-3"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundImage: "var(--grad-button)" }}
            >
              <MdAutoAwesome size={22} />
            </div>

            <div className="flex-1">
              <div className="font-semibold text-muted text-[15px]">
                {t("tipCard.title")}
              </div>
              <div className="text-sm text-muted mt-1 opacity-70">
                {t("tipCard.message")}
              </div>
            </div>
          </div>
        </div>

        {/* OUTPUT */}
        <p className="text-lg md:text-xl font-semibold text-muted mb-3">
          {t("output.title")}
        </p>

        <div className="rounded-2xl p-4 md:p-6 text-white shadow-strong text-[14px] md:text-[15px] leading-6 md:leading-7 mb-10 bg-output">
          {output.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* SEND SOLUTION */}
        <div className="flex justify-center mb-10">
          <button
            className="px-8 md:px-10 py-2.5 md:py-3 rounded-xl text-white font-semibold shadow-card hover:opacity-90 transition"
            style={{ backgroundImage: "var(--grad-button)" }}
          >
            {t("buttons.sendSolution")}
          </button>
        </div>

        {/* FEEDBACK */}
        <div
          className="p-8 rounded-2xl shadow-card border mb-24 bg-grad-8"
        >
          <p className="font-semibold text-primary text-lg mb-1 ">
            {t("feedback.title")}
          </p>

          <p className="text-primary text-sm mb-8">
            {t("feedback.subtitle")}
          </p>

          {/* ⭐ STARS */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-4">
            <div className="flex gap-3 text-2xl md:text-3xl">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  className={`cursor-pointer text-transparent bg-clip-text drop-shadow ${getStarGradient(
                    i
                  )} ${(hover || rating) >= i ? "opacity-100 scale-110" : "opacity-40"} transition-all duration-150`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* LABELS */}
            <div className="flex justify-between w-full text-sm font-medium mt-2">
              <span className="w-24 text-left label-very-easy ">
                {t("feedback.labels.veryEasy")}
              </span>

              <span className="w-24 text-center label-moderate">
                {t("feedback.labels.moderate")}
              </span>

              <span className="w-24 text-right label-very-difficult">
                {t("feedback.labels.veryDifficult")}
              </span>
            </div>
          </div>

          <p className="text-primary text-sm flex items-center gap-2">
            {t("feedback.tip")}
          </p>
        </div>

        {/* HELP BUTTON */}
        <div className="flex justify-center mb-16">
          <button
            onClick={() => setOpenAssistant(true)}
            className="flex items-center gap-3 px-4 md:px-6 py-2 rounded-full bg-white border border-[rgb(var(--color-gray-light))] shadow-card hover:brightness-95 transition text-sm"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[rgb(var(--color-gray-light))]">
              <MessageCircle
                size={18}
                strokeWidth={1.7}
                className="text-[rgb(var(--color-primary))]"
              />
            </div>

            <div className="text-[rgb(var(--color-primary))] font-medium">
              Besoin d'aide ? Discutez avec l'Assistant IA
            </div>
          </button>
        </div>
      </div>

      {openAssistant && <AssistantIA onClose={() => setOpenAssistant(false)} />}
    </div>
  );
}

function ActionButton({ icon, label, bg, text = "white", onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 md:px-5 py-2 rounded-xl shadow-card hover:opacity-90 transition font-medium text-sm md:text-base"
      style={{ backgroundImage: bg, color: text }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
