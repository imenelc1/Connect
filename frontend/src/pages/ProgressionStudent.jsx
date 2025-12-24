import React from "react";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import TaskCard from "../components/common/TaskCard";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { CircleCheck, TrendingUp, Clock4, Clock, Circle } from "lucide-react";
import WeeklySubmissionChart from "../components/common/WeeklySubmissionChart";
import GradeProgressionChart from "../components/common/GradeProgressionChart";

export default function ProgressStudent() {

    const { t } = useTranslation("ProgressStudent");
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
        { week: t("ProgressStudent.Week") + " 1", grade: 72 },
        { week: t("ProgressStudent.Week") + " 2", grade: 78 },
        { week: t("ProgressStudent.Week") + " 3", grade: 83 },
        { week: t("ProgressStudent.Week") + " 4", grade: 88 },
        { week: t("ProgressStudent.Week") + " 5", grade: 85 },
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
                            <p className="text-gray   text-xs sm:text-sm">{t("ProgressStudent.joined")} Sept 15, 2024</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 mt-4 sm:mt-6 text-center justify-center">
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-primary">16.5</p>
                            <p className="text-gray">{t("ProgressStudent.AvarageG")}</p>
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-purple">95%</p>
                            <p className="text-gray">{t("ProgressStudent.Submission")}</p>
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-pink">17/20</p>
                            <p className="text-gray">{t("ProgressStudent.Completed")}</p>
                        </div>
                    </div>
                </div>





                {/* Cards Section */}
                <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full max-w-full lg:max-w-5xl mx-auto">
                    <div className="bg-card p-8 rounded-xl shadow w-80 h-40 ">
                        <p className="text-gray text-lg"> {t("ProgressStudent.AvarageG")}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-3xl sm:text-2xl font-semibold text-pink">16.5/20</p>

                        </div>
                        <span className="flex text-sm mt-2">  <TrendingUp className="text-green " size={16} />+2.8  {t("ProgressStudent.points")} </span>
                    </div>

                    {/* Right card */}
                    <div className="  flex-1 w-full ">
                        <div className="bg-card rounded-2xl  shadow p-6">
                            <h2 className=" font-semibold text-lg mb-4">
                                {t("ProgressStudent.mycourses")} ({courses.length}) </h2>

                            {courses.map((course, idx) => (
                                <div key={idx} className=" p-4 rounded-xl shadow-sm">

                                    {/* Title + Activity */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-lg text-gray">{course.title}</p>

                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full h-2 bg-gray/20 rounded-full mt-3 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${colorClasses[course.color].bar}`}
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>

                                        {/* Percentage with same color */}
                                        <span className={`text-sm font-semibold ${colorClasses[course.color].text}`}>
                                            {course.progress}%
                                        </span>
                                    </div>



                                </div>
                            ))}





                        </div>




                    </div>

                </div>

                {/* Weekly submission chart */}
                <div className="mt-6 ">
                    <WeeklySubmissionChart />
                </div>

                <div className="mt-4">
                    <GradeProgressionChart
                        data={gradeData}
                        title={t("ProgressStudent.grade")}
                    />

                </div>



                <div className="mt-16 bg-gradient-to-r from-primary/20 to-purple/40 p-4 rounded-xl border border-purple flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-grad-all">
                        <TrendingUp className="text-white" size={20} />
                    </div>


                    <div className="flex flex-col">
                        <span className="font-semibold text-gray"> {t("ProgressStudent.positive")}</span>
                        <p className="text-sm text-primary"> {t("ProgressStudent.positivep1")} 2.8 {t("ProgressStudent.positivep2")}6 {t("ProgressStudent.positivep3")}</p>
                    </div>
                </div>








            </div>
        </div>
    );
}
