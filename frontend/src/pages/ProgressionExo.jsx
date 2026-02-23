import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import UserCircle from "../components/common/UserCircle";
import TaskCard from "../components/common/TaskCard";
import WeeklySubmissionChart from "../components/common/WeeklySubmissionChart";
import GradeProgressionChart from "../components/common/GradeProgressionChart";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { CircleCheck, TrendingUp } from "lucide-react";

export default function ProgressExercice() {
  const { t } = useTranslation("ProgressExercice");
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [courses, setCourses] = useState([]);
  const [averageScore, setAverageScore] = useState(null);
  const [progressScoreData, setProgressScoreData] = useState([]);

  const [totalExercises, setTotalExercises] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const token = localStorage.getItem("token");
  // / États de l'interface
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Gestion de la responsivité
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
  const BACKEND_URL = "https://connect-1-t976.onrender.com";

  const colorClasses = {
    green: { bar: "bg-green", text: "text-green" },
    primary: { bar: "bg-primary", text: "text-primary" },
    purple: { bar: "bg-purple", text: "text-purple" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Info étudiant
        const studentRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudent(studentRes.data || {});

        // Exercices et tentatives
        const exRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student-exercises/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const exercisesWithSubmitted = (exRes.data.exercises || []).map((ex) => {
          const submittedTentative = ex.tentatives?.find(t => t.etat === "soumis");
          return {
            ...ex,
            submittedTentative,
          };
        });

        setExercises(exercisesWithSubmitted);
        setTotalExercises(exRes.data.total_exercises || exercisesWithSubmitted.length);
        setSubmittedCount(exercisesWithSubmitted.filter(ex => ex.submittedTentative).length);

        // Cours actifs
        const coursesRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student/active-courses/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourses(coursesRes.data.courses || []);

      } catch (err) {
         console.error(t("errors.fetchData"), err);
        setStudent({});
        setExercises([]);
        setCourses([]);
        setTotalExercises(0);
        setSubmittedCount(0);
        setAverageScore(null);
        setProgressScoreData([]);
      }
    };

    fetchData();
  }, [studentId, token]);

  useEffect(() => {
    const fetchProfStats = async () => {
      try {
        // Moyenne des scores
        const avgRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student/student-average-score-prof/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAverageScore(avgRes.data.average_score);

        // Progression des scores
        const progressRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student/student-progress-score-prof/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProgressScoreData(progressRes.data);
      } catch (err) {
        console.error(t("errors.fetchStats"), err);
        setAverageScore(null);
        setProgressScoreData([]);
      }
    };

    fetchProfStats();
  }, [studentId, token]);

if (!student) return <p>{t("errors.studentNotFound")}</p>;

  const { nom = "—", prenom = "—", adresse_email = "—", date_joined = null } = student;
  const initials = ((prenom || "").charAt(0) + (nom || "").charAt(0)).toUpperCase();
  const joinedDate = date_joined ? new Date(date_joined).toLocaleDateString() : "";

  // Stats calculées
  const submissionRate = totalExercises > 0 ? Math.round((submittedCount / totalExercises) * 100) : 0;
  const completedRatio = `${submittedCount}/${totalExercises}`;



  return (
      <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
                                       {/* Sidebar */}
                                       <div>
                                         <Navbar />
                                       </div>
          <div className={`
                flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
                ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
              `}>
        {/* Profile Header */}
        <div className="bg-white dark:bg-primary rounded-3xl shadow-md p-6 sm:p-8 mb-6 sm:mb-8 w-full max-w-full lg:max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:gap-6">
            <UserCircle initials={initials} clickable={false}  className="w-14 h-14" />
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold text-black">
                {nom} {prenom}
              </h2>
              <p className="text-gray text-sm sm:text-base">{adresse_email}</p>
              {joinedDate && (
                <p className="text-gray text-xs sm:text-sm">
                  {t("ProgressExercice.joined")} {joinedDate}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 mt-4 sm:mt-6 text-center justify-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-pink">
                {averageScore !== null ? averageScore : "—"}
              </p>
              <p className="text-gray">{t("ProgressExercice.AvarageG")}</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-purple">{submissionRate}%</p>
              <p className="text-gray">{t("ProgressExercice.Submission")}</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-blue">{completedRatio}</p>
              <p className="text-gray">{t("ProgressExercice.completedexo")}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-full sm:max-w-5xl py-2 px-4 sm:px-6 bg-gradient-to-r from-primary/30 to-purple rounded-full mb-6 sm:mb-8">
          <span
            role="button"
            className="px-12 py-1 text-gray/10 font-semibold rounded-full mb-2 sm:mb-0"
            onClick={() => navigate(`/student-exercises/${studentId}`)}
          >
            {t("ProgressExercice.exercice")}
          </span>
          <span
            role="button"
            className="px-12 py-1 text-gray/10 rounded-full bg-card font-semibold mb-2 sm:mb-0"
          >
            {t("ProgressExercice.Progression")}
          </span>
        </div>

        {/* Exercises & Courses */}
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-full lg:max-w-5xl mx-auto">
          {/* Left card: Exercices */}
          <div className="bg-card rounded-2xl shadow p-6 flex-1 w-full">
            <h2 className="font-semibold text-lg mb-4">{t("ProgressExercice.completedexo")}</h2>
            <div className="space-y-4">
              {exercises.length === 0 && (
                <p className="text-gray-500 text-center">{t("noExercises")}</p>
              )}
              {exercises.map((ex) => {
                const tentative = ex.submittedTentative;
                return (
                  <div
                    key={ex.id_exercice}
                    className="flex items-center justify-between bg-card p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{ex.nom_exercice}</span>
                      <span className="text-xs text-gray-400 mt-1">
                        {tentative?.submitted_at
                          ? new Date(tentative.submitted_at).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    {tentative?.etat === "soumis" && (
                      <CircleCheck className="text-purple w-5 h-5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right card: Courses & Charts */}
          <div className="flex-1 w-full space-y-6">
            <div className="bg-card rounded-2xl shadow p-6">
              <h2 className="font-semibold text-lg mb-4">{t("ProgressExercice.courses")}</h2>
              <div className="space-y-6">
                {courses.map((course, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-grad-7 p-4 rounded-xl border border-gray/20 shadow-sm hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-semibold text-gray-900 text-lg">{course.title}</p>
                      <span className={`text-sm font-semibold ${colorClasses[course.color]?.text}`}>
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClasses[course.color]?.bar} transition-all duration-500`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <WeeklySubmissionChart studentId={studentId} />
          </div>
        </div>

        {/* Grade Progression */}
        <div className="mt-6">
          <GradeProgressionChart data={progressScoreData} title={t("ProgressExercice.grade")} />
        </div>
      </div>
    </div>
  );
}