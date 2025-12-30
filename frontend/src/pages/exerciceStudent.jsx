import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import TaskCard from "../components/common/TaskCard";
import "../styles/index.css";
import { useTranslation } from "react-i18next";

export default function StudentExercice() {
  const { t } = useTranslation("exerciceStudent");
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [totalExercises, setTotalExercises] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);

  const token = localStorage.getItem("token");
  const BACKEND_URL = "http://127.0.0.1:8000";
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState({}); // ← bien défini ici

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Info étudiant
        const studentRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudent(studentRes.data || {});

        // Exercices + tentatives
        const exRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student-exercises/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // exRes.data.exercises contient maintenant toutes les tentatives
        const exercisesData = exRes.data.exercises || [];
        setExercises(exercisesData);
        setTotalExercises(exRes.data.total_exercises || 0);

        // Calcul du nombre soumis
        let submitted = 0;
        exercisesData.forEach((ex) => {
          if (ex.tentatives?.some((t) => t.etat === "soumis")) submitted += 1;
        });
        setSubmittedCount(submitted);

      } catch (err) {
        console.error("Erreur fetch StudentExercice:", err);
        setStudent({});
        setExercises([]);
        setTotalExercises(0);
        setSubmittedCount(0);
      }
    };

    fetchData();
  }, [studentId, token]);

  if (!student) return <p>Loading...</p>;

  const { nom = "—", prenom = "—", adresse_email = "—", date_joined = null } = student;
  const initials = ((prenom || "").charAt(0) + (nom || "").charAt(0)).toUpperCase();
  const joinedDate = date_joined ? new Date(date_joined).toLocaleDateString() : "";

  // Stats
  const submissionRate = totalExercises > 0
    ? Math.round((submittedCount / totalExercises) * 100)
    : 0;
  const completedRatio = `${submittedCount}/${totalExercises}`;

  return (
    <div className="flex flex-col lg:flex-row bg-primary/10 min-h-screen">
      <Navbar />
      <div className="flex-1 p-4 sm:p-8 lg:ml-56">
        {/* Header étudiant */}
        <div className="mb-6 sm:mb-8 bg-white rounded-3xl shadow-md p-6 w-full max-w-full lg:max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:gap-6">
            <UserCircle initials={initials} className="w-14 h-14" />
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold text-black">
                {nom} {prenom}
              </h2>
              <p className="text-gray text-sm sm:text-base">{adresse_email}</p>
              {joinedDate && (
                <p className="text-gray text-xs sm:text-sm">Joined on {joinedDate}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 mt-4 sm:mt-6 text-center justify-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-purple">{submissionRate}%</p>
              <p className="text-gray">{t("exerciceStudent.Submission")}</p>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-bold text-pink">{completedRatio}</p>
              <p className="text-gray">{t("exerciceStudent.Completed")}</p>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-bold text-primary">00</p>
              <p className="text-gray">évalués</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-full sm:max-w-5xl py-2 px-4 sm:px-6 bg-gradient-to-r from-primary/30 to-purple rounded-full mb-6 sm:mb-8">
          <span className="px-12 py-1 bg-card text-gray/10 font-semibold rounded-full mb-2 sm:mb-0">
            {t("exerciceStudent.exercice")}
          </span>

          <span
            role="button"
            className="px-12 py-1 text-gray/10 rounded-full"
            onClick={() => navigate(`/students/${studentId}/progression`)}
          >
            {t("exerciceStudent.Progression")}
          </span>
        </div>

        {/* Exercices + toutes les tentatives */}
        <div className="flex flex-col gap-6 sm:gap-8 max-w-full sm:max-w-5xl mx-auto">
          {exercises.length === 0 && <p className="text-gray-500">{t("noExercises")}</p>}

          {exercises.map((ex) => {
            const tentative = ex.tentatives?.[0] || {};
            const feedback = feedbacks[tentative.id] || "";

            return (
              <TaskCard
                key={ex.id_exercice}
                title={ex.nom_exercice}
                date={tentative.submitted_at ? new Date(tentative.submitted_at).toLocaleString() : ""}
                etat={tentative.etat || ""}
                code={tentative.reponse || ""}
                feedback={feedback}
                exerciceId={ex.id_exercice}
                tentativeId={tentative.id}
              />
            );
          })}


        </div>
      </div>
    </div>
  );
}
