

import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import InfoCard from "../components/common/InfoCard";
import { User, MessageCircle, File } from "lucide-react";
import "../styles/index.css";

export default function ConnectExercisePage() {
    //  Données de l'exercice
    const [exerciseData, setExerciseData] = useState({
        title: "Exercise 1: Sum of Two Numbers",
        student: "John Doe",
        submittedDate: "11/06/2024",
        status: "Reviewed",
        description: "Read an integer and display whether it is even or odd.",
        language: "C",
        difficulty: "Very easy",
        code: `#include<stdio.h> 
int main() {
  int number;
  printf("Enter an integer: ");
  scanf("%d", &number);
  if (number % 2 == 0)
      printf("%d is even", number);
  else
      printf("%d is odd", number);
  return 0;
}`,
        expectedOutput: "Enter an integer: \n5\n5 is odd",
        actualOutput: "Enter an integer: \n5\n5 is odd",
        feedback: "Excellent work! Your solution is clean and efficient. Good use of the modulo operator."
    });

    // 🔹 Fonction pour modifier le feedback
    const handleFeedbackChange = (e) => {
        setExerciseData({ ...exerciseData, feedback: e.target.value });
    };

    return (
        <div className="flex bg-background min-h-screen">
            {/* SIDEBAR */}
            <Navbar />

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-16 md:ml-56 p-6 transition-all">

                {/* CARD INFO EN HAUT */}
                <InfoCard exercise={exerciseData} />

                {/* GRID POUR CODE + OUTPUTS */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">

                    {/* Zone code */}

                    <div className="bg-card p-4 rounded-2xl shadow-lg w-full">
                        <div className="flex items-center mb-3 gap-2">
                            <File size={20} className="text-primary" />
                            <h2 className="text-lg font-semibold">Submitted Code</h2>
                        </div>

                        <div className="bg-black rounded-xl overflow-auto h-96 min-h-[360px] text-gray-300 p-4">
                            <pre className="whitespace-pre-wrap">
                                {exerciseData.code}
                            </pre>
                        </div>
                    </div>
                    {/* Outputs côte à côte */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Expected Output */}
                        <div className="bg-card p-4 rounded-xl border border-primary/65 ">
                            <h3 className="font-semibold mb-2">Expected Output</h3>
                            <div className="bg-surface p-3 rounded text-sm text-textc  ">
                                <pre className="whitespace-pre-wrap">
                                    {exerciseData.expectedOutput}
                                </pre>

                            </div>
                        </div>

                        {/* Actual Output */}
                        <div className="bg-card p-4 rounded-xl border border-primary/65">
                            <h3 className="font-semibold mb-2">Actual Output</h3>
                            <div className="bg-primary/30 p-3 rounded text-sm text-textc ">
                                <pre className="whitespace-pre-wrap">
                                    {exerciseData.actualOutput}
                                </pre>

                            </div>
                        </div>
                    </div>

                    {/* Teacher Feedback */}
                    <div className="bg-primary/10 p-4 rounded-2xl shadow-lg flex items-start gap-2">
                        <MessageCircle size={20} className="text-primary mt-1" />
                        <div>
                            <h2 className="text-lg font-semibold mb-1">Teacher Feedback</h2>
                            <p className="text-sm text-textc">{exerciseData.feedback}</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
