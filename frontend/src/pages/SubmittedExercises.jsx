import React, { useEffect, useState,useContext } from "react";

import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/Navbar";
import InfoCard from "../components/common/InfoCard";
import { MessageCircle, File } from "lucide-react";
import { getTentativeById } from "../services/progressionService";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";


import axios from "axios"; // ← Ajoutez cette importation
export default function SubmittedExercise() {
  const { t } = useTranslation("SubmittedExercise");
  const navigate = useNavigate();
  const { tentativeId } = useParams();
   const { toggleDarkMode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState(null);
  const [feedback, setFeedback] = useState(""); // ← État séparé pour le feedback
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

  window.addEventListener("resize", handleResize);
  window.addEventListener("sidebarChanged", handleSidebarChange);

  return () => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("sidebarChanged", handleSidebarChange);
  };
}, []);


  useEffect(() => {
    const fetchTentative = async () => {
      try {
        // 1. Récupérer la tentative
        const data = await getTentativeById(tentativeId);
      
        
        // 2. Récupérer le feedback depuis le nouveau modèle
        let feedbackContent = data.feedback || ""; // Fallback sur l'ancien champ
        
        try {
          const token = localStorage.getItem("token");
          const BACKEND_URL = "http://127.0.0.1:8000";
          
          const response = await axios.get(
            `${BACKEND_URL}/api/feedback-exercice/list/`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { 
                tentative_ids: tentativeId // Un seul ID
              }
            }
          );
          
          // Si on a des résultats, prendre le premier
          if (response.data && response.data.length > 0) {
            feedbackContent = response.data[0].contenu;
          }
        } catch (fbErr) {
          console.warn(t("errors.feedbackLoadFallback"), fbErr);
          // On garde l'ancien feedback en cas d'erreur
        }
        
        setFeedback(feedbackContent);

        // 3. Préparer les données de l'exercice
        setExerciseData({
          code: data.reponse,
          solution: data.exercice.solution || "",
          actualOutput: data.output,
          feedback: feedbackContent, // ← Utilise le nouveau feedback
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
 console.error(t("errors.loadAttempt"), err);
        setLoading(false);
      }
    };

    fetchTentative();
  }, [tentativeId]);

  if (loading) {
    return <div className="p-10 text-center">{t("loading")}</div>;
  }

  if (!exerciseData) {
    return <div className="p-10 text-center">{t("notFound")}</div>;
  }

  return (
  <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
                    {/* Sidebar */}
                    <div>
                      <Navbar />
                    </div>

  <main className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>

        {/* INFO CARD */}
        
        <h1 className="text-3xl ml-5 mb-5 font-semibold text-primary">{t("completedExercise")}</h1>
        
        
        <InfoCard exercise={exerciseData}/>

        <div className="grid grid-cols-1 gap-4">
          {/* CODE */}
          <div className="bg-card p-4 rounded-2xl shadow-lg border border-primary/35">
            <div className="flex items-center mb-3 gap-2">
              <File size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">{t("submittedCode")}</h2>
            </div>

            <div className="bg-surface rounded-xl overflow-auto h-96 text-gray p-4">
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
              <p className="text-sm text-textc">
                {feedback || exerciseData.feedback || t("noFeedback")}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

