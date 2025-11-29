import React, { useState } from "react";
import { ChevronRight, BookOpen, Clock } from "lucide-react";
import BlueCheck from "./BlueCheck";

export default function CourseContent({ t }) {

  // ---- FEEDBACK DATA ----
  const allFeedbacks = [
    { id: 1, initials: "A.S", comment: t("feedback1"), stars: 5 },
    { id: 2, initials: "M.K", comment: t("feedback2"), stars: 5 },
    { id: 3, initials: "S.R", comment: t("feedback3"), stars: 5 },
    { id: 4, initials: "T.L", comment: t("feedback1"), stars: 4 },
    { id: 5, initials: "H.D", comment: t("feedback2"), stars: 5 },
    { id: 6, initials: "N.M", comment: t("feedback3"), stars: 4 },
  ];

  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(allFeedbacks.length / perPage);
  const currentFeedbacks = allFeedbacks.slice(page * perPage, page * perPage + perPage);

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* ----- TITRE + INFO ----- */}
      <div className="px-2">
        <h1 className="text-3xl font-bold text-[#0E1C36]">Structures de Données</h1>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="flex items-center gap-1 text-[#457BFF] font-medium">
            <BookOpen size={16} /> Chapitre 4/10
          </span>
          <span className="flex items-center gap-1 text-[#457BFF]">
            <Clock size={16} /> 15 min de lecture
          </span>
        </div>
      </div>

      {/* ----- CONTENU ----- */}
      <div className="bg-white rounded-3xl border border-[#D6E6FF] p-8 shadow-sm">
        <p className="mt-6 text-gray-700 leading-relaxed">
          Les boucles permettent de répéter des instructions plusieurs fois.
          En C, nous avons trois types de boucles principales.
        </p>

        <h2 className="mt-6 text-xl font-semibold text-gray-800">La boucle while</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          La boucle while exécute un bloc d’instructions tant qu’une condition est vraie.
        </p>

        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#A7C8F9] to-[#D6E7FF] border border-blue-200">
          <p className="font-semibold text-blue-900">Syntaxe :</p>
          <pre className="mt-2 text-gray-800">{`while (condition) {\n  // instructions à répéter\n}`}</pre>
        </div>

        <h3 className="mt-6 text-xl font-semibold text-gray-800">Exemple</h3>
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#A7C8F9] to-[#D6E7FF] border border-blue-200">
          <pre className="text-gray-800">{`int i = 1;\nwhile (i <= 5) {\n    printf("i = %d\\n", i);\n    i++;\n}`}</pre>
        </div>

        <div className="mt-6 bg-white rounded-xl border p-5">
          <h4 className="font-semibold text-gray-800 mb-3">Points clés à retenir</h4>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <BlueCheck /> <span>La condition est vérifiée AVANT chaque itération</span>
            </li>
            <li className="flex items-start gap-3">
              <BlueCheck /> <span>Si la condition est fausse dès le départ, le code n'est jamais exécuté</span>
            </li>
            <li className="flex items-start gap-3">
              <BlueCheck /> <span>Attention aux boucles infinies !</span>
            </li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-[#E9F2FF] rounded-xl border text-gray-700">
          <strong>À savoir :</strong> Toujours mettre à jour la variable de contrôle.
        </div>
      </div>

      {/* ----- QUIZ ----- */}
      <div className="mt-10 w-full">
        <div className="w-full bg-gradient-to-r from-[#1A4CA3] to-[#4EA0FF] p-6 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between shadow">
          <div className="text-left mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">{t("readyQuiz")}</h3>
            <p className="opacity-90">{t("quizDesc")}</p>
          </div>

          <button className="bg-white text-[#1A4CA3] font-medium px-6 py-2 rounded-xl shadow flex items-center gap-2 hover:bg-gray-100 transition">
            {t("startQuiz")} <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ----- FEEDBACK ----- */}
      <div className="mt-16 w-full max-w-4xl px-2">

        {/* NAVIGATION */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="text-3xl text-[#3A78F2]"
            disabled={page === 0}
          >
            ‹
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 px-6">
            {currentFeedbacks.map((f) => (
              <div
                key={f.id}
                className="relative bg-gradient-to-br from-[#A7C8F9] to-[#7AB5FF] shadow-xl rounded-3xl p-6 text-white"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-semibold shadow-md mb-4">
                  {f.initials}
                </div>

                <p className="text-sm leading-relaxed opacity-90">{f.comment}</p>

                <div className="flex gap-1 text-yellow-400 text-xl mt-4">
                  {"★★★★★".slice(0, f.stars)}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="text-3xl text-[#3A78F2]"
            disabled={page === totalPages - 1}
          >
            ›
          </button>
        </div>

        {/* TITRE */}
        <h3 className="text-xl font-bold text-[#3A78F2] mb-3">{t("yourFeedback")}</h3>

        {/* TEXTAREA */}
        <textarea
          className="w-full h-48 border border-gray-300 rounded-2xl p-4 shadow-sm focus:outline-none"
          placeholder={t("feedbackPlaceholder")}
        ></textarea>

        {/* RATE + SEND */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-3">
            <span className="text-gray-800 font-medium">{t("rateCourse")}</span>
            <div className="flex gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" className="cursor-pointer">
                  ☆
                </button>
              ))}
            </div>
          </div>

          <button className="bg-[#3A78F2] text-white px-8 py-3 rounded-xl shadow hover:bg-blue-600">
            {t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}
