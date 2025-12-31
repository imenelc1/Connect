import React, { useEffect, useState } from "react";
import Navbar from "../components/common/NavBar";
import { CheckCircle, Clock, MessageCircle, Calendar, ChevronRight } from "lucide-react";
import { getTentatives} from "../services/progressionService";
import { useTranslation } from "react-i18next";

export default function SubmittedExercises() {
  const { t } = useTranslation("SubmittedExercises");
  const [exercises, setExercises] = useState([]);
  const [filter, setFilter] = useState("All");
  const [expandedCards, setExpandedCards] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const data = await getTentatives();

        const formatted = data.map(t => ({
          id: t.id,
          exerciceId: t.exercice.id_exercice, 
          title: t.exercice.titre_exo,
          description: t.exercice.enonce,
          categorie: t.exercice.categorie || "non-code",
          status: t.etat === "soumis" ? "Soumis" : t.etat === "brouillon" ? "Brouillon" : "Corrigé",
          submittedDate: t.submitted_at || t.created_at,
          language: t.exercice.language || "C",
          difficulty:
            t.exercice.niveau_exo === "debutant"
              ? "Very easy"
              : t.exercice.niveau_exo === "intermediaire"
              ? "Moderate"
              : "Very difficult",
          feedback: t.feedback,
          output: t.output,
          bgClass: "bg-grad-2",
        }));
        setExercises(formatted);
      } catch (err) {
        console.error("Erreur récupération tentatives :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const filtered = exercises.filter((ex) => {
    if (filter === "All") return true;
    if (filter === "Soumis") return ex.status === "Soumis";
    if (filter === "Brouillon") return ex.status === "Brouillon";
    return true;
  });

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex">
      <Navbar />

      <main className="flex-1 ml-16 sm:ml-56 p-6">
        <h1 className="text-3xl font-semibold text-primary">{t("submittedExercises")}</h1>
        <div className="text-primary font-medium text-sm border border-primary px-3 py-1 rounded-md shadow-sm bg-bg inline-block">
          {t("total")}: {filtered.length} {t("exercises")}
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex gap-3 mt-4 mb-6">
          <button
            onClick={() => setFilter("All")}
            className={`border px-3 py-1 rounded ${filter === "All" ? "bg-primary text-white" : "bg-bg text-primary"}`}
          >
            {t("all")}
          </button>
          <button
            onClick={() => setFilter("Soumis")}
            className={`border px-3 py-1 rounded ${filter === "Soumis" ? "bg-primary text-white" : "bg-bg text-primary"}`}
          >
            {t("submitted")}
          </button>
          <button
            onClick={() => setFilter("Brouillon")}
            className={`border px-3 py-1 rounded ${filter === "Brouillon" ? "bg-primary text-white" : "bg-bg text-primary"}`}
          >
             {t("brouillon")}
          </button>
        </div>

        {/* LIST OF CARDS */}
        <div className="flex flex-col gap-5 mt-6">
          {filtered.map((ex) => {
            const isExpanded = expandedCards[ex.id] || false;
            return (
              <div key={ex.id} className={`${ex.bgClass} shadow rounded-xl p-4 sm:p-6 border flex flex-col relative`}>
                {/* Status Badge */}
                <span
                  className={`absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-1 rounded 
                  ${ex.status === "Soumis" ? "bg-secondary/30" : ex.status === "Brouillon" ? "bg-pink/30" : "bg-green/30"}`}>
                  {ex.status === "Soumis" ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {ex.status}
                </span>

                {/* Title */}
                <h2 className="text-xl font-semibold">{ex.title}</h2>

                {/* Description */}
                <p className="text-textc text-sm leading-relaxed">{ex.description}</p>

                {/* ArrowRight clickable */}
                <div className="flex justify-end mt-2">
                 <ChevronRight
  size={20}
  className="text-primary cursor-pointer"
  onClick={() => {
    ex.categorie === "code"
      ? window.location.href = `/submitted-exercise/${ex.id}`
      : window.location.href = `/submitted-exercise-theory/${ex.id}`;
  }}
/>

                </div>

                {/* Details */}
                <div className={`${isExpanded ? "block" : "hidden"} sm:block mt-3 space-y-3`}>
                  <div className="flex flex-wrap items-center gap-4 text-textc text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-primary" /> {new Date(ex.submittedDate).toLocaleDateString()}
                    </div>
                    {/* Type code badge */}
                  {ex.categorie === "code" && (
                      <div className="flex items-center gap-1">
                        <span className="text-primary font-bold">{`</>`}</span> {ex.language}
                      </div>
                    )}
                    {/* Difficulty */}
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          ex.difficulty === "Very easy"
                            ? "bg-secondary"
                            : ex.difficulty === "Moderate"
                            ? "bg-primary"
                            : "bg-pink"
                        }`}
                      ></span>
                      {ex.difficulty}
                    </div>
                  </div>

                  {/* Feedback */}
                  {(ex.status === "Soumis" || ex.status === "Brouillon") && (
                    <div className="flex flex-col ">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle size={16} className="text-primary" />
                        <span className="font-semibold text-sm text-primary">{t("teacherFeedback")}</span>
                      </div>
                      <div className={`p-3 rounded-md ${ex.status === "Soumis" ? "bg-surface" : "bg-white"}`}>
                        <p className="text-sm text-textc">{ex.feedback || t("noFeedback")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
          <div className="flex items-center justify-between bg-grad-3 border border-secondary2 p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-secondary" size={20} />
              <span className="font-regular text-md">{t("submitted")}</span>
            </div>
            <span className="text-md font-bold text-secondary">
              {exercises.filter(e => e.status === "Soumis").length}
            </span>
          </div>

          <div className="flex items-center justify-between bg-grad-4 border border-pink p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <Clock className="text-pink" size={20} />
              <span className="font-regular text-md">{t("brouillon")}</span>
            </div>
            <span className="text-md font-bold text-pink">
              {exercises.filter(e => e.status === "Brouillon").length}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
