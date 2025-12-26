import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/NavBar";
import InfoCard from "../components/common/InfoCard";
import { MessageCircle, File } from "lucide-react";
import { getTentativeById } from "../services/progressionService";

export default function SubmittedExercise() {
  const { t } = useTranslation("SubmittedExercise");
  const { tentativeId } = useParams();

  const [loading, setLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState(null);

  useEffect(() => {
    const fetchTentative = async () => {
      try {
        const data = await getTentativeById(tentativeId);

        setExerciseData({
          code: data.reponse,
          solution: data.exercice.solution || "", // <- la solution ici
          actualOutput: data.output,
          feedback: data.feedback,
          titre: data.exercice.titre_exo,
          description: data.exercice.enonce,
          language: "C",
          difficulty: data.exercice.niveau_exo,
          studentName: data.utilisateur.nom + " " + data.utilisateur.prenom,
          submittedDate: data.submitted_at
            ? new Date(data.submitted_at).toLocaleDateString()
            : new Date(data.created_at).toLocaleDateString(),
        });

        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement tentative", err);
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
        {/* INFO CARD */}
        <h1 className="text-3xl ml-5 mb-5 font-semibold text-primary">{t("Completed Exercise")}</h1>
        <InfoCard exercise={exerciseData}/>

        <div className="grid grid-cols-1 gap-4">
          {/* CODE */}
          <div className="bg-card p-4 rounded-2xl shadow-lg border border-primary/35">
            <div className="flex items-center mb-3 gap-2">
              <File size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">{t("submittedCode")}</h2>
            </div>

            <div className="bg-black rounded-xl overflow-auto h-96 text-gray-300 p-4">
              <pre className="whitespace-pre-wrap">{exerciseData.code}</pre>
            </div>
          </div>


            <div className="bg-card p-4 rounded-xl border border-primary/65">
              <h3 className="font-semibold mb-2">{t("actualOutput")}</h3>
              <pre className="bg-primary/30 p-3 rounded text-sm">
                {exerciseData.actualOutput}
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
            <div className="bg-card p-4 rounded-xl border border-primary/65">
              <h3 className="font-semibold mb-2">{t("solution")}</h3>
              <pre className="bg-surface p-3 rounded text-sm">
                {exerciseData.solution}
              </pre>
          </div>


          {/* FEEDBACK */}
          <div className="bg-primary/10 p-4 rounded-2xl shadow-lg flex gap-2 mt-4">
            <MessageCircle size={20} className="text-primary mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-1">
                {t("teacherFeedback")}
              </h2>
              <p className="text-sm text-textc">{exerciseData.feedback}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
