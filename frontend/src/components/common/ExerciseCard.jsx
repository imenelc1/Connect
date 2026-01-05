import React from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";

/* ===================== STYLES ===================== */
const levelStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};

const levelCardBg = {
  Débutant: "bg-grad-2",
  Intermédiaire: "bg-grad-3",
  Avancé: "bg-grad-4",
};

const initialsBgMap = {
  Débutant: "bg-blue",
  Intermédiaire: "bg-purple",
  Avancé: "bg-pink",
};

/* ===================== UTILS ===================== */
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

/* ===================== COMPONENT ===================== */
export default function ExerciseCard({ exercise, isOwner = false, onDelete }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { t } = useTranslation("allExercises");

  if (!exercise) return null;

  const handleDelete = async () => {
    if (!window.confirm(t("Errors.ConfirmDeleteExercise"))) return;


    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/exercices/exercice/${exercise.id}/delete/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onDelete?.(exercise.id);
    } catch (err) {
      console.error(t("Errors.DeleteFailed"), err);
    }
  };

  return (
    <div
      className={`shadow-md p-6 rounded-3xl flex flex-col justify-between h-full
      transition-all duration-300 hover:shadow-xl hover:-translate-y-1
      overflow-hidden ${levelCardBg[exercise.level]}`}
    >
      {/* ================= HEADER ================= */}
      <div>
        <div className="flex justify-between items-start gap-3">
          {/* ✅ TITRE FIXÉ */}
          <h2 className="font-semibold text-lg break-words line-clamp-2">
            {exercise.title}
          </h2>

          <span
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${levelStyles[exercise.level]}`}
          >
            {exercise.level}
          </span>
        </div>

        {/* ✅ DESCRIPTION FIXÉE */}
        <p className="text-grayc mt-3 line-clamp-3 break-words">
          {exercise.description}
        </p>

        {/* ================= AUTHOR ================= */}
        <div className="flex items-center justify-between mt-4 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-8 h-8 rounded-full ${initialsBgMap[exercise.level]} text-white flex items-center justify-center text-xs font-semibold`}
            >
              {getInitials(exercise.author)}
            </div>
            <span className="text-sm text-grayc truncate">
              {exercise.author}
            </span>
          </div>

          <span className="text-xs text-gray-400 whitespace-nowrap">
            {exercise.categorie}
          </span>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex justify-between items-center mt-4 gap-3">
        {!isOwner ? (
          <Button
            variant="start"
            className={`py-1 px-4 rounded-full whitespace-nowrap ${levelStyles[exercise.level]}`}
            onClick={() => {
              exercise.categorie === "code"
                ? navigate(`/start-exerciseCode/${exercise.id}`)
                : navigate(`/start-exercise/${exercise.id}`);
            }}
          >
            {t("start")}
          </Button>
        ) : (
          <Button
            variant="start"
            className={`py-1 px-4 rounded-full whitespace-nowrap ${levelStyles[exercise.level]}`}
            onClick={() => {
              exercise.categorie === "code"
                ? navigate(`/start-exerciseCode/${exercise.id}`)
                : navigate(`/start-exercise/${exercise.id}`);
            }}
          >
           {t("CheckQuiz")}
          </Button>
        )}

        {isOwner && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/exercices/edit/${exercise.id}`)}
              className="text-gray-600 hover:text-blue-600 transition"
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={handleDelete}
              className="text-gray-600 hover:text-red-600 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}