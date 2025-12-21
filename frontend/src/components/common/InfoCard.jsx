import React from "react";
import { CheckCircle, Clock, Calendar, Code, User, Circle } from "lucide-react";
import "../../styles/index.css";

export default function InfoCard({ exercise }) {
    return (
        <div className="bg-primary/10 dark:bg-card rounded-2xl shadow-xl p-6 mb-6">
            {/* Header */}


            <div className="mb-4 border-b pb-4 dark:border-surface/60">
                {/* Header + Statut */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {exercise.title}
                    </h2>

                    <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold
      ${exercise.status === "Reviewed" ?
                            "bg-grad-3 text-textc  " :
                            "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 "}`}>
                        <CheckCircle size={14} className="mr-1 text-secondary" />
                        {exercise.status}
                    </div>
                </div>

                {/* Description en dessous */}
                <p className="text-textc dark:text-grayc mt-2 leading-relaxed">
                    {exercise.description}
                </p>
            </div>


            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center text-gray-700 dark:text-grayc">
                    <User size={16} className="mr-2 text-primary" />
                    <span className="font-semibold">Student : </span> {exercise.studentName}
                </div>
                <div className="flex items-center text-gray-700 dark:text-grayc">
                    <Clock size={16} className="mr-2 text-primary" />
                    <span className="font-semibold">Submitted : </span> {exercise.submittedDate}
                </div>
                <div className="flex items-center text-gray-700 dark:text-grayc">
                    <Code size={20} className="mr-2 text-primary" />
                    <span className="font-semibold">Language : </span> {exercise.language}
                </div>
                <div className="flex items-center text-gray-700 dark:text-grayc">
                    <Circle size={10} className="mr-2 text-secondary" fill="currentColor" />
                    <span className="font-semibold">Difficulty:</span> {exercise.difficulty}
                </div>
            </div>
        </div>
    );
}
