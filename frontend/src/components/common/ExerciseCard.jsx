import React from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";

const levelStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};

const levelcard = {
  Débutant: "bg-grad-2",
  Intermédiaire: "bg-grad-3",
  Avancé: "bg-grad-4",
};

export default function ExerciseCard({ exercise, isOwner = false, onDelete }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!exercise) return null;

  const { t } = useTranslation("allExercises");
  const handleDelete = async () => {
    if (!window.confirm("Supprimer cet exercice ?")) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/exercices/exercice/${exercise.id}/delete/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onDelete?.(exercise.id);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div
      className={`shadow-md p-6 rounded-3xl flex flex-col justify-between h-48 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${levelcard[exercise.level]}`}
    >
      {/* HEADER */}
      <div>
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg">{exercise.title}</h2>

          <span
            className={`px-3 py-1 text-xs rounded-full ${levelStyles[exercise.level]}`}
          >
            {exercise.level}
          </span>
        </div>

        <p className="text-grayc mt-3 line-clamp-3">
          {exercise.description}
        </p>
      </div>

      {/* FOOTER */}
<div className="flex justify-between items-center mt-4 gap-3">
  {!isOwner ? (
    /* ÉTUDIANT */
    <Button
      variant="start"
      className={`py-1 px-4 rounded-full whitespace-nowrap ${levelStyles[exercise.level]}`}
      onClick={() => {
        exercise.categorie === "code"
          ? navigate(`/start-exerciseCode/${exercise.id}`)
          : navigate(`/start-exercise/${exercise.id}`);
      }}
    >
      Commencer
    </Button>
  ) : (
    /* PROF */
    <Button
      variant="start"
      className={`py-1 px-4 rounded-full whitespace-nowrap ${levelStyles[exercise.level]}`}
        onClick={() => {
        exercise.categorie === "code"
          ? navigate(`/start-exerciseCode/${exercise.id}`)
          : navigate(`/start-exercise/${exercise.id}`);
      }}
    >
      Check quiz
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
