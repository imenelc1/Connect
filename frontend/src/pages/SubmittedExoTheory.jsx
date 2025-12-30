import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/common/NavBar";
import InfoCard from "../components/common/InfoCard";
import { MessageCircle, FileText, CheckCircle, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTentativeById } from "../services/progressionService";

export default function SubmittedExoTheory() {
  const { t } = useTranslation("SubmittedExercise");
  const { tentativeId } = useParams();

  const [loading, setLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState(null);

  useEffect(() => {
    const fetchTentative = async () => {
      try {
        const data = await getTentativeById(tentativeId);

        setExerciseData({
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
          feedback: data.feedback,
        });

      } catch (err) {
        console.error("Erreur chargement tentative théorie", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTentative();
  }, [tentativeId]);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!exerciseData) {
    return <div className="p-10 text-center">Not found</div>;
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Navbar />

      <main className="flex-1 ml-16 md:ml-56 p-6">
        {/* TITLE */}
        <h1 className="text-3xl ml-5 mb-5 font-semibold text-primary">
          {t("Completed Exercise")}
        </h1>

        {/* INFO CARD */}
        <InfoCard exercise={exerciseData} />

        {/* ÉNONCÉ */}
        <div className="bg-card p-4 rounded-2xl shadow-lg border border-primary/35 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">
              {t("exerciseStatement")}
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
              {t("studentAnswer")}
            </h2>
          </div>

          <div className="bg-primary/10 p-4 rounded-xl text-sm text-textc whitespace-pre-wrap">
            {exerciseData.answer || t("noAnswer")}
          </div>
        </div>

        {/* SOLUTION */}
        {exerciseData.solution && (
          <div className="bg-card p-4 rounded-xl border border-primary/65 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-green-600" />
              <h3 className="font-semibold">{t("solution")}</h3>
            </div>

            <div className="bg-green-100/40 p-3 rounded text-sm whitespace-pre-wrap">
              {exerciseData.solution}
            </div>
          </div>
        )}

        {/* FEEDBACK */}
        <div className="bg-primary/10 p-4 rounded-2xl shadow-lg flex gap-2 mt-4">
          <MessageCircle size={20} className="text-primary mt-1" />
          <div>
            <h2 className="text-lg font-semibold mb-1">
              {t("teacherFeedback")}
            </h2>
            <p className="text-sm text-textc">
              {exerciseData.feedback || t("noFeedback")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}