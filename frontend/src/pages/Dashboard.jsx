import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/NavBar";
import CourseCard from "../components/common/CourseCard";
import { Users, BookOpen, ClipboardList, LayoutGrid } from "lucide-react";
import ThemeContext from "../context/ThemeContext";

export default function DashboardAdmin() {
  const { toggleDarkMode } = useContext(ThemeContext);
  const { t } = useTranslation("DashboardAdmin");

  const userData = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("pending");
  const token = localStorage.getItem("admin_token");



  // ----- MOCK COURSES -----
  const pendingCourses = [
    {
      id: 1,
      title: "Algorithmes de tri avancés",
      desc: "Tri rapide, fusion...",
      instructor: "Prof. Jean Moreau",
      submitted: "1 Nov 2024",
      level: "Intermédiaire",
      status: t("tabs.pending"),
    },
    {
      id: 2,
      title: "Programmation système Unix",
      desc: "Processus, threads...",
      instructor: "Prof. Jean Moreau",
      submitted: "30 Oct 2024",
      level: "Avancé",
      status: t("tabs.pending"),
    },
  ];

  const approvedCourses = [];
  const rejectedCourses = [];

  const coursesByTab = { pending: pendingCourses, approved: approvedCourses, rejected: rejectedCourses };
  const courses = coursesByTab[activeTab];

  // ----- MOCK STATS -----
 const [statsData, setStatsData] = useState({
  total_students: 0,
  total_courses: 0,
  total_exercises: 0,
  total_spaces: 0,
});
const stats = [
  {
    title: t("stats.totalStudents"),
    value: statsData.total_students,
    icon: <Users className="text-blue" size={40} />,
  },
  {
    title: t("stats.activeCourses"),
    value: statsData.total_courses,
    icon: <BookOpen className="text-purple" size={40} />,
  },
  {
    title: t("stats.totalExercises"),
    value: statsData.total_exercises,
    icon: <ClipboardList className="text-pink" size={40} />,
  },
  {
    title: t("stats.totalSpaces"), 
    value: statsData.total_spaces,
    icon: <LayoutGrid className="text-blue" size={40} />,
  },
];

  // ----- COLORS DU PROTOTYPE -----
  const statGradients = [
    "from-statBlue1 to-statBlue2",
    "from-statPurple1 to-statPurple2",
    "from-statPink1 to-statPink2",
    "from-statSoftBlue1 to-statSoftBlue2",
  ];

  // ----- MOCK RECENT ACTIVITY -----
  const recentActivity = [
    { name: "Alice Martin", action: "Completed 'Pointers'", time: "5 min ago" },
    { name: "Bob Johnson", action: "Started 'Binary'", time: "12 min ago" },
    { name: "Carol Smith", action: "Submitted Quiz", time: "23 min ago" },
    { name: "David Lee", action: "Earned 'Master of Algo'", time: "1 hour ago" },
    { name: "Emma Wilson", action: "Posted in Recursion", time: "2 hours ago" },
  ];
useEffect(() => {
  fetch("http://localhost:8000/api/users/admin/stats/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then((data) => setStatsData(data))
    .catch((err) => console.error(err));
}, []);

console.log("ADMIN TOKEN =", token);

  return (
    <div className="w-full min-h-screen flex bg-surface">
      {/* SIDEBAR */}
      <div className="hidden lg:block w-64 min-h-screen"><Navbar /></div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col p-4 lg:p-10 gap-8">
        
       

        {/* PAGE TITLE */}
        <div>
          <h1 className="text-3xl font-bold text-textc">{t("title")}</h1>
          <p className="text-grayc">{t("subtitle")}</p>
        </div>

        {/* STATS WITH PROTOTYPE COLORS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={i}
              className={`rounded-3xl p-6 shadow-card flex justify-between items-center bg-gradient-to-br ${statGradients[i]}`}
            >
              <div>
                <p className="text-grayc">{stat.title}</p>
                <h2 className="text-3xl font-bold text-textc">{stat.value}</h2>
              </div>
              {stat.icon}
            </div>
          ))}
        </div>

        {/* GRID: ACTIVITY + COURSES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: Recent Activity */}
          <div className="bg-card shadow-card p-6 rounded-3xl">
            <h2 className="text-xl font-semibold text-textc mb-4">{t("recentActivity")}</h2>

            <ul className="flex flex-col gap-4">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-textc font-medium">{item.name}</p>
                    <p className="text-grayc text-sm">{item.action}</p>
                    <span className="text-gray-400 text-xs">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: COURSES VALIDATION */}
          <div className="bg-card shadow-card p-6 rounded-3xl">
            <h2 className="text-xl font-semibold text-textc mb-4">{t("validationCourses")}</h2>

            {/* TABS */}
            <div className="flex gap-4 bg-gray-100 p-2 rounded-full w-max shadow-sm mb-4">
              {["pending", "approved", "rejected"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeTab === tab ? "bg-white shadow text-textc" : "text-gray-500 hover:text-textc"
                  }`}
                >
                  {t(`tabs.${tab}`)} ({coursesByTab[tab].length})
                </button>
              ))}
            </div>

            {/* COURSES LIST */}
            <div className="flex flex-col gap-6">
              {courses.length === 0 ? (
                <p className="text-grayc text-sm italic">{t("noCourses")}</p>
              ) : (
                courses.map((course) => <CourseCard key={course.id} course={course} />)
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
