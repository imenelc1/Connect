import React from "react";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import TaskCard from "../components/common/TaskCard";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { CircleCheck, TrendingUp, Clock4, Clock, Circle } from "lucide-react";
import WeeklySubmissionChart from "../components/common/WeeklySubmissionChart";
import GradeProgressionChart from "../components/common/GradeProgressionChart";

export default function ProgressExercice() {

    const { t } = useTranslation("ProgressExercice");
    const exercises = [
        { title: "Variables & Data Types", date: "Sep 16, 2024" },
        { title: "Control Structures", date: "Sep 18, 2024" },
        { title: "Functions", date: "Sep 20, 2024" },
        { title: "Arrays & Objects", date: "Sep 23, 2024" },
        { title: "DOM Manipulation", date: "Sep 26, 2024" },
    ];
    const courses = [
        {
            title: "Advanced React Development",
            activity: "Last activity: 2 hours ago",
            progress: 85,
            color: "green",
        },
        {
            title: "Python for Data Science",
            activity: "Last activity: 1 day ago",
            progress: 62,
            color: "primary",
        },
        {
            title: "Web Security Fundamentals",
            activity: "Last activity: 3 days ago",
            progress: 45,
            color: "purple",
        },
    ];

    const gradeData = [
        { week: "Week 1", grade: 72 },
        { week: "Week 2", grade: 78 },
        { week: "Week 3", grade: 83 },
        { week: "Week 4", grade: 88 },
        { week: "Week 5", grade: 85 },
    ];
    const colorClasses = {
        green: {
            bar: "bg-green",
            text: "text-green",
        },
        primary: {
            bar: "bg-primary",
            text: "text-primary",
        },
        purple: {
            bar: "bg-purple",
            text: "text-purple",
        },
    };




    return (
        <div className="flex flex-col lg:flex-row bg-primary/10 min-h-screen ">

            {/* Sidebar */}
            <Navbar />

            {/* Main content */}
            <div className="flex-1 p-4 sm:p-8 lg:ml-56">

                {/* Profile Header */}
                <div className="bg-card rounded-3xl shadow-md p-6 sm:p-8 mb-6 sm:mb-8 w-full max-w-full lg:max-w-5xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center sm:gap-6">
                        <UserCircle />

                        <div className="mt-4 sm:mt-0 text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-semibold">Meriem Hamouche</h2>
                            <p className="text-gray text-sm sm:text-base">merry@school.fr</p>
                            <p className="text-gray   text-xs sm:text-sm">{t("ProgressExercice.joined")} Sept 15, 2024</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 mt-4 sm:mt-6 text-center justify-center">
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-primary">16.5</p>
                            <p className="text-gray">{t("ProgressExercice.AvarageG")}</p>
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-purple">95%</p>
                            <p className="text-gray">{t("ProgressExercice.Submission")}</p>
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-pink">17/20</p>
                            <p className="text-gray">{t("ProgressExercice.Completed")}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-full sm:max-w-5xl py-2 px-4 sm:px-6 bg-gradient-to-r from-primary/30 to-purple  rounded-full mb-6 sm:mb-8">
                    <span role="button" className="px-12 py-1 bg-card text-gray/10 font-semibold rounded-full mb-2 sm:mb-0">
                        {t("ProgressExercice.exercice")}
                    </span>
                    <span role="button" className="px-12 py-1 text-gray/10 rounded-full">
                        {t("ProgressExercice.Progression")}
                    </span>
                </div>
                <div className="w-full px-10">
                    <div className="flex justify-center gap-24 mt-8">

                        <div className="bg-card p-4 rounded-xl shadow w-60 h-24 flex flex-col justify-center">
                            <p className="text-gray text-sm"> {t("ProgressExercice.Completed")}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xl sm:text-2xl font-bold text-purple">17</p>
                                <CircleCheck className="text-purple" />
                            </div>
                        </div>

                        <div className="bg-card p-4 rounded-xl shadow w-60 h-24 flex flex-col justify-center">
                            <p className="text-gray text-sm"> {t("ProgressExercice.AvarageG")}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xl sm:text-2xl font-bold text-pink">16.5/20</p>
                                <TrendingUp className="text-pink" />
                            </div>
                        </div>

                    </div>
                </div>


                {/* Cards Section */}
                <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full max-w-full lg:max-w-5xl mx-auto">

                    {/* Left card */}
                    <div className="bg-card rounded-2xl shadow p-6 flex-1 w-full">
                        <h2 className="font-semibold text-lg mb-4">
                             {t("ProgressExercice.completedexo")}({exercises.length})
                        </h2>

                        <div className="space-y-4">
                            {exercises.map((ex, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="font-medium text-gray">{ex.title}</span>
                                    <span className="text-sm text-gray flex items-center gap-1">
                                        <Clock size={14} />  {t("ProgressExercice.Submitted")} {ex.date}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right card */}
                    <div className="  flex-1 w-full ">
                        <div className="bg-card rounded-2xl  shadow p-6">
                            <h2 className=" font-semibold text-lg mb-4">
                                Alice Johnson's  {t("ProgressExercice.courses")} ({courses.length}) </h2>
                            <div className="space-y-6">
                                {courses.map((course, idx) => (
                                    <div key={idx} className="bg-card p-4 rounded-xl border border-gray/20 shadow-sm">

                                        {/* Title + Activity */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-900">{course.title}</p>
                                                <p className="text-sm text-gray">{course.activity}</p>
                                            </div>

                                            {/* Percentage with same color */}
                                            <span className={`text-sm font-semibold ${colorClasses[course.color].text}`}>
                                                {course.progress}%
                                            </span>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full h-2 bg-gray/20 rounded-full mt-3 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${colorClasses[course.color].bar}`}
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>

                                    </div>
                                ))}
                            </div>




                        </div>




                        {/* Weekly submission chart */}
                        <div className="mt-6 ">
                            <WeeklySubmissionChart
                             />
                        </div>
                    </div>

                </div>

                <div className="mt-4">
                    <GradeProgressionChart
                        data={gradeData}
                        title= {t("ProgressExercice.grade")}
                    />

                </div>
                <div className="mt-6 bg-card p-6 rounded-lg">
                    <h2 className="font-semibold text-lg mb-3"> {t("ProgressExercice.performance")}</h2>

                    <div className="bg-gradient-to-r from-primary/20 to-purple/40 p-4 rounded-xl border border-purple flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-grad-all">
                            <TrendingUp className="text-white" size={20} />
                        </div>


                        <div className="flex flex-col">
                            <span className="font-semibold text-gray"> {t("ProgressExercice.positive")}</span>
                            <p className="text-sm text-primary"> {t("ProgressExercice.positivep1")} 2.8  {t("ProgressExercice.positivep2")}</p>
                        </div>
                    </div>
                </div>







            </div>
        </div>
    );
}
