import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/Navbar";
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
  const [feedbacksMap, setFeedbacksMap] = useState({});
  const [evaluatedCount, setEvaluatedCount] = useState(0);
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

  const token = localStorage.getItem("token");
  const BACKEND_URL = "http://127.0.0.1:8000";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // =========================
        //  Infos étudiant
        // =========================
        const studentRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStudent(studentRes.data || {});

        // =========================
        //  Exercices + tentatives
        // =========================
        const exRes = await axios.get(
          `${BACKEND_URL}/api/dashboard/student-exercises/${studentId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const exercisesData = exRes.data.exercises || [];
        setExercises(exercisesData);
        setTotalExercises(exRes.data.total_exercises || 0);

        // =========================
        //  Stats (PAR EXERCICE)
        // =========================
        const submitted = exercisesData.filter(
          (ex) => ex.nb_soumissions > 0
        ).length;

        setSubmittedCount(submitted);

        // =========================
        //  IDs de TOUTES les tentatives
        // =========================
        const tentativeIds = exercisesData.flatMap(
          (ex) => ex.tentatives?.map((t) => t.id) || []
        );

        // =========================
        // Feedbacks
        // =========================
        if (tentativeIds.length > 0) {
          try {
            const feedbacksRes = await axios.get(
              `${BACKEND_URL}/api/feedback-exercice/list/`,
              {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                  tentative_ids: tentativeIds.join(","),
                },
              }
            );

            const feedbacksMap = {};
            feedbacksRes.data.forEach((fb) => {
              if (fb.tentative_id) {
                feedbacksMap[fb.tentative_id] = fb.contenu;
              }
            });

            setFeedbacksMap(feedbacksMap);
            setEvaluatedCount(Object.keys(feedbacksMap).length);
          } catch (fbErr) {
            console.warn(t("errors.loadFeedbacks"), fbErr.message);
          }
        }
      } catch (err) {
        console.error(t("errors.fetchStudentExercise"), err);
        setStudent({});
        setExercises([]);
        setTotalExercises(0);
        setSubmittedCount(0);
        setFeedbacksMap({});
      }
    };

    fetchData();
  }, [studentId, token]);

  if (!student) return <p>Loading...</p>;

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

  // Stats
  const submissionRate =
    totalExercises > 0
      ? Math.round((submittedCount / totalExercises) * 100)
      : 0;
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
        {/* Header étudiant */}
        <div className="mb-6 sm:mb-8 bg-white dark:bg-primary rounded-3xl shadow-md p-6 w-full max-w-full lg:max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:gap-6">
            <UserCircle initials={initials} clickable={false} className="w-14 h-14" />
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold text-text">
                {nom} {prenom}
              </h2>
              <p className="text-gray text-sm sm:text-base">{adresse_email}</p>
              {joinedDate && (
                <p className="text-gray text-xs sm:text-sm">
                   {t("exerciceStudent.joinedOn", { date: joinedDate })}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 mt-4 sm:mt-6 text-center justify-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-purple">
                {submissionRate}%
              </p>
              <p className="text-gray">{t("exerciceStudent.Submission")}</p>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-bold text-pink">
                {completedRatio}
              </p>
              <p className="text-gray">{t("exerciceStudent.Completed")}</p>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-bold text-blue">
                {evaluatedCount}
              </p>
              <p className="text-gray">{t("exerciceStudent.evaluated")}</p>
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
          {exercises.length === 0 && (
            <p className="text-gray-500">
                {t("exerciceStudent.noExercises")}
            </p>
          )}

          {exercises.map((ex) => {
            const tentatives = ex.tentatives || [];

            if (tentatives.length === 0) {
              return (
                <div className="bg-[rgb(var(--color-card))] dark:bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] rounded-3xl shadow-md p-6 border border-[rgb(var(--color-input-border))]">
                  <h3 className="text-lg font-bold text-[rgb(var(--color-text))]">{ex.nom_exercice}</h3>
                  <p className="text-[rgb(var(--color-gray))] mt-2">
                     {t("exerciceStudent.noSubmissions")}
                  </p>
                </div>

              );
            }

            return (
              <TaskCard
                key={ex.id_exercice}
                title={ex.nom_exercice}
                date={
                  tentatives[0].submitted_at
                    ? new Date(tentatives[0].submitted_at).toLocaleString()
                    : ""
                }
                etat={tentatives[0].etat || ""}
                code={tentatives[0].reponse || ""}
                feedback={tentatives[0].feedback || ""}
                exerciceId={ex.id_exercice}
                tentativeId={tentatives[0].id}
                nbSoumissions={ex.nb_soumissions}
                maxSoumissions={ex.max_soumissions}
                numeroTentative={1}
                allTentatives={tentatives} // ← Passer TOUTES les tentatives
                currentTentativeIndex={0} // ← Commencer par la première
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
