import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import InfoCard from "../components/common/InfoCard";
import { MessageCircle, FileText, CheckCircle, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTentativeById } from "../services/progressionService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeContext from "../context/ThemeContext";
import { getCurrentUserId } from "../hooks/useAuth"; // IMPORT AJOUTÉ

export default function SubmittedExoTheory() {
  const { t } = useTranslation("SubmittedExercise");
  const { tentativeId } = useParams();
  
  const navigate = useNavigate();
      const { toggleDarkMode } = useContext(ThemeContext);
    const [searchTerm, setSearchTerm] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // AJOUTEZ CES LIGNES POUR RÉCUPÉRER LES DONNÉES UTILISATEUR
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const resizeHandler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);
  
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
      console.warn(t("errors.feedbackFetch"), error);
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
        console.error(t("errors.loadAttempt"), err);
      } finally {
        setLoading(false);
      }
    };

    fetchTentative();
  }, [tentativeId]);

  if (loading) {
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
          {/* AJOUTEZ LE HEADER COMME DANS AllCoursesPage */}
          <header className="flex flex-row justify-between items-center gap-3 sm:gap-4 mb-6">
            <h1 className="text-lg sm:text-2xl font-bold text-muted truncate">
              {t("Completed Exercise") || "Exercice Complété"}
            </h1>
           
          </header>
          
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!exerciseData) {
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
          
          
          <p className="text-gray-500 text-lg">{t("exerciseNotFound") || "Exercice non trouvé"}</p>
        </main>
      </div>
    );
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
       

        {/* Le reste de votre contenu existant... */}
        <h1 className="text-3xl ml-5 mb-5 font-semibold text-primary">
          {t("completedExercise")}
        </h1>

        <InfoCard exercise={exerciseData} />

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

        <div className="bg-primary/10 p-6 rounded-2xl shadow-lg border border-primary/20 mt-6">
          <div className="flex items-start gap-3">
            <MessageCircle size={24} className="text-primary mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">
                  {t("teacherFeedback")}
                </h2>
                {feedbackData && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    {t("newSystem")}
                  </span>
                )}
              </div>
              
              <div className="bg-card p-4 rounded-xl mb-3">
                <p className="text-textc whitespace-pre-wrap">
                  {exerciseData.feedback || t("noFeedback")}
                </p>
              </div>

              {feedbackData && (
                <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
                  <div className="flex flex-wrap gap-3">
                    {feedbackData.feedback_prof && (
                      <div>
                        <span className="font-medium">{t("teacher")}</span> {feedbackData.feedback_prof.nom} {feedbackData.feedback_prof.prenom}
                      </div>
                    )}
                    {feedbackData.created_at && (
                      <div>
                        <span className="font-medium">{t("date") || "Date"}:</span>{" "}
                        {new Date(feedbackData.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <div className="flex flex-wrap gap-4">
            <div>
              <span className="font-medium">{t("exerciseId")}:</span> {exerciseData.exerciceId}
            </div>
            <div>
              <span className="font-medium">{t("attemptId")}:</span> {exerciseData.tentativeId}
            </div>
            <div>
              <span className="font-medium">{t("status")}:</span> {exerciseData.etat}
            </div>
            <div>
              <span className="font-medium">{t("category")}:</span> {exerciseData.category}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}