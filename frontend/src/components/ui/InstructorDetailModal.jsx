import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../common/Button";
import UserCircle from "../common/UserCircle";

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-gray text-sm md:text-base">{label}</span>
      <span
        className={`font-medium ${
          highlight ? "text-green font-semibold" : "text-muted"
        } text-sm md:text-base`}
      >
        {value || "-"}
      </span>
    </div>
  );
}

export default function InstructorDetailModal({ open, onClose, instructor }) {
  const { t } = useTranslation("instructors");
  if (!open || !instructor) return null;

  const initials = `${instructor.fullname?.[0] || ""}${
    instructor.nickname?.[0] || ""
  }`.toUpperCase();

  const joinedFormatted = instructor.joined
    ? new Date(instructor.joined).toLocaleDateString()
    : "-";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-3 sm:px-6"
      onClick={onClose}
    >
      <div
        className="
          bg-card rounded-2xl shadow-xl w-full
          max-w-md sm:max-w-lg
          p-4 sm:p-6
          animate-fadeIn
          max-h-[90vh]
          overflow-y-auto
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-5 sm:mb-6 text-center">
          <UserCircle initials={initials} clickable={false} size="lg" />

          <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-muted">
            {instructor.nickname} {instructor.fullname}
          </h2>

          <span className="text-xs sm:text-sm text-gray">
            {instructor.rank}
          </span>
        </div>

        {/* Infos */}
        <div className="space-y-3 sm:space-y-4 text-sm">
          <InfoRow label={t("email")} value={instructor.email} />
          <InfoRow label={t("birthdate")} value={instructor.dob} />
          <InfoRow label={t("matricule")} value={instructor.regnumber} />
          <InfoRow label={t("rank")} value={instructor.rank} />

          <div className="pt-3 sm:pt-4 border-t">
            <InfoRow
              label={t("joinedAt")}
              value={joinedFormatted}
              highlight
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 sm:mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
