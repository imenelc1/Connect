import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/common/NavBar";
import InfoCard from "../components/common/InfoCard";
import { MessageCircle, FileText, CheckCircle, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTentativeById } from "../services/progressionService";
import axios from "axios";

export default function SubmittedExoTheory() {
  const { t } = useTranslation("SubmittedExercise");
  const { tentativeId } = useParams();

  const [loading, setLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);

  // Fonction pour récupérer le feedback depuis FeedbackExercice
  const fetchFeedback = async (tentativeId) => {
    try {
      const token = localStorage.getItem("token");
      const BACKEND_URL = "http://127.0.0.1:8000";
      
      const feedbackResponse = await axios.get(
        `${BACKEND_URL}/api/feedback-exercice/list/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { tentative_ids: tentativeId }
        }
      );
      
      if (feedbackResponse.data && feedbackResponse.data.length > 0) {
        return feedbackResponse.data[0];
      }
      return null;
    } catch (error) {
      console.warn("Erreur récupération feedback:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchTentative = async () => {
      try {
        // 1. Récupérer la tentative
        const data = await getTentativeById(tentativeId);

        // 2. Récupérer le feedback depuis le nouveau modèle
        const feedbackResponse = await fetchFeedback(tentativeId);
        
        // 3. Préparer les données de l'exercice
        const exerciseInfo = {
          // InfoCard
          titre: data.exercice.titre_exo,
          description: data.exercice.enonce,
          difficulty: data.exercice.niveau_exo,
          studentName: `${data.utilisateur.nom} ${data.utilisateur.prenom}`,
          submittedDate: data.submitted_at
            ? new Date(data.submitted_at).toLocaleDateString()
            : new Date(data.created_at).toLocaleDateString(),

          // Theory specific
          statement: data.exercice.enonce,
          answer: data.reponse,
          solution: data.exercice.solution,
          // Utiliser le feedback du nouveau modèle ou fallback sur l'ancien
          feedback: feedbackResponse?.contenu || data.feedback || "",
          // Infos supplémentaires
          category: data.exercice.categorie || "theory",
          exerciceId: data.exercice.id_exercice,
          tentativeId: data.id,
          etat: data.etat,
        };

        setExerciseData(exerciseInfo);
        
        // 4. Stocker aussi les données complètes du feedback si besoin
        if (feedbackResponse) {
          setFeedbackData({
            contenu: feedbackResponse.contenu,
            created_at: feedbackResponse.created_at,
            id: feedbackResponse.id,
            feedback_prof: feedbackResponse.feedback_prof,
          });
        }

      } catch (err) {
        console.error("Erreur chargement tentative théorie", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTentative();
  }, [tentativeId]);

  if (loading) {
    return (
      <div className="flex bg-background min-h-screen">
        <Navbar />
        <main className="flex-1 ml-16 md:ml-56 p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (!exerciseData) {
    return (
      <div className="flex bg-background min-h-screen">
        <Navbar />
        <main className="flex-1 ml-16 md:ml-56 p-6 text-center py-20">
          <p className="text-gray-500 text-lg">{t("exerciseNotFound") || "Exercice non trouvé"}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Navbar />

      <main className="flex-1 ml-16 md:ml-56 p-6">
        {/* TITLE */}
        <h1 className="text-3xl ml-5 mb-5 font-semibold text-primary">
          {t("Completed Exercise") || "Exercice Complété"}
        </h1>

        {/* INFO CARD */}
        <InfoCard exercise={exerciseData} />

        {/* ÉNONCÉ */}
        <div className="bg-card p-4 rounded-2xl shadow-lg border border-primary/35 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">
              {t("exerciseStatement") || "Énoncé de l'exercice"}
            </h2>
          </div>

          <div className="bg-surface p-4 rounded-xl text-sm text-textc whitespace-pre-wrap">
            {exerciseData.statement}
          </div>
        </div>

        {/* RÉPONSE ÉTUDIANT */}
        <div className="bg-card p-4 rounded-2xl shadow-lg border border-primary/35 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">
              {t("studentAnswer") || "Réponse de l'étudiant"}
            </h2>
          </div>

          <div className="bg-primary/10 p-4 rounded-xl text-sm text-textc whitespace-pre-wrap">
            {exerciseData.answer || t("noAnswer") || "Aucune réponse fournie"}
          </div>
        </div>

        {/* SOLUTION */}
        {exerciseData.solution && (
          <div className="bg-card p-4 rounded-xl border border-primary/65 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-green-600" />
              <h3 className="font-semibold">{t("solution") || "Solution"}</h3>
            </div>

            <div className="bg-green-100/40 p-3 rounded text-sm whitespace-pre-wrap">
              {exerciseData.solution}
            </div>
          </div>
        )}

        {/* FEEDBACK - Amélioré avec plus d'informations */}
        <div className="bg-primary/10 p-6 rounded-2xl shadow-lg border border-primary/20 mt-6">
          <div className="flex items-start gap-3">
            <MessageCircle size={24} className="text-primary mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">
                  {t("teacherFeedback") || "Feedback du professeur"}
                </h2>
                {feedbackData && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    Nouveau système
                  </span>
                )}
              </div>
              
              {/* Contenu du feedback */}
              <div className="bg-white/80 p-4 rounded-xl mb-3">
                <p className="text-textc whitespace-pre-wrap">
                  {exerciseData.feedback || t("noFeedback") || "Aucun feedback pour le moment"}
                </p>
              </div>

              {/* Infos supplémentaires sur le feedback */}
              {feedbackData && (
                <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
                  <div className="flex flex-wrap gap-3">
                    {feedbackData.feedback_prof && (
                      <div>
                        <span className="font-medium">Professeur:</span> {feedbackData.feedback_prof.nom} {feedbackData.feedback_prof.prenom}
                      </div>
                    )}
                    {feedbackData.created_at && (
                      <div>
                        <span className="font-medium">Date:</span> {new Date(feedbackData.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MÉTADONNÉES (optionnel) */}
        <div className="mt-6 text-sm text-gray-500">
          <div className="flex flex-wrap gap-4">
            <div>
              <span className="font-medium">ID Exercice:</span> {exerciseData.exerciceId}
            </div>
            <div>
              <span className="font-medium">ID Tentative:</span> {exerciseData.tentativeId}
            </div>
            <div>
              <span className="font-medium">Statut:</span> {exerciseData.etat}
            </div>
            <div>
              <span className="font-medium">Catégorie:</span> {exerciseData.category}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}