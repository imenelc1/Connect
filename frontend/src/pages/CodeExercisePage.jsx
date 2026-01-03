import React, { useState, useContext, useEffect, useRef } from "react";
import { Play, Square, Bug, RotateCw, MessageCircle } from "lucide-react";
import { MdAutoAwesome } from "react-icons/md";

import UserCircle from "../components/common/UserCircle";
import HeadMascotte from "../components/ui/HeadMascotte";
import NavBar from "../components/common/NavBar";
import AssistantIA from "./AssistantIA";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import progressionService from "../services/progressionService";
import Input from "../components/common/Input";

import Editor from "@monaco-editor/react";
import ExerciseContext from "../context/ExerciseContext";

export default function StartExercise() {
  const { t, i18n } = useTranslation("startExercise");
  const { toggleDarkMode } = useContext(ThemeContext);
  const { exerciceId } = useParams();

  const [exercise, setExercise] = useState(null);
  const [loadingExercise, setLoadingExercise] = useState(true);
  const [openAssistant, setOpenAssistant] = useState(false);
  const [output, setOutput] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [userInput, setUserInput] = useState("");

  const defaultCode = `#include <stdio.h>
#include <stdlib.h>

int main() {
  printf("Hello world!\\n");
  return 0;
}`;

  const [userCode, setUserCode] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const controllerRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [canSubmit, setCanSubmit] = useState(false);
  const [overwrite, setOverwrite] = useState(false);

  const storedUser = localStorage.getItem("user");
  const userData =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const initials = userData
    ? `${userData.nom?.[0] || ""}${userData.prenom?.[0] || ""}`.toUpperCase()
    : "";
  const isStudent = userData?.role === "etudiant";

  const sidebarWidth = false ? -200 : -50;

  const resetExercise = () => {
    // 1️⃣ Code de l'éditeur
    setUserCode(defaultCode);

    // 2️⃣ Output
    setOutput("");

    // 3️⃣ Input utilisateur
    setUserInput("");

    // 4️⃣ Notifications
    setNotifications([]);

    // 5️⃣ Reboot chrono
    setStartTime(Date.now());

    // 6️⃣ Optionnel : effacer le localStorage du brouillon
    if (exerciceId) {
      localStorage.removeItem(`exercise-${exerciceId}-code`);
    }

    // 🔹 Notification pour indiquer que l'exercice a été réinitialisé
    toast.success(t("messages.exerciseReset") || "Exercice réinitialisé !");
  };


  // -------- Notifications --------
  const sendNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      5000
    );
    if (type === "hint") setOpenAssistant(true);
  };

  // -------- Fetch Exercise --------
  useEffect(() => {
    if (!exerciceId) return;

    const fetchExercise = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/exercices/${exerciceId}/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setExercise(data);

        // Après avoir chargé l'exercice, on check canSubmit
        const canSubmitRes = await fetch(
          `http://localhost:8000/api/dashboard/tentatives/can-submit/${exerciceId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const canSubmitData = await canSubmitRes.json();
        setCanSubmit(canSubmitData.can_submit);
      } catch (err) {
        sendNotification(t("errors.exerciseNOTLoad"), "error");

        setCanSubmit(false);
      } finally {
        setLoadingExercise(false);
      }
    };

    fetchExercise();
  }, [exerciceId]);



  // -------- Load last code (localStorage first, then server draft) --------
  useEffect(() => {
    if (!exerciceId) return;

    const fetchLastCode = async () => {
      // 1️⃣ Vérifie localStorage
      const local = localStorage.getItem(`exercise-${exerciceId}-code`);
      if (local) {
        setUserCode(local);
        return;
      }

      // 2️⃣ Sinon récupère le dernier brouillon serveur
      try {
        const lastDraft = await progressionService.getLastTentative(exerciceId);
        if (lastDraft?.reponse) {
          setUserCode(lastDraft.reponse);
          setOutput(lastDraft.output || "Aucune sortie pour le moment...");
        } else {
          setUserCode(defaultCode);
        }
      } catch {
        setUserCode(defaultCode);
      }
    };

    fetchLastCode();
  }, [exerciceId]);

  // -------- Auto-save localStorage --------
  useEffect(() => {
    if (userCode !== null && exerciceId) {
      localStorage.setItem(`exercise-${exerciceId}-code`, userCode);
    }
  }, [userCode, exerciceId]);

  // -------- Auto-save draft server --------
  useEffect(() => {
    if (!exerciceId || !userCode) return;
    const timer = setTimeout(async () => {
      try {
        await progressionService.createTentative({
          exercice_id: exerciceId,
          reponse: userCode,
          output,
          etat: "brouillon",
          temps_passe: Math.floor((Date.now() - startTime) / 1000),
        });
      } catch { }
    }, 1000);
    return () => clearTimeout(timer);
  }, [userCode, output, exerciceId, startTime]);

  // -------- Inactivity hint --------
  useEffect(() => {
    const t = setTimeout(
      () => sendNotification(t("assistant.tipHelper"), "hint"),
      60000
    );
    return () => clearTimeout(t);
  }, [userCode]);

  // -------- Realtime syntax hint --------
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await axios.post(
          "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
          { source_code: userCode, language_id: 49 }
        );
        if (res.data.stderr)
          sendNotification(t("errors.syntaxError"), "hint");

      } catch { }
    }, 10000);
    return () => clearTimeout(t);
  }, [userCode]);

  // -------- Run / Debug / Stop --------
  const runCode = async () => {
    setIsRunning(true);
    setOutput(t("messages.runningEXE"));


    try {
      const res = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
          source_code: userCode,
          language_id: 49,
          stdin: userInput,
        }
      );

      const {
        stdout,
        stderr,
        compile_output,
        status,
      } = res.data;

      const result =
        stdout ||
        stderr ||
        compile_output ||
        "Aucune sortie pour le moment...";

      setOutput(result);

      // 🚨 NOTIFICATION IMMÉDIATE
      if (stderr || compile_output) {
        sendNotification(
          t("assistant.executionErrorHelp"), "hint"
        );
      }

    } catch {
      setOutput(t("errors.exeError"));
      sendNotification(t("errors.exeError"), "error");

    } finally {
      setIsRunning(false);
    }
  };


  const debugCode = async () => {
    setIsRunning(true);
    try {
      const res = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        { source_code: userCode, language_id: 49 }
      );
      if (res.data.stderr) {
        setOutput(`${t("errors.errorDetected")}\n\n${res.data.stderr}`);
        sendNotification(t("errors.bugDetected"), "hint");

      } else {
        setOutput(t("messages.noBugs"));

      }
    } finally {
      setIsRunning(false);
    }
  };

  const stopCode = () => {
    controllerRef.current?.abort();
    setIsRunning(false);
  };

  // -------- Save & Submit --------
  const handleSaveDraft = async () => {
    try {
      await progressionService.createTentative({
        exercice_id: exerciceId,
        reponse: userCode,
        output,
        etat: "brouillon",
        temps_passe: Math.floor((Date.now() - startTime) / 1000),
      });
      toast.success(t("messages.codeSave"));
      sendNotification(t("messages.draftSave"));

    } catch {
      toast.error(t("errors.errorSave"));

    }
  };

  const handleSubmit = async () => {
    try {
      await progressionService.submitTentative({
        exercice_id: exerciceId,
        reponse: userCode,
        output,
        etat: "soumis",
        overwrite,
        temps_passe: Math.floor((Date.now() - startTime) / 1000),
      });
      toast.success(t("messages.exoSubmitted"));

    } catch {
      toast.error(t("errors.errorSubmit"));

    }
  };

  // -------- JSX et context --------
  const exerciseContextValue = {
    id: exerciceId,
    titre: exercise?.titre_exo,
    enonce: exercise?.enonce,
    code: userCode,
    output,
    onHintRequest: () => setOpenAssistant(true),
  };


  // ------------------- JSX -------------------
  return (
    <ExerciseContext.Provider value={exerciseContextValue}>
      <div
        className="flex-1 p-4 md:p-8 transition-all duration-300 min-w-0 bg-surface"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="hidden lg:block">
          <NavBar />
        </div>

        <div className="flex-1 p-4 md:p-8 lg:ml-72 transition-all duration-300 ml-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center mb-10 gap-6 md:gap-0">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-muted mb-2">
                {t("header.title")}
              </h1>
              <p className="text-[rgb(var(--color-text))] text-lg md:text-xl opacity-80">
                {t("header.subtitle")}
              </p>
            </div>

            <div className="flex gap-3 items-center md:ml-auto ml-[280px] -mt-20 md:mt-0 relative">
              <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
                <HeadMascotte />

                {/* Notifications */}
                <div className="fixed top-20 right-6 flex flex-col gap-3 z-[9999]">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`
        px-4 py-2 rounded-2xl shadow-card border backdrop-blur
        animate-slide-in flex items-center gap-2
        ${n.type === "error"
                          ? "bg-[rgb(var(--color-red))]/90 border-red-300 text-white"
                          : n.type === "hint"
                            ? "bg-[rgb(var(--color-secondary2))]/90 border-[rgb(var(--color-blue))]/40 text-white"
                            : "bg-[rgb(var(--color-primary))]/90 border-[rgb(var(--color-gray-light))]/40 text-white"
                        }
      `}
                    >
                      {n.type === "hint" && "💡"}
                      {n.type === "error" && "⚠️"}
                      {n.type === "info" && "🤖"}
                      <span>{n.message}</span>
                    </div>
                  ))}
                </div>
                <UserCircle
                  initials={initials}
                  onToggleTheme={toggleDarkMode}
                  onChangeLang={(lang) => i18n.changeLanguage(lang)}
                />
              </div>

            </div>
          </div>

          {/* Exercise Card */}
          <div className="w-full p-6 rounded-2xl bg-grad-3 mb-6 md:mb-10">
            {exercise ? (
              <>
                <p className="font-semibold text-muted text-[20px]">
                  {t("header.label")}  {exercise.titre_exo}
                </p>
                <p className="mt-3 text-muted text-sm md:text-base">
                  {exercise.enonce}
                </p>
              </>
            ) : (
              <p className="text-red-500 text-sm">
                {t("errors.exerciseNOTLoad")}
              </p>
            )}
          </div>

          {/* Editor */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg mb-10 bg-[#0d1117]">
            <div className="h-11 flex items-center justify-between px-5 bg-gray-800 border-b border-gray-700">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              </span>
              <span className="font-medium text-sm text-gray-300">main.c</span>
            </div>
            {userCode !== null && (
              <Editor
                height="400px"
                language="c"
                theme="vs-dark"
                value={userCode}
                onChange={setUserCode}
                options={{
                  fontSize: 15,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            )}

          </div>
          {/* Input pour scanf */}
          <div className="mb-4">
            <label className="text-sm text-gray-300 mb-1 block">{t("input.stdinLabel")}</label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={t("input.stdinPlaceholder")}
              className="w-full p-2 rounded bg-gray-900 text-white font-mono resize-none"
              rows={4}
            />
          </div>


          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <ActionButton
              icon={<Play size={18} />}
              label={isRunning ? t("messages.runningEXE") : t("buttons.run")}

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
              onClick={resetExercise}
            />

          </div>


          {isStudent && (
            <div className="flex justify-center gap-4">
              <ActionButton
                icon={<MdAutoAwesome size={18} />}
                label={t("buttons.saveDraft")}
                bg="var(--grad-button)"
                onClick={handleSaveDraft}
              />
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`
        px-8 py-3 rounded-xl font-semibold shadow-lg transition
        ${!canSubmit
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-60 pointer-events-none"
                    : "text-white hover:opacity-90"
                  }
      `}
                style={!canSubmit ? { backgroundImage: "none" } : { backgroundImage: "var(--grad-1)" }}
              >
                {t("buttons.sendSolution")}

              </button>
            </div>
          )}


          {/* Output */}
          <p className="text-lg md:text-xl font-semibold text-muted mb-3">
            {t("output.title")}
          </p>
          <div className="rounded-2xl p-4 md:p-6 text-white shadow-strong text-[14px] md:text-[15px] leading-6 md:leading-7 mb-10 bg-output">
            {/* {output.split("\n").map((line, i) => ( */}
            {(output || t("output.noOutput")).split("\n").map((line, i) => (

              <div key={i}>{line}</div>
            ))}
          </div>

          {/* Assistant IA */}
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
                {t("assistant.help")}

              </div>
            </button>
          </div>

          {openAssistant && (
            <AssistantIA
              onClose={() => setOpenAssistant(false)}
              mode="exercise"      // très important pour que l'IA sache que c'est un exo
              course={null}        // pas de cours ici
            />
          )}


        </div>
      </div>

    </ExerciseContext.Provider>
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