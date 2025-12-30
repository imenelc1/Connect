import { MessageSquare, Calendar, Clock, Send, ChevronDown, ChevronUp } from "lucide-react";
import "../../styles/index.css";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import axios from "axios";

export default function TaskCard({ 
  title, 
  date, 
  etat, 
  code, 
  feedback, 
  exerciceId, 
  tentativeId,
  nbSoumissions = 0,
  maxSoumissions = 0,
  numeroTentative = null,
  // Ajoutez ces props pour gérer plusieurs tentatives
  allTentatives = [],
  currentTentativeIndex = 0
}) {
  const { t } = useTranslation("exerciceStudent");
  const [currentFeedback, setCurrentFeedback] = useState(feedback || "");
  const [newFeedback, setNewFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAllTentatives, setShowAllTentatives] = useState(false);
  const [selectedTentativeIndex, setSelectedTentativeIndex] = useState(currentTentativeIndex);

  // Si on a plusieurs tentatives, gérer la sélection
  const currentTentative = allTentatives[selectedTentativeIndex] || {};
  
  // Mettre à jour le feedback quand on change de tentative
  useEffect(() => {
    if (currentTentative.feedback) {
      setCurrentFeedback(currentTentative.feedback);
    } else {
      // Vérifier en base
      const checkFeedback = async () => {
        if (!currentTentative.id) return;
        
        try {
          const token = localStorage.getItem("token");
          const BACKEND_URL = "http://127.0.0.1:8000";
          
          const response = await axios.get(
            `${BACKEND_URL}/api/feedback-exercice/list/`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { tentative_ids: currentTentative.id.toString() }
            }
          );
          
          if (response.data && response.data.length > 0) {
            setCurrentFeedback(response.data[0].contenu);
          } else {
            setCurrentFeedback("");
          }
        } catch (err) {
          console.error("Erreur vérification feedback:", err);
          setCurrentFeedback("");
        }
      };
      
      checkFeedback();
    }
  }, [selectedTentativeIndex, currentTentative]);

  const handleSendFeedback = async () => {
    if (!newFeedback.trim() || !currentTentative.id) {
      alert("Veuillez entrer un feedback valide");
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const BACKEND_URL = "http://127.0.0.1:8000";

      const response = await axios.post(
        `${BACKEND_URL}/api/feedback-exercice/`,
        {
          contenu: newFeedback,
          exercice: exerciceId,
          tentative: currentTentative.id,
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        setCurrentFeedback(response.data.feedback.contenu);
        setNewFeedback("");
        alert("Feedback envoyé avec succès !");
        
        // Mettre à jour la tentative locale
        if (allTentatives[selectedTentativeIndex]) {
          allTentatives[selectedTentativeIndex].feedback = response.data.feedback.contenu;
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'envoi du feedback");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-md p-4 sm:p-6 border-2 border-gray w-full">
      {/* Header avec sélecteur de tentative */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <span className="flex items-center text-sm text-gray gap-1">
            <Calendar size={16} /> {currentTentative.submitted_at ? 
              new Date(currentTentative.submitted_at).toLocaleString() : date}
          </span>
          
          {/* Sélecteur de tentative si plusieurs */}
          {allTentatives.length > 1 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-600">Tentative :</span>
              <select 
                className="text-sm border rounded px-2 py-1"
                value={selectedTentativeIndex}
                onChange={(e) => setSelectedTentativeIndex(parseInt(e.target.value))}
              >
                {allTentatives.map((t, index) => (
                  <option key={t.id} value={index}>
                    Tentative {index + 1} - {t.etat} - {t.submitted_at ? 
                      new Date(t.submitted_at).toLocaleDateString() : 'Non soumis'}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-700">
                ({selectedTentativeIndex + 1}/{allTentatives.length})
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          <span className="flex items-center text-sm p-1 bg-purple rounded-full text-white gap-1">
            <Clock size={16} /> {currentTentative.etat || etat}
          </span>
          <div className="mt-1 text-sm text-gray-700">
            {maxSoumissions === 0 ? 
              `${nbSoumissions} tentatives (illimité)` :
              `${nbSoumissions}/${maxSoumissions} tentatives`
            }
          </div>
        </div>
      </div>

      {/* Code Block de la tentative sélectionnée */}
      <pre className="bg-primary/20 p-4 sm:p-6 rounded-2xl text-sm leading-relaxed overflow-x-auto mb-4">
        <code>
          <p className="font-semibold">{t("exerciceStudent.Solution")} (Tentative {selectedTentativeIndex + 1}):</p>
          {currentTentative.reponse || code}
        </code>
      </pre>

      {/* Feedback Zone pour la tentative sélectionnée */}
      <div className="mt-4">
        {currentFeedback ? (
          <div>
            <strong className="flex font-semibold items-center gap-2">
              <MessageSquare size={16} className="text-purple"/> 
              {t("exerciceStudent.Feedback")} (Tentative {selectedTentativeIndex + 1}):
            </strong>
            <div className="bg-primary/20 text-text p-4 rounded-xl text-sm flex flex-col mt-2">
              <span className="whitespace-pre-wrap">{currentFeedback}</span>
              <button
                className="self-end mt-2 text-sm text-purple hover:underline"
                onClick={() => {
                  setNewFeedback(currentFeedback);
                  setCurrentFeedback("");
                }}
              >
                Modifier le feedback
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="flex text-gray font-medium text-sm items-center gap-2">
              <MessageSquare size={16} className="text-purple"/> 
              {t("exerciceStudent.Feedback")} (Tentative {selectedTentativeIndex + 1}):
            </label>
            <textarea
              placeholder="Entrez votre feedback pour cette tentative..."
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              className="bg-primary/20 w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple min-h-[100px]"
              rows="3"
            />
            <button
              className="flex px-4 py-2 bg-purple text-white rounded-xl items-center gap-2 disabled:opacity-50 w-fit"
              onClick={handleSendFeedback}
              disabled={isLoading || !newFeedback.trim()}
            >
              <Send size={16} /> 
              {isLoading ? "Envoi..." : t("exerciceStudent.Send")}
            </button>
          </div>
        )}
      </div>

      {/* Bouton pour voir toutes les tentatives (optionnel) */}
      {allTentatives.length > 1 && (
        <div className="mt-6 border-t pt-4">
          <button
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            onClick={() => setShowAllTentatives(!showAllTentatives)}
          >
            {showAllTentatives ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Voir toutes les tentatives ({allTentatives.length})
          </button>
          
          {showAllTentatives && (
            <div className="mt-3 space-y-3">
              {allTentatives.map((t, index) => (
                <div 
                  key={t.id}
                  className={`p-3 rounded-lg border ${index === selectedTentativeIndex ? 'border-purple bg-purple/5' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">Tentative {index + 1}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {t.submitted_at ? new Date(t.submitted_at).toLocaleString() : 'Non soumis'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${t.etat === 'soumis' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {t.etat}
                      </span>
                      <button
                        className="text-xs text-purple hover:underline"
                        onClick={() => setSelectedTentativeIndex(index)}
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                  {t.feedback && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Feedback :</strong> {t.feedback.substring(0, 100)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}