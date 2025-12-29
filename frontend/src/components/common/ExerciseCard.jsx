// ExerciseCard.jsx
import React from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const levelStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};

const levelcard = {
  Débutant: "bg-grad-2 ",
  Intermédiaire: "bg-grad-3 ",
  Avancé: "bg-grad-4 ",
};

export default function ExerciseCard({ exercise }) {
  const navigate = useNavigate();

  if (!exercise) return null;

  const { t } = useTranslation("allExercises");
  return (
    <div className={`shadow-md p-6 rounded-3xl flex flex-col justify-between h-full transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 ${levelcard[exercise.level]}`}>
      <div className={`flex flex-col flex-1`}>
        <div className={`flex justify-between items-start`}>
          <h2 className="font-semibold text-lg">{exercise.title}</h2>
          <span className={`px-3 py-1 text-xs rounded-full ${levelStyles[exercise.level]}`}>
            {exercise.level}
          </span>
          
        </div>
        <p className="text-grayc my-3 line-clamp-3">{exercise.description}</p>
      </div>

      <div className="mt-2">
        <Button
          variant="start"
          className={`py-1 whitespace-nowrap ${levelStyles[exercise.level]}`}
          onClick={() => {
            console.log("Exercise ", exercise);
            if (exercise.categorie === "code") {
              navigate(`/start-exerciseCode/${exercise.id}`);
            } else {
              navigate(`/start-exercise/${exercise.id}`);
            }
          }}
        >
          Commencer
        </Button>
      </div>
    </div>
  );
}
