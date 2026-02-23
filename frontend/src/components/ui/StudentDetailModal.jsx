import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../common/Button";
import UserCircle from "../common/UserCircle";

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray">{label}</span>
      <span className={`font-medium ${highlight ? "text-green font-semibold" : "text-muted"}`}>
        {value || "-"}
      </span>
    </div>
  );
}

export default function StudentDetailModal({ open, onClose, studentId, joined }) {
  const { t } = useTranslation("StudentsManagement");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !studentId) return;

    const fetchStudentDetail = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return setError(t("errors.required"));

      setLoading(true);
      try {
        const res = await fetch(
          `https://connect-1-t976.onrender.com/api/users/utilisateurs/${studentId}/progression/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error(err);
        setError(
          t("StudentsManagement.errors.loadStudent") ||
          "Impossible de charger les informations de l'étudiant."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetail();
  }, [open, studentId, t]);

  if (!open) return null;

  const utilisateur = student?.utilisateur || {};

  // **Nouvelle logique pour la date de join**
  const joinedDate =
    student?.utilisateur?.date_joined ||
    student?.utilisateur?.created_at ||
    student?.date_joined ||
    student?.created_at ||
    null;


  const joinedFormatted =
    joined ||
    student?.utilisateur?.date_joined ||
    student?.utilisateur?.created_at ||
    "-";



  const initials = `${utilisateur.nom?.[0] || ""}${utilisateur.prenom?.[0] || ""}`.toUpperCase();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-md animate-fadeIn overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <p>{t("StudentsManagement.loading") || "Chargement..."}</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : student ? (
          <>
            <div className="flex flex-col items-center mb-6">
              <UserCircle initials={initials} clickable={false} />
              <h2 className="mt-4 text-xl font-bold text-muted">
                {utilisateur.nom} {utilisateur.prenom}
              </h2>
              <span className="text-sm text-gray">{utilisateur.email}</span>
            </div>

            <div className="space-y-4 text-sm">
              <InfoRow label={t("StudentsManagement.labels.dob")} value={utilisateur.date_naissance} />
              <InfoRow label={t("StudentsManagement.labels.regNumber")} value={utilisateur.matricule} />
              <InfoRow label={t("StudentsManagement.labels.speciality")} value={utilisateur.specialite} />
              <InfoRow label={t("StudentsManagement.labels.year")} value={utilisateur.annee_etude} />

              <div className="pt-4 border-t">
                <InfoRow label={t("StudentsManagement.detailLabels.coursesRead")} value={student.cours_lus?.length || 0} highlight />
                <InfoRow label={t("StudentsManagement.detailLabels.exercisesDone")} value={student.exercices_faits?.length || 0} highlight />
                <InfoRow label={t("StudentsManagement.detailLabels.quizzesDone")} value={student.quiz_faits?.length || 0} highlight />
                <InfoRow
                  label={t("StudentsManagement.detailLabels.joinedOn")}
                  value={joinedFormatted}
                  highlight
                />

              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={onClose}>
                {t("StudentsManagement.close")}
              </Button>
            </div>
          </>
        ) : (
          <p>{t("StudentsManagement.errors.noData") || "Aucune donnée disponible."}</p>
        )}
      </div>
    </div>
  );
}
