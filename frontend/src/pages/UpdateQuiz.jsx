import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/common/NavBar";
import QuizSettings from "../components/common/QuizSettings";
import QuizSummary from "../components/common/QuizSummary";
import QuestionForm from "../components/common/QuestionForm";
import SaveDraftButton from "../components/common/SaveDraftButton";
import PublishQuizButton from "../components/common/PublishQuizButton";
import UserCircle from "../components/common/UserCircle";
import Topbar from "../components/common/TopBar";
import { FaClock, FaMedal, FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import { getCurrentUserId } from "../hooks/useAuth";
import { Globe, FileText, Activity } from "lucide-react";
import api from "../services/courseService";

export default function UpdateQuiz() {
  const { exerciceId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("createQuiz");
  const { toggleDarkMode } = useContext(ThemeContext);
  const [activeStep, setActiveStep] = useState(1);

  const userData = JSON.parse(localStorage.getItem("user")) || {};
const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""
    }`.toUpperCase();

  const exerciseSteps = [
    { label: t("info"), icon: FileText },
    { label: t("preview"), icon: Activity },
  ];
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    level: "",
    courseId: "",
    visibility: "",
    maxAttempts: 0,
    durationEnabled: false,
    duration: 30,
    passingScore: 0,
    delais_entre_tentative: 0,
    questions: [],
  });

  const [courses, setCourses] = useState([]);
  const currentUserId = getCurrentUserId();

  /* ================= FETCH QUIZ ================= */
  useEffect(() => {
    fetch(`http://localhost:8000/api/quiz/api/quiz/${exerciceId}/`)
      .then(res => {
        if (!res.ok) throw new Error("Quiz non trouvé");
        return res.json();
      })
      .then(data => {
        const q = Array.isArray(data) ? data[0] : data;
         console.log("🔥 QUIZ API RESPONSE", q);
         console.log("🔥 EXERCICE FROM API", q.exercice);
        const formattedQuiz = {
          quizId: q.id,
          scoreMinimum: q.scoreMinimum,
          durationMinutes: q.duration_minutes,
          activerDuration: q.activerDuration,
          nbMaxTentative: q.nbMax_tentative,
          delai_entre_tentatives: q.delai_entre_tentatives,
          exercice: {
            titre: q.exercice?.titre_exo || "",
            enonce: q.exercice?.enonce || "",
            niveau: q.exercice?.niveau_exo || "",
            cours:q.exercice?.cours || "",
            visibilite_exo_label: q.exercice?.visibilite_exo_label || "private",
          },
          questions: q.questions.map(question => ({
            id: question.id_qst,
            texte: question.texte_qst,
            score: question.score,
            reponse_correcte: question.reponse_correcte || "",
            options: question.options.map(opt => ({
              id: opt.id_option,
              texte: opt.texte_option,
            })),
          })),
        };

        setQuiz(formattedQuiz);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [exerciceId]);

  /* ================= SET QUIZDATA ================= */
  useEffect(() => {
    if (!quiz) return;

    setQuizData({
      
      title: quiz.exercice.titre,
      description: quiz.exercice.enonce,
      level: quiz.exercice.niveau,
      courseId: quiz.exercice.cours,     // ✅ ICI
      visibility:  quiz.exercice.visibilite_exo_label,
      maxAttempts: quiz.nbMaxTentative,
      durationEnabled: quiz.activerDuration,
      duration: quiz.durationMinutes,
      passingScore: quiz.scoreMinimum,
      delais_entre_tentative: quiz.delai_entre_tentatives,
      questions: quiz.questions.map(qst => ({
        id_qst:qst.id,
        text: qst.texte,
        points: qst.score,
        answers: qst.options.map(opt => ({
          id_option:opt.id,
          text: opt.texte,
          isCorrect: opt.texte === qst.reponse_correcte,
        })),
      })),
    });
  }, [quiz]);

  /* ================= HANDLE CHANGE ================= */
  const handleQuizChange = (field, value) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionsChange = (questions) => {
    setQuizData(prev => ({ ...prev, questions }));
  };

handleQuestionsChange.addRemovedQuestion = (id_qst) => {
  setQuizData(prev => ({
    ...prev,
    removedQuestions: [...(prev.removedQuestions || []), id_qst],
  }));
};

  const addQuestionFromTopButton = () => {
    const newQuestion = {
      text: "",
      points: 1,
      answers: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    };
    setQuizData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const totalPoints = quizData.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const totalQuestions = quizData.questions.length;

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    fetch("http://localhost:8000/api/courses/api/cours")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({
          id: c.id_cours,
          title: c.titre_cour,
          isMine: c.utilisateur === currentUserId,
        }));
        setCourses(formatted);
      })
      .catch(err => console.error(err));
  }, [currentUserId]);

  const myCourses = courses.filter(c => c.isMine);

  /* ================= RENDER ================= */
  if (loading) return <p>Chargement...</p>;




