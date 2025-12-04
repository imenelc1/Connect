import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { CheckCircle, User, Clock, Code, Circle } from "lucide-react";

export default function InfoCard({ exercise }) {
    const [openDetails, setOpenDetails] = useState(false);
    const { t } = useTranslation("SubmittedExercise");

    return (
        <div className="bg-primary/10 dark:bg-card rounded-2xl shadow-xl p-6 mb-6 max-w-4xl mx-auto w-full">

            {/* Header */}
            <div className="mb-4 border-b pb-4 dark:border-surface/60">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{exercise.title}</h2>
                    <div
                        className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${exercise.status === "Reviewed"
                            ? "bg-grad-3 text-textc"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700"
                            }`}
                    >
                        <CheckCircle size={14} className="mr-1 text-secondary" />
                        {exercise.status}
                    </div>
                </div>
                <p className="text-textc dark:text-grayc mt-2 leading-relaxed">{exercise.description}</p>
            </div>

            {/* Collapsible metadata */}
            <button
                onClick={() => setOpenDetails(!openDetails)}
                className="flex justify-between w-full items-center p-3 bg-grad-2 dark:bg-gray-700 rounded-lg mb-2 text-sm sm:hidden"
            >
                <span>{t("showDetails")}</span>
                <span>{openDetails ? "▲" : "▼"}</span>
            </button>

            <div
                className={`flex flex-wrap gap-4 text-sm transition-all duration-300 ${openDetails ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden sm:max-h-full sm:opacity-100"
                    }`}
            >
                <div className="flex items-center text-gray-700 dark:text-grayc flex-1 min-w-[150px]">
                    <User size={16} className="mr-2 text-primary" />
                    <span className="font-semibold">{t("student")} :</span>
                    &nbsp;{exercise.student}
                </div>
                <div className="flex items-center text-gray-700 dark:text-grayc flex-1 min-w-[150px]">
                    <Clock size={16} className="mr-2 text-primary" />
                    <span className="font-semibold">{t("submitted")} :</span>  &nbsp;{exercise.submittedDate}
                </div>
                <div className="flex items-center text-gray-700 dark:text-grayc flex-1 min-w-[150px]">
                    <Code size={20} className="mr-2 text-primary" />
                    <span className="font-semibold">{t("language")} :</span> &nbsp;{exercise.language}
                </div>
                <div className="flex items-center text-gray-700 dark:text-grayc flex-1 min-w-[150px]">
                    <Circle size={10} className="mr-2 text-secondary" fill="currentColor" />
                    <span className="font-semibold">{t("difficulty")} : </span>  &nbsp;{exercise.difficulty}
                </div>
            </div>
        </div>
    );
}
