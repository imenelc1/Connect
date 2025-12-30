import React, { useEffect, useState } from "react";
import Navbar from "../components/common/NavBar";
import { CheckCircle, Clock, MessageCircle, Calendar, ChevronRight } from "lucide-react";
import { getTentatives } from "../services/progressionService";
import { useTranslation } from "react-i18next";
import axios from "axios";

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

        // Pour chaque tentative, récupérer le feedback depuis FeedbackExercice
        const exercisesWithFeedbacks = await Promise.all(
          data.map(async (t) => {
            let feedbackContent = t.feedback || "";
            
            // Essayer de récupérer le feedback depuis le nouveau modèle
            try {
              const token = localStorage.getItem("token");
              const BACKEND_URL = "http://127.0.0.1:8000";
              
              const feedbackResponse = await axios.get(
                `${BACKEND_URL}/api/feedback-exercice/list/`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  params: { tentative_ids: t.id.toString() }
                }
              );
              
              if (feedbackResponse.data && feedbackResponse.data.length > 0) {
                feedbackContent = feedbackResponse.data[0].contenu;
              }
            } catch (fbErr) {
              console.warn("Erreur récupération feedback:", fbErr);
              // Garder l'ancien feedback si erreur
            }
            
            return {
              id: t.id,
              exerciceId: t.exercice.id_exercice, 
              title: t.exercice.titre_exo,
              description: t.exercice.enonce,
              // UTILISATION DE categorie COMME DANS LE DEUXIÈME FICHIER
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
              feedback: feedbackContent, // ← Feedback du nouveau modèle
              output: t.output,
              bgClass: "bg-grad-2",
              hasFeedback: !!feedbackContent, // Nouveau champ pour savoir si feedback existe
            };
          })
        );

        setExercises(exercisesWithFeedbacks);
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

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Non soumis";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="flex">
      <Navbar />

      <main className="flex-1 ml-16 sm:ml-56 p-6">
        <h1 className="text-3xl font-semibold text-primary">{t("submittedExercises") || "Exercices Soumis"}</h1>
        <div className="text-primary font-medium text-sm border border-primary px-3 py-1 rounded-md shadow-sm bg-bg inline-block mt-2">
          {t("total") || "Total"}: {filtered.length} {t("exercises") || "exercices"}
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex gap-3 mt-4 mb-6">
          <button
            onClick={() => setFilter("All")}
            className={`border px-3 py-1 rounded ${filter === "All" ? "bg-primary text-white" : "bg-bg text-primary"}`}
          >
            {t("all") || "Tous"}
          </button>
          <button
            onClick={() => setFilter("Soumis")}
            className={`border px-3 py-1 rounded ${filter === "Soumis" ? "bg-primary text-white" : "bg-bg text-primary"}`}
          >
            {t("submitted") || "Soumis"}
          </button>
          <button
            onClick={() => setFilter("Brouillon")}
            className={`border px-3 py-1 rounded ${filter === "Brouillon" ? "bg-primary text-white" : "bg-bg text-primary"}`}
          >
            {t("brouillon") || "Brouillon"}
          </button>
        </div>

        {/* LIST OF CARDS - AVEC SPINNER DE CHARGEMENT ET MESSAGE QUAND VIDE */}
        <div className="flex flex-col gap-5 mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Aucun exercice {filter !== "All" ? filter.toLowerCase() : ""} trouvé
            </div>
          ) : (
            filtered.map((ex) => {
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
                  <h2 className="text-xl font-semibold pr-20">{ex.title}</h2>

                  {/* Description prévisualisée */}
                  <p className="text-textc text-sm leading-relaxed mt-2 line-clamp-2">
                    {ex.description}
                  </p>

                  {/* ArrowRight clickable - NAVIGATION DIFFÉRENCIÉE PAR CATÉGORIE */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex flex-wrap items-center gap-4 text-textc text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-primary" /> 
                        {formatDate(ex.submittedDate)}
                      </div>
                      {/* Type code badge - BASÉ SUR categorie */}
                      {ex.categorie === "code" && (
                        <div className="flex items-center gap-1">
                          <span className="text-primary font-bold">{`</>`}</span> {ex.language}
                        </div>
                      )}
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
                      {ex.hasFeedback && (
                        <div className="flex items-center gap-1 text-green-600">
                          <MessageCircle size={14} />
                          <span className="text-xs font-medium">Feedback disponible</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-primary cursor-pointer hover:text-primary/80"
                      // NAVIGATION DIFFÉRENCIÉE PAR CATÉGORIE COMME DANS LE DEUXIÈME FICHIER
                      onClick={() => {
                        ex.categorie === "code"
                          ? window.location.href = `/submitted-exercise/${ex.id}`
                          : window.location.href = `/submitted-exercise-theory/${ex.id}`;
                      }}
                    />
                  </div>

                  {/* Détails supplémentaires (dépliables) - MOINS DE DÉTAILS COMME DANS LE DEUXIÈME */}
                  <div className={`${isExpanded ? "block" : "hidden"} sm:block mt-4 space-y-3`}>
                    {/* Feedback (si disponible) */}
                    {ex.hasFeedback && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle size={16} className="text-primary" />
                          <span className="font-semibold text-sm text-primary">
                            {t("teacherFeedback") || "Feedback du professeur"}
                          </span>
                        </div>
                        <div className="p-3 rounded-md bg-white/70 border border-primary/20">
                          <p className="text-sm text-textc whitespace-pre-wrap">
                            {ex.feedback || t("noFeedback") || "Aucun feedback pour le moment"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bouton pour déplier/replier */}
                  <button
                    onClick={() => toggleCard(ex.id)}
                    className="self-end mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {isExpanded ? "Voir moins" : "Voir plus de détails"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM STATS - 2 STATISTIQUES COMME DANS LE DEUXIÈME FICHIER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
          <div className="flex items-center justify-between bg-grad-3 border border-secondary2 p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-secondary" size={20} />
              <span className="font-regular text-md">{t("submitted") || "Soumis"}</span>
            </div>
            <span className="text-md font-bold text-secondary">
              {exercises.filter(e => e.status === "Soumis").length}
            </span>
          </div>

          <div className="flex items-center justify-between bg-grad-4 border border-pink p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <Clock className="text-pink" size={20} />
              <span className="font-regular text-md">{t("brouillon") || "Brouillon"}</span>
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