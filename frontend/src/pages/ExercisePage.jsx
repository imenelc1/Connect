// src/pages/ExercisePage.jsx

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";

import NavBar from "../components/common/Navbar";
import Mascotte from "../assets/6.svg";
import AssistantIA from "./AssistantIA";

export default function ExercisePage() {
  const [openAssistant, setOpenAssistant] = useState(false);

  return (
    <div className="flex bg-[#f2f6ff] min-h-screen">
      <NavBar />

      <div className="flex-1 ml-72 px-12 py-10">
<div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-[#3c7bff] mb-2">Exercises</h1>
            <p className="text-[#1b1e2c] text-xl font-medium">Let's start the exercise!</p>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setOpenAssistant(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3d6ddf] text-white font-medium shadow-md hover:brightness-110 transition"
            >
              AI Assistant
            </button>
            <img src={Mascotte} className="w-11 h-11" />
          </div>
        </div>

        {/* EXERCISE CARD (STYLE TIP) */}
        <div className="border border-[#d6e2ff] bg-gradient-to-r from-[#eef4ff] to-[#f8fbff] shadow rounded-2xl px-6 py-5 mb-12">
          <p className="font-semibold text-[#3f6ad9] text-lg">
            Exercice 1
            <span className="font-normal text-[#3b4a6b] ml-2">
              Somme de deux nombres
            </span>
          </p>

          <p className="text-[#2a3d63] mt-2">
            Lire un entier et afficher s'il est pair ou impair.
          </p>
        </div>

        {/* SECTION TITRE */}
        <h2 className="text-xl font-semibold text-[#1e2e5e] mb-3">
          Your solution
        </h2>

        {/* CODE EDITOR : fond blanc + texte noir + main.c + 3 points */}
        <div className="rounded-2xl overflow-hidden shadow-2xl w-full">
          <div className="bg-[#e7e7e7] h-11 flex items-center justify-between px-5 border-b border-[#d5d5d5]">
            <span className="text-[#4a4a4a] font-medium text-sm">main.c</span>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#ff5f56] rounded-full"></span>
              <span className="w-3 h-3 bg-[#ffbd2e] rounded-full"></span>
              <span className="w-3 h-3 bg-[#27c93f] rounded-full"></span>
            </div>
          </div>

          <textarea
            defaultValue={`#include <stdio.h>
#include <stdlib.h>

int main() {
  printf("Hello world!\\n");
  return 0;
}`}
            className="bg-white text-black p-7 font-mono text-[15px] leading-7 min-h-[300px] w-full outline-none resize-none"
            spellCheck="false"
          />
        </div>

        {/* TIP BLOCK */}
        <div className="border border-[#d6e2ff] bg-gradient-to-r from-[#eef4ff] to-[#f8fbff] shadow rounded-xl px-6 py-4 mt-10 mb-12">
          <p className="font-semibold text-[#3f6ad9]">Tip</p>
          <p className="text-sm text-[#2a3d63] mt-1">
            Test your code gradually and use printf to debug.
          </p>
        </div>

       

        {/* BUTTON SEND SOLUTION */}
        <div className="flex justify-center mb-16">
          <button className="px-12 py-3 rounded-xl bg-gradient-to-r from-[#1c4b8a] to-[#2d6cc4] text-white font-semibold shadow-lg hover:opacity-90 transition">
            Send the solution
          </button>
        </div>
     {/* FEEDBACK */}
        <div className="bg-gradient-to-r from-[#e5f0ff] to-[#f5f8ff] p-8 rounded-2xl shadow-lg border border-[#cfdcff] mb-24">
          <p className="font-semibold text-[#1f3164] text-lg mb-1">How did you find this exercise?</p>
          <p className="text-gray-600 text-sm mb-4">Your feedback helps us improve the platform.</p>

          <div className="flex gap-4 text-3xl mb-7">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="cursor-pointer bg-gradient-to-r from-[#588dff] to-[#b07cff] text-transparent bg-clip-text drop-shadow-sm select-none">
                ★
              </span>
            ))}
          </div>

          <p className="text-[#3d6ddf] text-sm flex items-center gap-2">💡 Need help? The AI assistant is here for you.</p>
        </div>
        {/* HELP BUTTON */}
        <div className="flex justify-center my-12">
          <button
            onClick={() => setOpenAssistant(true)}
            className="flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-[#d6e7ff] shadow hover:brightness-95 transition"
          >
            <div className="w-7 h-7 rounded-full border border-[#d6e7ff] flex items-center justify-center">💬</div>
            <span className="text-sm text-[#2b5db6] font-medium">
              Besoin d'aide ? Discutez avec l'Assistant IA
            </span>
          </button>
        </div>
      </div>

      {openAssistant && (
        <AssistantIA onClose={() => setOpenAssistant(false)} />
      )}
    </div>
  );
}