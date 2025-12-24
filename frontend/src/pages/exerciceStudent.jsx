import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import TaskCard from "../components/common/TaskCard";
import "../styles/index.css";
import { useTranslation } from "react-i18next";

export default function StudentExercice() {
  const { t } = useTranslation("exerciceStudent");
  const { studentId } = useParams(); // récupère l’étudiant depuis l’URL
  const [student, setStudent] = useState(null);
  const [exercises, setExercises] = useState([]);
  const token = localStorage.getItem("token"); // JWT
  const BACKEND_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Infos de l’étudiant
        const studentRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudent(studentRes.data || {});

        // Exercices soumis de cet étudiant
        const exRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student-exercises/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // filtrer les exercices avec tentative soumise
        const exos = Array.isArray(exRes.data)
          ? exRes.data.filter(
              (ex) => ex.tentative && ex.tentative.etat === "soumis"
            )
          : [];
        setExercises(exos);
      } catch (err) {
        console.error("Erreur fetch StudentExercice:", err);
        setStudent({});
        setExercises([]);
      }
    };

    fetchData();
  }, [studentId, token]);

  if (!student) return <p>Loading...</p>;

  // destructuring avec fallback
  const {
    nom = "—",
    prenom = "—",
    adresse_email = "—",
    date_joined = null,
  } = student;

  // sécuriser les initiales
  const initials = ((prenom || "").charAt(0) + (nom || "").charAt(0)).toUpperCase();
  const joinedDate = date_joined ? new Date(date_joined).toLocaleDateString() : "";
 // Nombre total d'exercices
const totalEx = exercises.length;

// Nombre soumis
const submittedCount = exercises.filter(ex => ex.tentative?.etat === "soumis").length;

// Nombre corrigé (feedback présent)
const reviewedCount = exercises.filter(ex => ex.tentative?.output).length;

// Pourcentage soumis
const submissionRate = totalEx > 0 ? Math.round((submittedCount / totalEx) * 100) : 0;


  return (
    <div className="flex flex-col lg:flex-row bg-primary/10 min-h-screen">
      <Navbar />
      <div className="flex-1 p-4 sm:p-8 lg:ml-56">
        {/* Header étudiant */}
        <div className="mb-6 sm:mb-8 bg-white rounded-3xl shadow-md p-6 mb-6 sm:mb-8 w-full max-w-full lg:max-w-5xl mx-auto">
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
    <p className="text-xl sm:text-2xl font-bold text-pink">
      {reviewedCount}/{totalEx}
    </p>
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
          <span  role="button" className="px-12 py-1 bg-card text-gray/10 font-semibold rounded-full mb-2 sm:mb-0">
            {t("exerciceStudent.exercice")}
          </span>
          <span  role="button" className="px-12 py-1 text-gray/10 rounded-full">
            {t("exerciceStudent.Progression")}
          </span>
        </div>

        {/* Exercices */}
        <div className="flex flex-col gap-6 sm:gap-8 max-w-full sm:max-w-5xl mx-auto">
          {exercises.length === 0 && (
            <p className="text-gray-500">{t("noExercises")}</p>
          )}

          {exercises.map((ex) => {
            const tentative = ex.tentative || {};
            return (
              <TaskCard
                key={ex.id_exercice || Math.random()}
                title={ex.nom_exercice || "Exercice"}
                date={
                  tentative.submitted_at
                    ? new Date(tentative.submitted_at).toLocaleString()
                    : ""
                }
                etat={tentative.etat || t("Pending")}
                code={tentative.reponse || ""}
                feedback={ ""}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
