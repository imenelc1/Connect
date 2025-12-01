import React, { useState } from "react";
import { ChevronRight, ChevronLeft, BookOpen, Clock } from "lucide-react";
import BlueCheck from "./BlueCheck";
import { useTranslation } from "react-i18next";

export default function CourseContent() {
  const { t } = useTranslation("courses");

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

  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    console.log("Feedback submitted:", { feedback, rating });
    setFeedback("");
    setRating(0);
  };

  return (
    <div className="bg-card rounded-3xl border border-blue/20 p-4 sm:p-8 shadow-sm">

      {/* TITLE */}
      <div className="px-2">
        <div className="flex items-start justify-between">

          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-muted">
              Structures de Données
            </h1>

            <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
              <span className="flex items-center gap-1 text-muted font-medium">
                <BookOpen size={14} className="sm:size-8" /> Chapitre 4/10
              </span>
              <span className="flex items-center gap-1 text-muted">
                <Clock size={14} className="sm:size-8" /> 15 min
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 mt-2">
            <button className="flex items-center gap-1 sm:gap-2 bg-white px-3 sm:px-4 py-1 sm:py-2 rounded-xl border border-blue/40 shadow text-blue text-xs sm:text-base hover:bg-blue/10">
              <ChevronLeft size={14} className="sm:size-8" /> {t("chapitrePrec")}
            </button>

            <button className="flex items-center gap-1 sm:gap-2 bg-blue px-3 sm:px-4 py-1 sm:py-2 rounded-xl text-white text-xs sm:text-base shadow hover:bg-blue/90">
              {t("ChapitreSuiv")} <ChevronRight size={14} className="sm:size-8" />
            </button>
          </div>

        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-card rounded-3xl border border-blue/20 p-4 sm:p-8 shadow-sm">
        <p className="mt-4 text-sm sm:text-base text-textc leading-relaxed">
          Les boucles permettent de répéter des instructions plusieurs fois.
        </p>

        <h2 className="mt-6 text-lg sm:text-xl font-semibold text-muted">La boucle while</h2>

        <p className="mt-2 text-sm sm:text-base text-textc leading-relaxed">
          La boucle while exécute un bloc d’instructions tant qu’une condition est vraie.
        </p>

        <div className="mt-4 p-3 sm:p-4 rounded-xl bg-grad-2 border border-blue/30">
          <p className="font-semibold text-muted text-sm sm:text-base">Syntaxe :</p>
          <pre className="mt-2 text-xs sm:text-base text-textc">{`while (condition) {\n  // instructions\n}`}</pre>
        </div>

        <p className="mt-4 text-sm sm:text-base text-textc leading-relaxed">
          La boucle while et do-while sont deux structures de contrôle utilisées pour répéter une action.
        </p>

        <h3 className="mt-6 text-lg sm:text-xl font-semibold text-muted">Exemple</h3>

        <div className="mt-4 p-3 sm:p-4 rounded-xl bg-grad-2 border border-blue/30">
          <pre className="text-xs sm:text-base text-textc">{`int i = 1;\nwhile (i <= 5) {\n    printf("i = %d\\n", i);\n    i++;\n}`}</pre>
        </div>

        {/* Key points */}
        <div className="mt-6 bg-grad-2 rounded-xl border border-blue/20 p-4 sm:p-5">
          <h4 className="font-semibold text-muted mb-3 text-sm sm:text-base">Points clés</h4>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-base text-textc">
            <li className="flex items-start gap-2 sm:gap-3">
              <BlueCheck /> <span>La condition est vérifiée AVANT chaque itération</span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <BlueCheck /> <span>Si la condition est fausse, la boucle ne s’exécute pas</span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <BlueCheck /> <span>Attention aux boucles infinies</span>
            </li>
          </ul>
        </div>

        <div className="mt-4 p-3 sm:p-4 bg-blue/10 rounded-xl border border-blue/20 text-xs sm:text-base text-textc">
          <strong>À savoir :</strong> évitez les boucles infinies.
        </div>
      </div>

      {/* QUIZ CTA */}
      <div className="mt-10 w-full">
        <div className="w-full bg-grad-1 text-white p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow">
          <div className="text-left mb-4 md:mb-0">
            <h3 className="text-base sm:text-lg font-semibold">{t("readyQuiz")}</h3>
            <p className="text-sm sm:text-base opacity-90">{t("quizDesc")}</p>
          </div>

          <button className="bg-white text-blue font-medium px-4 sm:px-6 py-2 rounded-xl shadow flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            {t("startQuiz")} <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* FEEDBACK SECTION */}
      <div className="mt-16 w-full max-w-4xl px-2">
        <div className="flex items-center justify-between mb-6">

          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="text-2xl sm:text-3xl text-blue disabled:opacity-30"
            disabled={page === 0}
          >
            ‹
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 flex-1 px-4 sm:px-6">
            {currentFeedbacks.map((f) => (
              <div key={f.id} className="relative bg-grad-1 rounded-3xl p-4 sm:p-6 text-white shadow-lg">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center text-sm sm:text-lg font-semibold mb-4">
                  {f.initials}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed opacity-90">{f.comment}</p>
                <div className="flex gap-1 text-yellow-300 text-base sm:text-xl mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < f.stars ? "★" : "☆"}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="text-2xl sm:text-3xl text-blue disabled:opacity-30"
            disabled={page === totalPages - 1}
          >
            ›
          </button>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-muted mb-3">{t("yourFeedback")}</h3>

        <textarea
          className="w-full h-36 sm:h-48 border border-blue/20 rounded-2xl p-3 sm:p-4 shadow-sm focus:outline-none text-black/80 text-sm sm:text-base"
          placeholder={t("feedbackPlaceholder")}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        ></textarea>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-gray-800 font-medium text-sm sm:text-base">
              {t("rateCourse")}
            </span>
            <div className="flex gap-1 text-xl sm:text-2xl">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="cursor-pointer text-yellow-400"
                >
                  {s <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-blue text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl shadow hover:bg-blue/90 text-sm sm:text-base"
          >
            {t("send")}
          </button>
        </div>
      </div>

    </div>
  );
}
