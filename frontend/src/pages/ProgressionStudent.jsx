import React, { useEffect, useState } from "react";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import WeeklySubmissionChart from "../components/common/WeeklySubmissionChart";
import GradeProgressionChart from "../components/common/GradeProgressionChart";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import { getTentatives } from "../services/progressionService";
import axios from "axios";
import { CheckCircle } from "lucide-react";

export default function ProgressStudent() {
  const { t } = useTranslation("ProgressStudent");

  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [totalExercises, setTotalExercises] = useState(0);
  const [submittedExercises, setSubmittedExercises] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [quizProgressData, setQuizProgressData] = useState([]);
  const [submittedExercisesList, setSubmittedExercisesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const colorClasses = {
    green: { bar: "bg-green", text: "text-green" },
    primary: { bar: "bg-primary", text: "text-primary" },
    purple: { bar: "bg-purple", text: "text-purple" },
    pink: { bar: "bg-pink", text: "text-pink" },
  };

  // ------------------ FETCH DASHBOARD ------------------
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const BACKEND_URL = "http://127.0.0.1:8000";

        const res = await axios.get(`${BACKEND_URL}/api/dashboard/student/student-progress/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setStudent(data.student || {});
        setCourses(data.courses || []);
        setGradeData(data.grade_data || []);
        setTotalExercises(data.total_exercises || 0);
        setSubmittedExercises(data.submitted_exercises || 0);
      } catch (err) {
        console.error("Erreur fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ------------------ FETCH QUIZ PROGRESS ------------------
  useEffect(() => {
    const fetchQuizProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://127.0.0.1:8000/api/dashboard/student/student-progress-score/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setQuizProgressData(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuizProgress();
  }, []);

  // ------------------ FETCH AVERAGE SCORE ------------------
  useEffect(() => {
    const fetchAverageScore = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/student/student-average-score/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAverageScore(res.data?.average_score ?? 0);
      } catch (err) {
        console.error("Erreur fetching average score:", err);
      }
    };

    fetchAverageScore();
  }, []);

  // ------------------ FETCH SUBMITTED EXERCISES ------------------
 useEffect(() => {
  const fetchSubmittedExercises = async () => {
    try {
      const data = await getTentatives();
      if (!data) return;

      const latestByExercise = {};

      data.forEach((t) => {
        if (t.etat !== "soumis" || !t.exercice) return;

        const exId = t.exercice.id_exercice;

        if (
          !latestByExercise[exId] ||
          new Date(t.submitted_at) > new Date(latestByExercise[exId].submitted_at)
        ) {
          latestByExercise[exId] = {
            id: t.id,
            title: t.exercice.titre_exo || "Untitled",
            submitted_at: t.submitted_at,
            feedback: t.feedback || "",
          };
        }
      });

      setSubmittedExercisesList(Object.values(latestByExercise));
    } catch (err) {
      console.error("Erreur récupération tentatives :", err);
    }
  };

  fetchSubmittedExercises();
}, []);


  const submissionRate =
    totalExercises > 0 ? Math.round((submittedExercises / totalExercises) * 100) : 0;
  const initials = `${student?.full_name?.split(" ").map(n => n[0]).join("") || ""}`.toUpperCase();

  return (
    <div className="flex flex-col lg:flex-row bg-primary/10 min-h-screen">
      <Navbar />

      <div className="flex-1 p-4 sm:p-8 lg:ml-56">
        {/* Profile Header */}
        {student && (
          <div className="bg-card rounded-3xl shadow-md p-6 sm:p-8 mb-6 sm:mb-8 w-full max-w-full lg:max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:gap-6">
              <UserCircle initials={initials} />
              <div className="mt-4 sm:mt-0 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-semibold">{student.full_name}</h2>
                <p className="text-gray text-sm sm:text-base">{student.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 mt-4 sm:mt-6 text-center justify-center">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-primary">{averageScore}%</p>
                <p className="text-gray">{t("ProgressStudent.AvarageG")}</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-purple">{submissionRate}%</p>
                <p className="text-gray">{t("ProgressStudent.Submission")}</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-pink">
                  {courses?.filter((c) => c.progress === 100)?.length ?? 0}/{courses?.length ?? 0}
                </p>
                <p className="text-gray">{t("ProgressStudent.Completed")}</p>
              </div>
            </div>
          </div>
        )}


      <div className="flex flex-col lg:flex-row gap-6">
{/* Submitted Exercises Card */}
<div className="bg-card p-6 rounded-2xl shadow w-full lg:w-80 mb-6">
  <h2 className="font-semibold text-lg mb-4">{t("SubmittedExercises")}</h2>

  {submittedExercisesList?.length > 0 ? (
    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
      {submittedExercisesList.map((ex) => (
        <div
          key={ex.id}
          className="flex justify-between items-center p-3 rounded-lg shadow-sm bg-gray/10 hover:bg-gray/20 transition"
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-pink" />
            <p className="font-medium text-gray">{ex.title}</p>
          </div>

          <div className="flex flex-col items-end text-right text-sm text-gray">
            <span>
              {new Date(ex.submitted_at).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {ex.feedback && (
              <span className="text-xs text-primary mt-1">{ex.feedback}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray text-sm">No exercises submitted yet</p>
  )}
</div>


        {/* Courses List */}
        <div className="flex-1 w-full">
          <div className="bg-card rounded-2xl shadow p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">
              {t("ProgressStudent.mycourses")} ({courses?.length ?? 0})
            </h2>

            {courses?.map((course, idx) => (
              <div key={idx} className="p-4 rounded-xl shadow-sm mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-lg text-gray mr-3">{course.title}</p>
                  </div>
                  <div className="w-full h-2 bg-gray/20 rounded-full m-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClasses[course.color]?.bar}`}
                      style={{ width: `${course.progress ?? 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold ${colorClasses[course.color]?.text}`}>
                    {course.progress ?? 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


        {/* Charts */}
        <div className="mt-6">
          <WeeklySubmissionChart totalExercises={totalExercises} submitted={submittedExercises} />
        </div>
        <div className="mt-4">
          <GradeProgressionChart data={quizProgressData || []} title="Quiz Average Score" />
        </div>
      </div>
    </div>
  );
}
