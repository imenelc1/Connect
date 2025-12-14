

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import { CheckCircle, Clock, MessageCircle, Calendar, ChevronRight } from "lucide-react";
import "../styles/index.css";

const exercisesData = [
  {
    id: 1,
    title: "Exercise 1: Sum of Two Numbers",
    description: "Read an integer and display whether it is even or odd.",
    status: "Reviewed",
    submittedDate: "12/06/2024",
    language: "C",
    difficulty: "Very easy",
    feedback: "Good job! Clear explanation and correct logic.",
    bgClass: "bg-grad-2",
  },
  {
    id: 2,
    title: "Exercise 2: Loops and Conditions",
    description: "Create a function that displays numbers from 1 to 100.",
    status: "Reviewed",
    submittedDate: "12/06/2024",
    language: "C",
    difficulty: "Moderate",
    feedback: "Good loop usage. Try optimizing next time.",
    bgClass: "bg-grad-3",
  },
  {
    id: 3,
    title: "Exercise 3: Dynamic Arrays",
    description: "Manipulate arrays and sort elements.",
    status: "Reviewed",
    submittedDate: "13/06/2024",
    language: "C",
    difficulty: "Very difficult",
    feedback: "Excellent handling of pointers and allocation.",
    bgClass: "bg-grad-2",
  },
  {
    id: 4,
    title: "Exercise 4: Pointers and Memory",
    description: "Memory management with malloc and free.",
    status: "Pending Review",
    submittedDate: "13/06/2024",
    language: "C",
    difficulty: "Very difficult",
    bgClass: "bg-grad-3",
  },
];

export default function SubmittedExercises() {
  const [filter, setFilter] = useState("All");
  const [expandedCards, setExpandedCards] = useState({});
  const { t } = useTranslation("SubmittedExercises");


  const filtered = exercisesData.filter((ex) => {
    if (filter === "All") return true;
    if (filter === "Reviewed") return ex.status === "Reviewed";
    if (filter === "Pending") return ex.status === "Pending Review";
    return true;
  });

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex">
      <Navbar />

      <main className="flex-1 ml-16 sm:ml-56 p-6">

        {/* HEADER + TOTAL */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-semibold text-primary">{t("submittedExercises")}</h1>
          <div className="text-primary font-medium text-sm border border-primary px-3 py-1 rounded-md shadow-sm bg-bg inline-block">
            {t("total")}: {filtered.length} {t("exercises")}
          </div>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex justify-between mb-6">
          <Button
            text={t("all")}
            variant="mediumPlus"
            className={`border border-primary text-primary ${filter === "All" ? "opacity-100" : "opacity-60"}`}
            onClick={() => setFilter("All")}
          />
          <Button
            text={t("reviewed")}
            variant="mediumPlus"
            className={`border border-secondary2 text-secondary2 ${filter === "Reviewed" ? "opacity-100" : "opacity-60"}`}
            onClick={() => setFilter("Reviewed")}
          />
          <Button
            text={t("pendingReview")}
            variant="mediumPlus"
            className={`border border-pink text-pink ${filter === "Pending" ? "opacity-100" : "opacity-60"}`}
            onClick={() => setFilter("Pending")}
          />
        </div>

        {/* LIST OF CARDS */}
        <div className="flex flex-col gap-5">
          {filtered.map((ex) => {
            const isExpanded = expandedCards[ex.id] || false;
            return (
              <div key={ex.id} className={`${ex.bgClass} shadow rounded-xl p-4 sm:p-6 border flex flex-col relative transition-all`}>

                {/* Status Badge */}
                <span className={`absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-1 rounded ${ex.status === "Reviewed" ? "bg-secondary/30  text-textc" : "bg-pink/30 text-textc"}`}>
                  {ex.status === "Reviewed" ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {ex.status}
                </span>

                {/* Title */}
                <h2 className="text-xl font-semibold">{ex.title}</h2>

                {/* Description */}
                <p className="text-textc text-sm leading-relaxed">{ex.description}</p>


                {/* ArrowRight clickable */}
                <div className="flex justify-end mt-2">
                  <ChevronRight
                    size={20}
                    className="text-primary cursor-pointer"
                    onClick={() => window.location.href = `/exercise/${ex.id}`} // ou useNavigate si react-router
                  />
                </div>
                {/* Show Details button on small screens */}
                <div className="sm:hidden flex justify-end mt-2">
                  <button
                    className="text-primary text-sm underline"
                    onClick={() => toggleCard(ex.id)}
                  >
                    {isExpanded ? t("hideDetails") : t("showDetails")}
                  </button>
                </div>

                {/* Details (hidden on small screens unless expanded) */}
                <div className={`${isExpanded ? "block" : "hidden"} sm:block mt-3 space-y-3`}>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-textc text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-primary" /> {ex.submittedDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-primary font-bold">{`</>`}</span> {ex.language}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-3 h-3 rounded-full ${ex.difficulty === "Very easy" ? "bg-secondary" : ex.difficulty === "Moderate" ? "bg-primary" : "bg-pink"}`}></span>
                      {ex.difficulty}
                    </div>
                  </div>

                  {/* Feedback */}
                  {(ex.status === "Reviewed" || ex.status === "Pending Review") && (
                    <div className="flex flex-col ">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle size={16} className="text-primary" />
                        <span className="font-semibold text-sm text-primary">{t("teacherFeedback")}</span>
                      </div>
                      <div className={`p-3 rounded-md ${ex.status === "Reviewed" ? "bg-surface" : "bg-white"}`}>
                        <p className="text-sm text-textc">{ex.feedback || t("noFeedback")}</p>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

        {/* BOTTOM STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
          <div className="flex items-center justify-between bg-grad-3 border border-secondary2 p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-secondary" size={20} />
              <span className="font-regular text-md">{t("reviewedStat")}</span>
            </div>
            <span className="text-md font-bold text-secondary">3</span>
          </div>

          <div className="flex items-center justify-between bg-grad-4 border border-pink p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <Clock className="text-pink" size={20} />
              <span className="font-regular text-md">{t("pendingStat")}</span>
            </div>
            <span className="text-md font-bold text-pink">1</span>
          </div>
        </div>

      </main>
    </div>
  );
}


