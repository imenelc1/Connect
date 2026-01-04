import React from "react";
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

export default function InstructorDetailModal({ open, onClose, instructor }) {
  const { t } = useTranslation("instructors");
  if (!open || !instructor) return null;

  const initials = `${instructor.fullname?.[0] || ""}${instructor.nickname?.[0] || ""}`.toUpperCase();
const joinedFormatted = instructor.joined
  ? new Date(instructor.joined).toLocaleDateString()
  : "-";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-md animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center mb-6">
          <UserCircle initials={initials} clickable={false} />
          <h2 className="mt-4 text-xl font-bold text-muted">
            {instructor.nickname} {instructor.fullname}
          </h2>
          <span className="text-sm text-gray">{instructor.rank}</span>
        </div>

        <div className="space-y-4 text-sm">
          <InfoRow label={t("email")} value={instructor.email} />
          <InfoRow label={t("birthdate")} value={instructor.dob} />
          <InfoRow label={t("matricule")} value={instructor.regnumber} />
          <InfoRow label={t("rank")} value={instructor.rank} />

          <div className="pt-4 border-t">
            <InfoRow label={t("joinedAt")} value={joinedFormatted} highlight />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
