import React, { useState, useContext, useEffect, useRef } from "react";
import { Play, Square, Bug, RotateCw, MessageCircle } from "lucide-react";
import { MdAutoAwesome } from "react-icons/md";

import UserCircle from "../components/common/UserCircle";
import HeadMascotte from "../components/ui/HeadMascotte";
import IaAssistant from "../components/ui/IaAssistant";
import NavBar from "../components/common/NavBar";
import AssistantIA from "../pages/AssistantIA";

import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import axios from "axios";

import Editor from "@monaco-editor/react";

export default function StartExercise() {
  const { t, i18n } = useTranslation("startExercise");

  const [openAssistant, setOpenAssistant] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [output, setOutput] = useState("Aucune sortie pour le moment...");
  const [isRunning, setIsRunning] = useState(false);
  const controllerRef = useRef(null);

  const [userCode, setUserCode] = useState(`#include <stdio.h>
#include <stdlib.h>

int main() {
  printf("Hello world!\\n");
  return 0;
}`);
  const defaultCode = `#include <stdio.h>
#include <stdlib.h>

int main() {
  printf("Hello world!\\n");
  return 0;
}`;
  const resetCode = () => setUserCode(defaultCode);

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

  const sidebarWidth = sidebarCollapsed ? -200 : -50;

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Exécution en cours...");

    controllerRef.current = new AbortController();

    try {
      const res = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        { source_code: userCode, language_id: 49 },
        { signal: controllerRef.current.signal }
      );

      setOutput(res.data.stdout || res.data.stderr || "Aucune sortie");
    } catch (e) {
      if (axios.isCancel(e)) {
        setOutput(" Exécution stoppée");
      } else {
        setOutput("Erreur lors de l'exécution du code");
      }
    }

    setIsRunning(false);
  };
  const debugCode = async () => {
    setIsRunning(true);
    setOutput("Analyse du code...");

    try {
      const res = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        { source_code: userCode, language_id: 49 }
      );

      if (res.data.stderr) {
        setOutput("Erreur détectée :\n\n" + res.data.stderr);
      } else {
        setOutput(" Aucun bug détecté !");
      }
    } catch (e) {
      setOutput("Erreur lors du debug");
    }

    setIsRunning(false);
  };


  const getStarGradient = (i) => {
    if (i <= 2) return "star-very-easy";
    if (i <= 4) return "star-moderate";
    return "star-difficult";
  };
  const stopCode = () => {
    if (controllerRef.current) controllerRef.current.abort();
    setIsRunning(false);
  };

  return (
    <div
      className="flex-1 p-4 md:p-8 transition-all duration-300 min-w-0 bg-surface"
      style={{ marginLeft: sidebarWidth }}
    >
      {/* NAVBAR PC */}
      <div className="hidden lg:block">
        <NavBar />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-8 lg:ml-72 ml-10 transition-all">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center mb-10 gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-muted mb-2">
              {t("header.title")}
            </h1>
            <p className="text-lg md:text-xl opacity-80 text-[rgb(var(--color-text))]">
              {t("header.subtitle")}
            </p>
          </div>

          <div className="flex gap-3 items-center md:ml-auto ml-[280px] -mt-20 md:mt-0">
            <IaAssistant />
            <HeadMascotte />
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => i18n.changeLanguage(lang)}
            />
          </div>
        </div>

        {/* EXERCISE CARD */}
        <div className="w-full p-6 rounded-2xl bg-grad-3 mb-10">
          <p className="font-semibold text-muted text-[20px]">
            {t("exerciseCard.title")}
            <span className="font-normal opacity-70 ml-3 text-[rgb(var(--color-text))]">
              {t("exerciseCard.subtitle")}
            </span>
          </p>
          <p className="mt-3 text-muted opacity-80">
            {t("exerciseCard.description")}
          </p>
        </div>

        {/* CODE EDITOR */}
        <p className="text-lg md:text-xl font-semibold mb-4">
          {t("editor.yourCode")}
        </p>

        <div className="relative rounded-2xl overflow-hidden shadow-lg mb-10 bg-[#0d1117]">

          {/* Editor Top Bar */}
          <div className="h-11 flex items-center justify-between px-5 bg-gray-800 border-b border-gray-700">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </span>
            <span className="font-medium text-sm text-gray-300">main.c</span>
          </div>

          {/* Monaco */}
          <Editor
            height="400px"
            language="c"
            theme="vs-dark"
            value={userCode}
            onChange={(v) => setUserCode(v)}
            options={{
              fontSize: 15,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />


        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
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
            onClick={stopCode}
          />

          <ActionButton
            icon={<Bug size={18} />}
            label={t("buttons.debug")}
            bg="linear-gradient(135deg,#A3AAED,#6A76E0)"
            onClick={debugCode}
          />

          <ActionButton
            icon={<RotateCw size={18} />}
            label={t("buttons.reset")}
            bg="linear-gradient(#FFFFFF,#A3AAED,#A3AAED)"
            text="rgb(var(--color-text))"
            onClick={resetCode}
          />
        </div>

        {/* OUTPUT */}
        <p className="text-lg md:text-xl font-semibold text-muted mb-3">
          {t("output.title")}
        </p>

        <div className="rounded-2xl p-6 text-white shadow-strong mb-10 bg-output">
          {output.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* FEEDBACK */}
        <div className="p-8 rounded-2xl shadow-card border mb-24 bg-grad-8">
          <p className="font-semibold text-primary text-lg mb-1">
            {t("feedback.title")}
          </p>
          <p className="text-primary text-sm mb-8">
            {t("feedback.subtitle")}
          </p>

          {/* Stars */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-4">
            <div className="flex gap-3 text-3xl">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  className={`cursor-pointer text-transparent bg-clip-text drop-shadow ${getStarGradient(
                    i
                  )} ${(hover || rating) >= i ? "opacity-100 scale-110" : "opacity-40"} transition-all`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="flex justify-between w-full text-sm font-medium">
              <span className="w-24 text-left label-very-easy">
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
            className="flex items-center gap-3 px-6 py-2 rounded-full bg-white border border-[rgb(var(--color-gray-light))] shadow-card hover:brightness-95 transition text-sm"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-white">
              <MessageCircle size={18} className="text-[rgb(var(--color-primary))]" />
            </div>

            <span className="text-[rgb(var(--color-primary))] font-medium">
              Besoin d'aide ? Discutez avec l'Assistant IA
            </span>
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
      className="flex items-center gap-2 px-5 py-2 rounded-xl shadow-card hover:opacity-90 transition font-medium"
      style={{ backgroundImage: bg, color: text }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
