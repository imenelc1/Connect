import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/NavBar"; // Navbar responsive
import QuizSettings from "../components/common/QuizSettings";
import QuizSummary from "../components/common/QuizSummary";
import QuestionForm from "../components/common/QuestionForm";
import SaveDraftButton from "../components/common/SaveDraftButton";
import PublishQuizButton from "../components/common/PublishQuizButton";
import Logo from "../components/common/LogoComponent";
import { useTranslation } from "react-i18next";
import { Globe, FileText, Activity } from "lucide-react";
import ThemeContext from "../context/ThemeContext";
import ThemeButton from "../components/common/ThemeButton";
import { getCurrentUserId } from "../hooks/useAuth";
import api from "../services/courseService"; // Make sure your API helper is here
import UserCircle from "../components/common/UserCircle";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";
import Topbar from "../components/common/TopBar";
import { FaClock, FaMedal, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";



export default function CreateQuiz() {
  const userData = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();
  const { t, i18n } = useTranslation("createQuiz");
  const [activeStep, setActiveStep] = useState(1);
  const { toggleDarkMode } = useContext(ThemeContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""
    }`.toUpperCase();

  const exerciseSteps = [
    { label: t("info"), icon: FileText },
    { label: t("preview"), icon: Activity },
  ];
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    level: "",
    courseId: "",
    visibility: "public",

    maxAttempts: 0,
    durationEnabled: false,
    duration: 0,
    delais_entre_tentative: 0,

    passingScore: 0,

    questions: [
      {
        text: "",
        answers: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false }
        ],
        points: 1
      }
    ]
  });

  const currentUserId = getCurrentUserId();

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/courses/api/cours")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((c) => ({
          id: c.id_cours,
          title: c.titre_cour,

          isMine: c.utilisateur === currentUserId, //NEWDED GHR ISMINE //
        }));
        setCourses(formatted);
      })
      .catch((err) => console.error("Erreur chargement cours :", err));
  }, []);
  const myCourses = courses.filter((c) => c.isMine);



  const handleQuizChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleQuestionsChange = (questions) => {
    setQuizData((prev) => ({ ...prev, questions }));
  };

  const addQuestionFromTopButton = () => {
    const newQuestion = {
      text: "",
      answers: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ],
      points: 1
    };
    setQuizData((prev) => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const handleSaveDraft = () => {
    console.log(t("saveDraft") + ":", quizData);
  };




  const totalPoints = quizData.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const totalQuestions = quizData.questions.length;


  /*save exercice comme step 1*/
  const handleSaveStep1 = async () => {
    const token = localStorage.getItem("token");
    const currentUserId = getCurrentUserId();
    

    if (!token || !currentUserId) {
      toast.error("Utilisateur non connecté");

      return null;
    }

    // Vérification minimale
    if (
      !quizData.title ||
      !quizData.description ||
      !quizData.level ||
      !quizData.courseId
    ) {
      toast.warning("Veuillez remplir tous les champs obligatoires");

      return null;
    }

    try {
      const response = await api.post(
        "/exercices/create/",
        {
          titre_exo: quizData.title,
          enonce: quizData.description,
          niveau_exo: quizData.level,
          categorie: "quiz",
          utilisateur: currentUserId,
          cours: quizData.courseId,
          visibilite_exo: quizData.visibility !== "private",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const exerciceId = response.data.id_exercice;

      console.log("✅ Exercice créé :", exerciceId);

      return exerciceId; // IMPORTANT pour step 2

    } catch (error) {
      console.error(
        "❌ Erreur création exercice :",
        error.response?.data || error.message
      );
      toast.error("Erreur lors de la sauvegarde de l'exercice");
      return null;
    }
  };
  /*step 2 creation quiz a partir de exo */
  const handleSaveStep2 = async (exerciceIdParam) => {
    const token = localStorage.getItem("token");
    const idToUse = exerciceIdParam || exerciceId; // fallback si param non fourni

    /*if (!token || !idToUse) {
      alert("Exercice non trouvé. Veuillez créer l'exercice d'abord.");
      return null;
    }
  */
    try {
      const response = await api.post(
        "/quiz/",
        {
          exercice: idToUse,                // 🔑 lien 1–1
          scoreMinimum: quizData.passingScore,
          nbMax_tentative: quizData.maxAttempts || 0,
          activerDuration: quizData.durationEnabled,
          delai_entre_tentatives: quizData.delais_entre_tentative || 0,
          duration: quizData.durationEnabled
            ? `00:${quizData.duration}:00`
            : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const quizId = response.data.id;
      console.log("✅ Quiz créé :", quizId);
      return quizId;

    } catch (error) {
      console.error(
        "❌ Erreur création quiz :",
        error.response?.data || error.message
      );
      toast.error("Erreur lors de la création du quiz");
      return null;
    }
  };
  
  /* step 3 les questions et option*/
  const handleSaveStep3 = async (idQuiz) => {
    const token = localStorage.getItem("token");
    /*if (!token || !exerciceId) {
      alert("Exercice non trouvé. Veuillez créer l'exercice et le quiz d'abord.");
      return null;
    }*/

    try {
      for (const question of quizData.questions) {
        // 1️⃣ Créer la question
        const questionRes = await api.post(
          "/quiz/Question/",
          {
            texte_qst: question.text,        // texte de la question
            reponse_correcte: question.answers.find(a => a.isCorrect)?.text || "",
            score: question.points || 1,
            exercice: idQuiz,            // FK vers Exercice
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const questionId = questionRes.data.id_qst;

        // 2️⃣ Créer les options
        for (const answer of question.answers) {
          await api.post(
            "/quiz/Option/",
            {
              texte_option: answer.text,
              question: questionId,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      console.log("✅ Toutes les questions et options créées !");
      toast.success("Quiz complet créé avec succès !");
      return true;

    } catch (error) {
      console.error("❌ Erreur création questions/options :", error.response?.data || error.message);
      toast.error("Erreur lors de la création des questions");
      return false;
    }
  };


  /* tester save quiz */
  const handlePublishQuiz = async () => {
    // Step 1 : créer l'exercice
    const exoId = await handleSaveStep1();
    if (!exoId) return;

    // Step 2 : créer le quiz
    const quizId = await handleSaveStep2(exoId);
    // if (!quizId) return;

    // Step 3 : créer les questions et options
    await handleSaveStep3(exoId);

    // Rediriger vers liste des quiz ou page de confirmation
    navigate("/all-quizzes");
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);



  return (
    <div className="w-full flex flex-row min-h-screen gap-16 md:gap-1  bg-surface">


      {/* NAVBAR RESPONSIVE */}
      <div>
        <Navbar />
      </div>



      {/* MAIN CONTENT */}
      <div
        className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `} >

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3 sm:gap-4">
          {/* User + Bell */}
          <div className="flex items-center gap-3 order-1 sm:order-2 mt-0 sm:mt-0 self-end sm:self-auto">
            <NotificationBell />
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => i18n.changeLanguage(lang)}
              size={isMobile ? "sm" : "md"}
            />

          </div>


        </header>
        <div className="max-w-7xl mx-auto">



          <Topbar
            steps={exerciseSteps}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            className="flex justify-between"
          />

          {/* MAIN GRID */}
          {activeStep === 1 && (
            <div
              className="rounded-2xl shadow-lg p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-grad-2
               max-w-7xl mx-auto mt-10"
            >
              {/* LEFT COLUMN (SETTINGS + SUMMARY) */}
              <div className="flex flex-col gap-4 lg:col-span-1 lg:sticky lg:top-10 lg:self-start">
                <QuizSettings
                  quizData={quizData}
                  onQuizChange={handleQuizChange}
                  courses={courses}
                />
                <QuizSummary
                  totalQuestions={totalQuestions}
                  totalPoints={totalPoints}
                  duration={quizData.duration}
                  passingScore={quizData.passingScore}
                  maxAttempts={quizData.maxAttempts}
                />
              </div>

              {/* RIGHT COLUMN (QUESTIONS) */}
              <div className="flex flex-col gap-4 lg:col-span-2 flex-1 px-0 md:px-4">

                {/* HEADER QUESTIONS */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg md:text-2xl font-semibold">{t("questions")}</h2>
                  <button
                    type="button"
                    onClick={addQuestionFromTopButton}
                    className="px-6 py-3 rounded-xl text-white w-full sm:w-auto bg-grad-1 font-semibold hover:brightness-90 transition-colors"
                  >
                    {t("addQuestion")}
                  </button>
                </div>

                {/* QUESTIONS LIST */}
                <div className="flex-1 overflow-auto max-h-[70vh]">
                  <QuestionForm
                    questions={quizData.questions}
                    onQuestionsChange={handleQuestionsChange}
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:justify-between">
                  <PublishQuizButton onClick={() => setActiveStep(2)} />
                </div>

              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="w-full min-h-screen rounded-2xl shadow-lg flex flex-col px-4 md:px-8 py-6 gap-6 bg-grad-2  max-w-7xl mx-auto mt-10">

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
              <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-3 md:gap-4 mb-6">
                <div className="px-3 py-1.5 md:px-6 md:py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-blue text-white text-xs md:text-sm">
                  <FaClock className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{quizData.durationEnabled ? quizData.duration : "-"} {t("minutes")}</span>
                </div>

                <div className="px-3 py-1.5 md:px-6 md:py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-purple text-white text-xs md:text-sm">
                  <FaMedal className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{quizData.questions.reduce((sum, q) => sum + (q.points || 1), 0)} {t("points")}</span>
                </div>

                <div className="px-3 py-1.5 md:px-6 md:py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-pink text-white text-xs md:text-sm">
                  <FaStar className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{quizData.level || t("level")}</span>
                </div>

                <div className="px-3 py-1.5 md:px-6 md:py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-green text-white text-xs md:text-sm">
                  <span>{quizData.maxAttempts || t("unlimited")} {t("maxAttempts")}</span>
                </div>

                <div className="px-3 py-1.5 md:px-6 md:py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-yellow-500 text-white text-xs md:text-sm">
                  <span>{quizData.passingScore || 0} {t("scoreMinimum")}</span>
                </div>

                <div className="px-3 py-1.5 md:px-6 md:py-2 rounded-md shadow-sm flex items-center gap-2 justify-center bg-yellow-500 text-white text-xs md:text-sm">
                  <span>{quizData.delais_entre_tentative || 0} {t("delais_entre_tentative")}</span>
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
                          className={`flex items-center gap-3 border rounded-md px-3 py-2 shadow-sm ${a.isCorrect ? "bg-green-100 border-green-500" : "bg-white"
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
                  onClick={handlePublishQuiz}
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
