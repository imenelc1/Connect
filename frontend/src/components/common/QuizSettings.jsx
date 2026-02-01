import React from "react";
import { useTranslation } from "react-i18next";
import ModernDropdown from "./ModernDropdown";
/*====
  Composant utiliser dans la creation et la modification d'un quiz, 
  configuration des info generale du quiz, titre, duration, ...

*/

export default function QuizSettings({ quizData, onQuizChange, courses }) {
  const { t } = useTranslation("createQuiz"); //traduction

  const handleChange = (field, value) => {
    onQuizChange(field, value);  // juste passer la valeur, ne pas utiliser une fonction ici
  };


  //niveaux du quiz
  const levels = [
    { key: "debutant", label: t("beginner") },
    { key: "intermediaire", label: t("intermediate") },
    { key: "avance", label: t("advanced") },
  ];

  //filtrer les cours appartenant a l'utilisateur 
const myCourses = courses;

  return (
    <div className="rounded-3xl shadow-xl p-6 max-w-[20rem] border border-white/10 backdrop-blur bg-grad-3 text-black">
      <h2 className="text-lg font-semibold mb-4">
        {t("quizSettings")}
      </h2>

      <div className="space-y-6">

        {/* TITRE */}
        <div className="flex flex-col gap-2">
          <label>{t("quizTitle")}</label>
          <input
            value={quizData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            className="shadow-md rounded-md px-3 py-2 outline-none"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-2">
          <label>{t("descriptionLabel")}</label>
          <textarea
            value={quizData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="shadow-md rounded-md px-3 py-2 outline-none"
          />
        </div>

        {/* COURS */}
        <div className="flex flex-col gap-2">
          <label>{t("selectCourse")}</label>

          <ModernDropdown
            value={quizData.courseId || ""}
            onChange={(val) => handleChange("courseId", val)}
            options={[
              { value: "", label: t("chooseCourse") },
              ...myCourses.map((course) => ({
                value: course.id,
                label: course.title,
              })),
            ]}
          />

        </div>

        {/* VISIBILITÉ */}
        <div className="flex flex-col gap-2">
          <label>{t("visibility")}</label>
          <ModernDropdown
            value={quizData.visibility || "public"}
            onChange={(val) => handleChange("visibility", val)}
            options={[
              { value: "public", label: t("public") },
              { value: "private", label: t("private") },
            ]}
          />
        </div>

        {/* NIVEAU */}
        <div className="flex flex-col gap-2">
          <label>{t("quizLevel")}</label>
          <ModernDropdown
            value={quizData.level || ""}
            onChange={(val) => handleChange("level", val)}
            options={[
              { value: "", label: t("selectLevel") },
              ...levels.map((lvl) => ({
                value: lvl.key,
                label: lvl.label,
              })),
            ]}
          />



        </div>
        {/*score minimum*/}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t("scoreMinimum")}</label>
          <input
            type="number"
            min={0}
            max={100}
            value={quizData.passingScore || 0} // valeur contrôlée
            onChange={(e) =>
              onQuizChange("passingScore", parseInt(e.target.value) || 0)
            }
            className="w-full  shadow-md text-sm px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/40 outline-none transition text-black"

          />
        </div>

        {/* nombre max de tentatives */}
        <div className="flex flex-col gap-1">
          <label>{t("maxAttempts")}</label>

          <input
            type="number"
            min={0}
            value={quizData.maxAttempts}
            onChange={(e) =>
              handleChange("maxAttempts", parseInt(e.target.value) || 0)
            }
            className="shadow-md rounded-md px-3 py-2 outline-none"
          />

          {/* 👇 TEXTE EXPLICATIF */}
          <p className="text-xs text-gray-500 italic">
            {t("maxAttemptsHint")}
          </p>
        </div>


        {/* duree  entre deux tentative */}
        <div className="flex flex-col gap-2">
          <label>{t("delais_entre_tentative")}</label>
          <input
            type="number"
            min={0}
            value={quizData.delais_entre_tentative || 0}
            onChange={(e) =>
              handleChange("delais_entre_tentative", parseInt(e.target.value) || 0)

            }
            className="shadow-md rounded-md px-3 py-2 outline-none"
          />
        </div>


        {/* activer/desativer la duree */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={quizData.durationEnabled || false}
            onChange={(e) =>
              handleChange("durationEnabled", e.target.checked)
            }

          />
          <label>{t("enableDuration")}</label>
        </div>

        {/* afficher l'input de la duree seulement si activeDuration=true */}
        {quizData.durationEnabled && (
          <input
            type="number"
            min={1}
            value={quizData.duration || ""}
            onChange={(e) =>
              handleChange("duration", parseInt(e.target.value) || 0)
            }
            className="shadow-md rounded-md px-3 py-2 outline-none"
          />
        )}
      </div>
    </div>
  );
}