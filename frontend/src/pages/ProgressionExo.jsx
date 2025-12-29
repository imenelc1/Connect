import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import TaskCard from "../components/common/TaskCard";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { CircleCheck, TrendingUp, Clock } from "lucide-react";
import WeeklySubmissionChart from "../components/common/WeeklySubmissionChart";
import GradeProgressionChart from "../components/common/GradeProgressionChart";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProgressExercice() {
  const { t } = useTranslation("ProgressExercice");
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [totalExercises, setTotalExercises] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [courses, setCourses] = useState([]);
  const [averageScore, setAverageScore] = useState(null);
  const [progressScoreData, setProgressScoreData] = useState([]);

  // Stats dynamiques

  const submissionRate =
    totalExercises > 0
      ? Math.round((submittedCount / totalExercises) * 100)
      : 0;
  const completedRatio = `${submittedCount}/${totalExercises}`;
 
  const token = localStorage.getItem("token");
  const BACKEND_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student/${studentId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStudent(studentRes.data || {});

        const exRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student-exercises/${studentId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const submittedEx = (exRes.data.exercises || []).filter(
          (ex) => ex.tentative && ex.tentative.etat === "soumis"
        );

        const res = await axios.get(
          `${BACKEND_URL}/api/dashboard/student/active-courses/${studentId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourses(res.data.courses || []);
        setExercises(submittedEx);
        setTotalExercises(exRes.data.total_exercises || submittedEx.length);
        setSubmittedCount(exRes.data.submitted_count || submittedEx.length);
      } catch (err) {
        console.error(err);
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
        console.error("Erreur récupération stats prof :", err);
        setAverageScore(null);
        setProgressScoreData([]);
      }
    };

    fetchProfStats();
  }, [studentId, token]);

  if (!student) return <p>Erreur : étudiant introuvable</p>;

  const {
    nom = "—",
    prenom = "—",
    adresse_email = "—",
    date_joined = null,
  } = student;

  const initials = (
    (prenom || "").charAt(0) + (nom || "").charAt(0)
  ).toUpperCase();
  const joinedDate = date_joined
    ? new Date(date_joined).toLocaleDateString()
    : "";
  const colorClasses = {
    green: { bar: "bg-green", text: "text-green" },
    primary: { bar: "bg-primary", text: "text-primary" },
    purple: { bar: "bg-purple", text: "text-purple" },
  };

  
  
  return (
    <div className="flex flex-col lg:flex-row bg-primary/10 min-h-screen">
      <Navbar />

      <div className="flex-1 p-4 sm:p-8 lg:ml-56">
        {/* Profile Header */}
        <div className="bg-card rounded-3xl shadow-md p-6 sm:p-8 mb-6 sm:mb-8 w-full max-w-full lg:max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:gap-6">
            <UserCircle initials={initials} className="w-14 h-14" />

            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold text-black">
                {student.nom} {student.prenom}
              </h2>
              <p className="text-gray text-sm sm:text-base">
                {student.adresse_email}
              </p>
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
              <p className="text-xl sm:text-2xl font-bold text-purple">
                {submissionRate}%
              </p>
              <p className="text-gray">{t("ProgressExercice.Submission")}</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-pink">
                {completedRatio}
              </p>
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

        <div className="w-full px-10">
          <div className="flex justify-center gap-24 mt-8">
            <div className="bg-card p-4 rounded-xl shadow w-60 h-24 flex flex-col justify-center">
              <p className="text-gray text-sm">
                {" "}
                {t("ProgressExercice.AvarageG")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl sm:text-2xl font-bold text-pink">__</p>
                <TrendingUp className="text-pink" />
              </div>
            </div>

            <div className="bg-card p-4 rounded-xl shadow w-60 h-24 flex flex-col justify-center">
              <p className="text-gray text-sm">
                {" "}
                {t("ProgressExercice.Completed")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl sm:text-2xl font-bold text-purple">
                  {courses.length}
                </p>
                <CircleCheck className="text-purple" />
              </div>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full max-w-full lg:max-w-5xl mx-auto">
          {/* Left card */}
          <div className="bg-card rounded-2xl shadow p-6 flex-1 w-full">
            <h2 className="font-semibold text-lg mb-4">
              {t("ProgressExercice.completedexo")}
            </h2>

            <div className="space-y-4">
              {exercises.length === 0 && (
                <p className="text-gray-500 text-center">{t("noExercises")}</p>
              )}

              {exercises.map((ex) => {
                const tentative = ex.tentative;
                return (
                  <div
                    key={ex.id_exercice}
                    className="flex items-center justify-between bg-card p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">
                        {ex.nom_exercice}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {tentative.submitted_at
                          ? new Date(tentative.submitted_at).toLocaleString()
                          : ""}
                      </span>
                    </div>

                    {tentative.etat === "soumis" && (
                      <CircleCheck className="text-purple w-5 h-5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right card */}
          <div className="  flex-1 w-full ">
            <div className="bg-card rounded-2xl  shadow p-6">
              <h2 className=" font-semibold text-lg mb-4">
                {t("ProgressExercice.courses")}
              </h2>
              <div className="space-y-6">
                {courses.map((course, idx) => (
                  <div
                    key={idx}
                    className="bg-card p-4 rounded-xl border border-gray/20 shadow-sm hover:shadow-lg transition-shadow duration-200"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {course.title}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          colorClasses[course.color].text
                        }`}
                      >
                        {course.progress}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-3 bg-gray/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          colorClasses[course.color].bar
                        } transition-all duration-500`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly submission chart */}
            <div className="mt-6 ">
              <WeeklySubmissionChart studentId={studentId} />
            </div>
          </div>
        </div>

     <div className="mt-4">
  <GradeProgressionChart
    data={progressScoreData}
    title={t("ProgressExercice.grade")}
  />
</div>

        <div className="mt-6 bg-card p-6 rounded-lg">
          <h2 className="font-semibold text-lg mb-3">
            {" "}
            {t("ProgressExercice.performance")}
          </h2>

          <div className="bg-gradient-to-r from-primary/20 to-purple/40 p-4 rounded-xl border border-purple flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-grad-all">
              <TrendingUp className="text-white" size={20} />
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-gray">
                {" "}
                {t("ProgressExercice.positive")}
              </span>
              <p className="text-sm text-primary">
                {" "}
                {t("ProgressExercice.positivep1")} 2.8{" "}
                {t("ProgressExercice.positivep2")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
