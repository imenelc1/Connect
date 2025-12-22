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
import { useParams } from "react-router-dom";

import Editor from "@monaco-editor/react";
export default function StartExercise() {
  const { t, i18n } = useTranslation("startExercise");
  const { toggleDarkMode } = useContext(ThemeContext);
  const { exerciceId } = useParams(); // Récupération de l'ID de l'exercice
  const [exercise, setExercise] = useState(null);
  const [loadingExercise, setLoadingExercise] = useState(true);

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

  // ------------------- FETCH EXERCISE -------------------
  useEffect(() => {
    console.log("URL appelée :", `http://localhost:8000/api/exercices/${exerciceId}/`);
    console.log("${exerciceId}/");
    if (!exerciceId) return;
    console.log("URL appelée :", `http://localhost:8000/api/exercices/${exerciceId}/`);
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

  // ------------------- CODE EXECUTION -------------------
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


  // const switchLang = () => {
  //   const newLang = i18n.language === "fr" ? "en" : "fr";
  //   i18n.changeLanguage(newLang);
  //   localStorage.setItem("lang", newLang);
  // };
  const switchLang = () => {
  const current = i18n.language;
  const newLang = current.startsWith("fr") ? "en" : "fr";

  i18n.changeLanguage(newLang);
  localStorage.setItem("lang", newLang);
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
            <IaAssistant />
            <HeadMascotte />
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => i18n.changeLanguage(lang)}
            />
          </div>
        </div>

        {/* ----------------- EXERCISE CARD ----------------- */}
       <div className="w-full p-6 rounded-2xl bg-grad-3 mb-6 md:mb-10">
  {exercise ? (
    <>
      <p className="font-semibold text-muted text-[20px]">
       Exercice: {exercise.titre_exo}
      </p>
      <p className="mt-3 text-muted text-sm md:text-base">
        {exercise.enonce}
      </p>
    </>
  ) : (
    <p className="text-red-500 text-sm">
      Impossible de charger l'exercice.
    </p>
  )}
</div>




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

        {/* ----------------- OUTPUT ----------------- */}
        <p className="text-lg md:text-xl font-semibold text-muted mb-3">
          {t("output.title")}
        </p>

        <div className="rounded-2xl p-4 md:p-6 text-white shadow-strong text-[14px] md:text-[15px] leading-6 md:leading-7 mb-10 bg-output">
          {output.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* ----------------- ASSISTANT IA ----------------- */}
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

// ----------------- ACTION BUTTON -----------------
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