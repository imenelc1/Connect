import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Trash2, FileText, SquarePen } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import api from "../services/courseService";
import { toast } from 'react-hot-toast';

const buttonStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};


export default function QuizzesManagement() {
  const { t } = useTranslation("QuizManagement");
  const navigate = useNavigate();
  const { toggleDarkMode } = useContext(ThemeContext);

  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // ================= RESIZE =================
  // Handle window resize
  useEffect(() => {
    const resizeHandler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);
  // Sidebar collapsed
  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 60 : 240;

  const [editValues, setEditValues] = useState({ title: "", description: "", visibilite_exo: false });

  const difficultyBgMap = {
    debutant: "bg-grad-2",
    intermediaire: "bg-grad-3",
    avance: "bg-grad-4",
  };

  const token = localStorage.getItem("admin_token");

  // ================= Fetch quizzes =================
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get("quiz/api/quiz/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.data;
        setQuizzes(
          data.map((q) => ({
            id: q.id,
            exerciceId: q.exercice?.id_exercice,
            title: q.exercice?.titre_exo || t("defaults.noTitle"),
            subtitle: q.exercice?.enonce || "",
            questions: q.questions?.length || 0,
            attempts: q.nbMax_tentative || 0,
            cours: q.exercice?.cours,
            utilisateur: q.exercice?.utilisateur,
            score: q.scoreMinimum || 0,
            visibilite_exo: q.exercice?.visibilite_exo,
            niveau_exo: q.exercice?.niveau_exo || t("defaults.beginner"),
            niveau_exercice_label: q.exercice?.niveau_exercice_label,
            icon: <FileText size={22} />,
          }))
        );
      } catch (err) {
        console.error(t("errors.quizLoad"), err);
      }
    };
    fetchQuizzes();
  }, [token]);

  // ================= Responsivité =================

  // ================= Edit Quiz =================


  // ================= Edit Quiz =================
  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setEditValues({
      title: quiz.title,
      niveau_exo: quiz.niveau_exo,
      visibilite_exo: quiz.visibilite_exo,
    });
    setEditModal(true);
  };

  const submitEdit = async (e) => {
    //e.preventDefault();
    if (!selectedQuiz) return;

    try {
      await api.put(
        `exercices/${selectedQuiz.exerciceId}/`,
        {
          titre_exo: editValues.title,
          niveau_exo: editValues.niveau_exo,
          categorie: selectedQuiz.categorie,
          cours: selectedQuiz.cours,
          enonce: selectedQuiz.subtitle,
          utilisateur: selectedQuiz.utilisateur,
          visibilite_exo: selectedQuiz.visibilite_exo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("messages.updateQuiz"));

      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === selectedQuiz.id
            ? { ...q, title: editValues.title, niveau_exo: editValues.niveau_exo }
            : q
        )
      );

      setEditModal(false);
      setSelectedQuiz(null);
    } catch (err) {
      console.error(t("errors.update"), err.response?.data || err.message);
      alert(t("errors.updateQuiz"));
    }
  };

  // ================= Delete Quiz =================
  const handleDeleteQuiz = async (exerciceId) => {
    if (!window.confirm(t("messages.deleteQuiz"))) return;
    try {
      await api.delete(`exercices/${exerciceId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes((prev) => prev.filter((q) => q.exerciceId !== exerciceId));
    } catch (err) {
      console.error(t("errors.delete"), err);
      alert(t("errors.delQuiz"));
    }
  };

  // ================= Render =================
  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

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

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">
              {t("title")}
            </h1>
            <p className="text-gray">{t("subtitle")}</p>
          </div>
        </div>

        <ContentSearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-md mb-6 sm:mb-10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredQuizzes.map((q) => (
            <div
              key={q.id}
              className={`${difficultyBgMap[q.niveau_exo] || "bg-white"} rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 flex items-center justify-center bg-pink/20 text-pink rounded-xl">
                    {q.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg truncate">{q.title}</h3>
                    <p className="text-grayc text-sm truncate">{q.subtitle}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="courseStart"
                    className={`px-4 py-2 whitespace-nowrap ${buttonStyles[q.niveau_exercice_label]}`}
                    onClick={() => navigate(`/Voir-quiz/${q.exerciceId}`)}
                  >
                    {t("voir_quiz")}
                  </Button>
                  <button
                    className="text-muted hover:opacity-80"
                    onClick={() => handleEdit(q)}
                  >
                    <SquarePen size={20} />
                  </button>
                  <button
                    className="text-red hover:opacity-80"
                    onClick={() => handleDeleteQuiz(q.exerciceId)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-4 grid grid-cols-3 text-center">
                <div>
                  <span className="text-gray-500 text-sm">{t("stats.questions")}</span>
                  <p className="font-semibold text-lg">{q.questions}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">{t("stats.attempts")}</span>
                  <p className="font-semibold text-lg">{q.attempts}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">{t("stats.avgScore")}</span>
                  <p className="font-semibold text-lg">{q.score}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Edit Modal */}
      <AddModal
        open={editModal}
        onClose={() => setEditModal(false)}
        title={t("modal.editTitle")}
        subtitle={t("modal.editSubtitle")}
        submitLabel={t("modal.submitEdit")}
        cancelLabel={t("modal.cancel")}
        onSubmit={submitEdit}
        fields={
          selectedQuiz
            ? [
              {
                label: t("modal.fields.title.label"),
                placeholder: t("modal.fields.title.placeholder"),
                value: editValues.title,
                onChange: (e) =>
                  setEditValues({ ...editValues, title: e.target.value }),
              },
              {
                label: t("modal.fields.difficulty.label"),
                element: (
                  <select
                    value={editValues.niveau_exo}
                    onChange={(e) =>
                      setEditValues({ ...editValues, niveau_exo: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="debutant">{t("modal.fields.difficulty.easy")}</option>
                    <option value="intermediaire">{t("modal.fields.difficulty.medium")}</option>
                    <option value="avance">{t("modal.fields.difficulty.hard")}</option>
                  </select>
                ),
              },
              {
                label: t("modal.fields.visibilite"),
                element: (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editValues.visibilite_exo}   // ✅ checked
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          visibilite_exo: e.target.checked, // ✅ boolean
                        })
                      }
                    />
                    <span>{t("modal.fields.visibiliteLabel")}</span>
                  </label>
                ),
              }
            ]
            : []
        }
      />
    </div>
  );
}
