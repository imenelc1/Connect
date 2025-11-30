import React, { useState } from "react";
import { ChevronRight, ChevronLeft, BookOpen, Clock } from "lucide-react";
import BlueCheck from "./BlueCheck";



export default function CourseContent({ t }) {
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

  {/* TITLE */}
  <div className="px-2">
    <div className="flex items-start justify-between">

      <div>
        <h1 className="text-3xl font-bold text-muted">Structures de Données</h1>

        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="flex items-center gap-1 text-muted font-medium">
            <BookOpen size={16} /> Chapitre 4/10
          </span>
          <span className="flex items-center gap-1 text-muted">
            <Clock size={16} /> 15 min de lecture
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-2">
        <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-blue/40 shadow text-blue hover:bg-blue/10">
          <ChevronLeft size={16} />
          Chapitre précédent
        </button>

        <button className="flex items-center gap-2 bg-blue px-4 py-2 rounded-xl text-white shadow hover:bg-blue/90">
          Chapitre suivant
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  </div>

  {/* CONTENT */}
  <div className="bg-card rounded-3xl border border-blue/20 p-8 shadow-sm">
    <p className="mt-6 text-textc leading-relaxed">
      Les boucles permettent de répéter des instructions plusieurs fois.
    </p>

    <h2 className="mt-6 text-xl font-semibold text-muted">La boucle while</h2>

    <p className="mt-2 text-textc leading-relaxed">
      La boucle while exécute un bloc d’instructions tant qu’une condition est vraie.
    </p>

    <div className="mt-4 p-4 rounded-xl bg-grad-2 border border-blue/30">
      <p className="font-semibold text-muted">Syntaxe :</p>
      <pre className="mt-2 text-textc">{`while (condition) {\n  // instructions à répéter\n}`}</pre>
    </div>

    <p className="mt-4 text-textc leading-relaxed">
      La boucle while et do-while sont deux structures de contrôle utilisées pour répéter une action.
    </p>

    <h3 className="mt-6 text-xl font-semibold text-muted">Exemple</h3>

    <div className="mt-4 p-4 rounded-xl bg-grad-2  border border-blue/30">
      <pre className="text-textc">{`int i = 1;\nwhile (i <= 5) {\n    printf("i = %d\\n", i);\n    i++;\n}`}</pre>
    </div>

    {/* Key points */}
    <div className="mt-6 bg-grad-2 rounded-xl border border-blue/20 p-5">
      <h4 className="font-semibold text-muted mb-3">Points clés à retenir</h4>
      <ul className="space-y-3 text-textc">
        <li className="flex items-start gap-3 ">
          <BlueCheck /> <span>La condition est vérifiée AVANT chaque itération</span>
        </li>
        <li className="flex items-start gap-3">
          <BlueCheck /> <span>Si la condition est fausse, la boucle ne s’exécute pas</span>
        </li>
        <li className="flex items-start gap-3">
          <BlueCheck /> <span>Attention aux boucles infinies</span>
        </li>
      </ul>
    </div>

    <div className="mt-4 p-4 bg-blue/10 rounded-xl border border-blue/20 text-textc">
      <strong>À savoir :</strong> évitez les boucles infinies.
    </div>
  </div>

  {/* QUIZ CTA */}
  <div className="mt-10 w-full">
    <div className="w-full bg-grad-1 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow">
      <div className="text-left mb-4 md:mb-0">
        <h3 className="text-lg font-semibold">{t("readyQuiz")}</h3>
        <p className="opacity-90">{t("quizDesc")}</p>
      </div>

      <button className="bg-white text-blue font-medium px-6 py-2 rounded-xl shadow flex items-center gap-2 ">
        {t("startQuiz")} <ChevronRight size={18} />
      </button>
    </div>
  </div>

  {/* FEEDBACK SECTION */}
  <div className="mt-16 w-full max-w-4xl px-2">
    <div className="flex items-center justify-between mb-6">

      <button
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        className="text-3xl text-blue disabled:opacity-30"
        disabled={page === 0}
      >
        ‹
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 px-6">
        {currentFeedbacks.map((f) => (
          <div key={f.id} className="relative bg-grad-1 rounded-3xl p-6 text-white shadow-lg">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-lg font-semibold mb-4">
              {f.initials}
            </div>
            <p className="text-sm leading-relaxed opacity-90">{f.comment}</p>
            <div className="flex gap-1 text-yellow-300 text-xl mt-4">
              {"★★★★★".slice(0, f.stars)}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        className="text-3xl text-blue disabled:opacity-30"
        disabled={page === totalPages - 1}
      >
        ›
      </button>
    </div>

    <h3 className="text-xl font-bold text-muted mb-3">{t("yourFeedback")}</h3>

    <textarea
      className="w-full h-48 border border-blue/20 rounded-2xl p-4 shadow-sm focus:outline-none text-black/80"
      placeholder={t("feedbackPlaceholder")}
    ></textarea>

    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center gap-3">
        <span className="text-gray-800 font-medium">{t("rateCourse")}</span>
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" className="cursor-pointer text-muted">
              ☆
            </button>
          ))}
        </div>
      </div>

      <button className="bg-blue text-white px-8 py-3 rounded-xl shadow hover:bg-blue/90">
        {t("send")}
      </button>
    </div>
  </div>

</div>

  );
}
