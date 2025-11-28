import React, { useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar"; // Navbar responsive
import QuizSettings from "../components/common/QuizSettings";
import QuizSummary from "../components/common/QuizSummary";
import QuestionForm from "../components/common/QuestionForm";
import SaveDraftButton from "../components/common/SaveDraftButton";
import PublishQuizButton from "../components/common/PublishQuizButton";
import Logo from "../components/common/LogoComponent";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import ThemeContext from "../context/ThemeContext";
import ThemeButton from "../components/common/ThemeButton";


export default function CreateQuiz() {
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    duration: 30,
    passingScore: 70,
    level: "",
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

  const navigate = useNavigate();
  const { t,i18n } = useTranslation("createQuiz");

  const handleQuizChange = (field, value) => {
    setQuizData((prev) => ({ ...prev, [field]: value }));
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

  const handlePreviewQuiz = () => {
    navigate("/preview", { state: { quizData } });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

    const { toggleDarkMode } = useContext(ThemeContext);

  const totalPoints = quizData.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const totalQuestions = quizData.questions.length;

  return (
    <div className="flex min-h-screen">
    

      {/* NAVBAR RESPONSIVE */}
      <Navbar/>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 lg:ml-40 mt-16 lg:mt-0 bg-background ml-20">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h1 className="text-xl md:text-2xl md:ml-20 font-bold text-nav" >
              {t("newQuiz")}
            </h1>
           
         {/* SWITCH LANGUE */}
        <div
            onClick={toggleLanguage}
            className=""
          >
            <Globe size={16} />
        </div>
         
             <ThemeButton onClick={toggleDarkMode} />
          </div>

          {/* MAIN GRID */}
          <div
            className="rounded-2xl shadow-lg p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:ml-20 bg-grad-2"
          >
            {/* LEFT COLUMN (SETTINGS + SUMMARY) */}
            <div className="flex flex-col gap-4 lg:col-span-1 lg:sticky lg:top-10 lg:self-start lg:ml-4">
              <QuizSettings quizData={quizData} onQuizChange={handleQuizChange} />
              <QuizSummary
                totalQuestions={totalQuestions}
                totalPoints={totalPoints}
                duration={quizData.duration}
                passingScore={quizData.passingScore}
              />
            </div>

            {/* RIGHT COLUMN (QUESTIONS) */}
            <div className="flex flex-col gap-4 lg:col-span-2 flex-1 px-2">

              {/* HEADER QUESTIONS */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg md:text-xl font-semibold"> {t("questions")} </h2>
                <button
                  type="button"
                  onClick={addQuestionFromTopButton}
                  className="px-4 py-3 rounded-xl text-white w-full sm:w-auto bg-grad-1 font-semibold hover:brightness-90 transition-colors"
                >
                  {t("addQuestion")}
                </button>
              </div>

              {/* QUESTIONS LIST */}
              <div className="flex-1 lg:overflow-y-auto">
                <QuestionForm
                  questions={quizData.questions}
                  onQuestionsChange={handleQuestionsChange}
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:justify-between">
                <SaveDraftButton onClick={handleSaveDraft} />
                <PublishQuizButton onClick={handlePreviewQuiz} />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
