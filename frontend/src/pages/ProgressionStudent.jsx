import React, { useEffect, useState } from "react";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import WeeklySubmissionChart from "../components/common/WeeklySubmissionChart";
import GradeProgressionChart from "../components/common/GradeProgressionChart";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import axios from "axios";

export default function ProgressStudent() {
  const { t } = useTranslation("ProgressStudent");

  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [totalExercises, setTotalExercises] = useState(0);
  const [submittedExercises, setSubmittedExercises] = useState(0);

  const colorClasses = {
    green: { bar: "bg-green", text: "text-green" },
    primary: { bar: "bg-primary", text: "text-primary" },
    purple: { bar: "bg-purple", text: "text-purple" },
    pink: { bar: "bg-pink", text: "text-pink" },
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const BACKEND_URL = "http://127.0.0.1:8000";
        const res = await axios.get(`${BACKEND_URL}/api/dashboard/student/student-progress/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setStudent(data.student);
        setCourses(data.courses);
        setGradeData(data.grade_data);
        setTotalExercises(data.total_exercises);
        setSubmittedExercises(data.submitted_exercises);
      } catch (err) {
        console.error("Erreur fetching dashboard:", err);
      }
    };

    fetchDashboard();
  }, []);

  const submissionRate =
    totalExercises > 0 ? Math.round((submittedExercises / totalExercises) * 100) : 0;
 const submissionRatio = `${submittedExercises}/${totalExercises}`;


  

  return (
    <div className="flex flex-col lg:flex-row bg-primary/10 min-h-screen">
      <Navbar />

      <div className="flex-1 p-4 sm:p-8 lg:ml-56">
        {/* Profile Header */}
        {student && (
          <div className="bg-card rounded-3xl shadow-md p-6 sm:p-8 mb-6 sm:mb-8 w-full max-w-full lg:max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:gap-6">
              <UserCircle />

              <div className="mt-4 sm:mt-0 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  {student.full_name}
                </h2>
                <p className="text-gray text-sm sm:text-base">{student.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 mt-4 sm:mt-6 text-center justify-center">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                 
                </p>
                <p className="text-gray">{t("ProgressStudent.AvarageG")}</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-purple">
                  {submissionRate}%
                </p>
                <p className="text-gray">{t("ProgressStudent.Submission")}</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-pink">
                  {courses.filter(c => c.progress === 100).length}/{courses.length}
                </p>
                <p className="text-gray">{t("ProgressStudent.Completed")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cards Section */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full max-w-full lg:max-w-5xl mx-auto">
          <div className="bg-card p-8 rounded-xl shadow w-80 h-40 ">
            <p className="text-gray text-lg">{t("ProgressStudent.AvarageG")}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl sm:text-2xl font-semibold text-pink">
             __
              </p>
            </div>
            <span className="flex text-sm mt-2">
              <TrendingUp className="text-green" size={16} />
              {t("ProgressStudent.points")}
            </span>
          </div>

          <div className="flex-1 w-full">
            <div className="bg-card rounded-2xl shadow p-6">
              <h2 className="font-semibold text-lg mb-4">
                {t("ProgressStudent.mycourses")} ({courses.length})
              </h2>

              {courses.map((course, idx) => (
                <div key={idx} className="p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-lg text-gray mr-3">{course.title}</p>
                    </div>
                    <div className="w-full h-2 bg-gray/20 rounded-full m-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClasses[course.color]?.bar}`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span
                      className={`text-sm font-semibold ${colorClasses[course.color]?.text}`}
                    >
                      {course.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly submission chart */}
        <div className="mt-6">
          <WeeklySubmissionChart totalExercises={totalExercises} submitted={submittedExercises} />
        </div>

        {/* Grade Progression Chart */}
        <div className="mt-4">
          <GradeProgressionChart title={t("ProgressStudent.grade")} />
        </div>
      </div>
    </div>
  );
}