const formatDuration = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}:00`;
};

const handleUpdateQuiz = async () => {
  try {
    /* ===== UPDATE EXERCICE ===== */
    await api.put(`/exercices/${exerciceId}/`, {
      titre_exo: quizData.title,
      enonce: quizData.description,
      niveau: quizData.level,
      cours: quizData.courseId,
      utilisateur: currentUserId,
      visibilite_exo: quizData.visibility === "public",
    });

    /* ===== UPDATE QUIZ ===== */
    await api.put(`/quiz/${quiz.quizId}/`, {
      scoreMinimum: Number(quizData.passingScore),
      activerDuration: quizData.durationEnabled,
      exercice: exerciceId,
      duration: quizData.durationEnabled
        ? formatDuration(Number(quizData.duration))
        : null,
      nbMax_tentative: Number(quizData.maxAttempts || 0),
      delai_entre_tentatives: Number(quizData.delais_entre_tentative || 0),
    });

    /* ===== QUESTIONS & OPTIONS ===== */
    for (const question of quizData.questions) {
      // Si la question est marquée pour suppression
     if (question._delete && question.id_qst) {
  await api.delete(`/quiz/Question/${question.id_qst}`);
  continue; // passer à la question suivante
}

      const correctAnswer = question.answers.find(a => a.isCorrect)?.text;
      if (!correctAnswer) {
        throw new Error("Chaque question doit avoir une réponse correcte");
      }

      let questionId = question.id_qst;

      // UPDATE ou CREATE QUESTION
      if (questionId) {
        await api.put(`/quiz/Question/${questionId}`, {
          texte_qst: question.text,
          exercice: exerciceId,
          score: Number(question.points),
          reponse_correcte: correctAnswer,
        });
      } else {
        const res = await api.post(`/quiz/Question/`, {
          texte_qst: question.text,
          score: Number(question.points),
          reponse_correcte: correctAnswer,
          exercice: exerciceId,
        });
        questionId = res.data.id_qst;
        question.id_qst = questionId; // mettre à jour l'ID pour le suivi
      }

      // Supprimer les options marquées
      if (question.removedOptions?.length > 0) {
        await Promise.all(
          question.removedOptions.map((optId) =>
            api.delete(`/quiz/Option/${optId}`)
          )
        );
        question.removedOptions = [];
      }

      // UPDATE ou CREATE OPTIONS
      await Promise.all(
        question.answers.map(async (option) => {
          if (option.id_option) {
            await api.put(`/quiz/Option/${option.id_option}`, {
              texte_option: option.text,
              question: questionId,
            });
          } else {
            const res = await api.post(`/quiz/Option/`, {
              texte_option: option.text,
              question: questionId,
            });
            option.id_option = res.data.id_option; // assigner l’ID
          }
        })
      );
    }

    alert("✅ Quiz mis à jour avec succès !");
    navigate("/all-quizzes");
  } catch (error) {
    console.error("❌ ERREUR BACKEND 👉", error.response?.data || error.message);
    alert("❌ Erreur lors de la mise à jour");
  }
};



  return (
    <div className="w-full min-h-screen flex bg-primary/5">
      <div className="hidden lg:block w-64 min-h-screen">
        <Navbar />
      </div>

      <div className="flex-1 flex flex-col p-4 lg:p-8 gap-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end">
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={lang => i18n.changeLanguage(lang)}
            />
          </div>

         <Topbar
            steps={exerciseSteps}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            className="flex justify-between"
         />
          {activeStep === 1 && (
          <div className="rounded-2xl shadow-lg p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-grad-2">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-4 lg:col-span-1">
              <QuizSettings
                quizData={quizData}
                onQuizChange={handleQuizChange}
                courses={myCourses}
              />
              <QuizSummary
                totalQuestions={totalQuestions}
                totalPoints={totalPoints}
                duration={quizData.duration}
                passingScore={quizData.passingScore}
                maxAttempts={quizData.maxAttempts}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-4 lg:col-span-2 flex-1 px-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg md:text-xl font-semibold">{t("questions")}</h2>
                <button
                  type="button"
                  onClick={addQuestionFromTopButton}
                  className="px-4 py-3 rounded-xl text-white w-full sm:w-auto bg-grad-1 font-semibold hover:brightness-90 transition-colors"
                >
                  {t("addQuestion")}
                </button>
              </div>

              <div className="flex-1 lg:overflow-y-auto">
                <QuestionForm
                  questions={quizData.questions}
                  onQuestionsChange={handleQuestionsChange}
                />
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:justify-between">
                <SaveDraftButton onClick={() => console.log("Draft saved", quizData)} />
                <PublishQuizButton onClick={() => setActiveStep(2)}/>
              </div>
            </div>
          </div>
           )}
          {activeStep === 2 && (
            <div className="w-full min-h-screen flex flex-col px-4 md:px-8 py-6 gap-6 bg-primary/5">
          
              {/* HEADER ACTIONS */}
             
          
              {/* QUIZ INFO */}
              <div className="flex flex-col items-center text-center mt-8 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-nav mb-2">
                  {quizData.title || t("title")}
                </h1>
                <p className="text-sm md:text-base text-grayc max-w-3xl">
                  {quizData.description || t("description")}
                </p>
              </div>
          
              {/* OVERVIEW CARDS */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="px-6 py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-blue text-white">
                 <FaClock /> {quizData.durationEnabled ? quizData.duration : t("unlimited")} {quizData.durationEnabled ? t("minutes") : ""}

                </div>
          
                <div className="px-6 py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-purple text-white">
                  <FaMedal /> {quizData.questions.reduce((sum, q) => sum + (q.points || 1), 0)} {t("points")}
                </div>
          
                <div className="px-6 py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-pink-500 text-white">
                  <FaStar /> {quizData.level || t("level")}
                </div>
          
                <div className="px-6 py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-green-500 text-white">
                  {quizData.maxAttempts || t("unlimited")} {t("maxAttempts")}
                </div>
          
                <div className="px-6 py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-yellow-500 text-white">
                  {quizData.passingScore || 0} {t("scoreMinimum")}
                </div>
                 <div className="px-6 py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-yellow-500 text-white">
                  {quizData.delais_entre_tentative || 0} {t("delais_entre_tentative")}
                </div>
              </div>
          
              {/* QUESTIONS PREVIEW */}
              <div className="flex flex-col gap-4">
                {quizData.questions.map((q, index) => (
                  <div key={index} className="rounded-xl shadow-sm p-4 bg-grad-3">
                    
                    {/* Question header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 flex items-center justify-center rounded-md text-white font-bold" style={{ background: "rgb(var(--color-primary))" }}>
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-sm md:text-base">{q.text || t("questionText")}</h3>
                    </div>
          
                    {/* Question points */}
                    <p className="text-xs md:text-sm text-grayc mb-2">{q.points || 1} {t("points")}</p>
          
                    {/* Answers */}
                    <div className="flex flex-col gap-2">
                      {q.answers.map((a, i) => (
                        <label
                          key={i}
                          className={`flex items-center gap-3 border rounded-md px-3 py-2 shadow-sm ${
                            a.isCorrect ? "bg-green-100 border-green-500" : "bg-white"
                          }`}
                        >
                          <input
                            type="radio"
                            checked={a.isCorrect}
                            readOnly
                            className="accent-blue-500"
                          />
                          <span className="text-sm md:text-base text-black/80">{a.text || t("answerOption")}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          
              {/* SUBMIT */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={handleUpdateQuiz}
                  className="px-6 py-2 rounded-xl text-white font-medium text-sm md:text-base"
                  style={{ background: "rgb(var(--color-primary))" }}
                >
                  {t("publishQuiz")}
                </button>
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 rounded-md shadow-md text-white text-sm font-medium"
                  style={{ background: "rgb(var(--color-primary))" }}
                >
                  {t("exitPreview")}
                </button>
              </div>
          
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
