
import React from "react";
import Navbar from "../components/common/Navbar";
import { Plus } from "lucide-react";
import CourseCard from "../components/common/CourseCard";
import Button from "../components/common/Button";
import CourseFilters from "../components/common/CourseFilters";
import CourseSearchBar from "../components/common/CourseSearchBar";
import { useState } from "react";

const courses = [
  {
    title: "Structures de Données",
    description: "Explorez les arbres, graphes, tables de hachage et structures de données complexes.",
    level: "beginner",
    duration: "1h 30min",
    author: "Dr. Cheikh Farid",
    initials: "C.F",
    isMine: true,

  },
  {
    title: "Algorithmes Avancés",
    description: "Optimisation, complexité, et techniques avancées pour résoudre des problèmes complexes.",
    level: "advanced",
    duration: "2h 15min",
    author: "Dr. Alice Benali",
    initials: "A.B",
    isMine: false,
  },
  {
    title: "Systèmes Informatiques",
    description: "Architecture, compilation et fonctionnement interne d’un système moderne.",
    level: "intermediate",
    duration: "2h 15min",
    author: "Dr. Alice Benali",
    initials: "A.B",
    isMine: true,
  },
];

// --- Mapping niveau → gradient personnalisé ---
const gradientMap = {
  beginner: "bg-grad-2",
  intermediate: "bg-grad-3",
  advanced: "bg-grad-4",
};

export default function AllCoursesPage() {
 const userData = JSON.parse(localStorage.getItem("user"));
const userRole = userData?.user?.role ?? userData?.role;
console.log("AllCoursesPage userRole:", userRole);

  const [filterLevel, setFilterLevel] = useState("ALL");
const filteredCourses =
    filterLevel === "ALL"
      ? courses
      : courses.filter(course => course.level === filterLevel);
  return (
    <div className="flex bg-surface min-h-screen">

      <Navbar
        userName="Andrew Smith"
        userRole={userRole}
        userInitials="AS"
        links={[
          { href: "/home", label: "Home", icon: Plus },
          { href: "/dashboard", label: "Dashboard", icon: Plus },
          { href: "/courses", label: "Courses", icon: Plus },
        ]}
      />

      <main className="flex-1 p-8">

        {/* Top */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>

          {userRole === "enseignant" && (
            <Button variant="courseStart" className="!w-auto px-6 flex items-center gap-2">
              <Plus size={18} />
              Create a new Course
            </Button>
          )}
        </div>

        {/* Search */}
        <CourseSearchBar />

           {/* Filters */}
    <CourseFilters
      showCompletedFilter={userRole === "etudiant"}
      onFilterChange={setFilterLevel} // <-- ici on passe la fonction
        activeFilter={filterLevel}
    />

        {/* Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {filteredCourses.map((course, idx) => (
        <CourseCard
          key={idx}
          className={gradientMap[course.level] ?? "bg-grad-1"}
          course={course}
          role={userRole}
          showProgress={userRole === "etudiant"}
        />
      ))}
    </div>

      </main>
    </div>
  );
}
