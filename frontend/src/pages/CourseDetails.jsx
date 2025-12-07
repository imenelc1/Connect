// COMPLETE CourseDetails.jsx with teacher course selection in modal

import React, { useState, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Topbar from "../components/common/TopBar";
import AddModal from "../components/common/AddModel";
import Button from "../components/common/Button";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ContentFilters from "../components/common/ContentFilters";
import ContentCard from "../components/common/ContentCard";
import UserCircle from "../components/common/UserCircle";
import { ArrowLeft, Users, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, NotebookPen, FileCheck } from "lucide-react";
import ThemeContext from "../context/ThemeContext";

export default function CourseDetails() {
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const { toggleDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation("CourseDetails");
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [openModal, setOpenModal] = useState(false);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");

  const [selectedCourse, setSelectedCourse] = useState("");

  const steps = [
    { label: t("topbar.course"), icon: BookOpen },
    { label: t("topbar.quizzes"), icon: NotebookPen },
    { label: t("topbar.exercises"), icon: FileCheck },
  ];

  const numberOfStudents = 34;

  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Introduction to Design Patterns",
      description: "Mobile design patterns",
      level: "Débutant",
      author: "Teacher",
      initials: "TD",
      date: "12/01/2025",
      mine: true,
    },
    {
      id: 2,
      title: "Design Patterns Basics",
      description: "Mobile design patterns",
      level: "Intermédiaire",
      author: "Teacher",
      initials: "DP",
      date: "12/05/2025",
      mine: false,
    },
    {
      id: 3,
      title: "Advanced Design Patterns",
      description: "Patterns avancés",
      level: "Avancé",
      author: "Teacher",
      initials: "AD",
      date: "12/10/2025",
      mine: false,
    },
  ]);

  const teacherCourses = courses.filter((c) => c.mine);

  const gradientMap = {
    Débutant: "bg-grad-2",
    Intermédiaire: "bg-grad-3",
    Avancé: "bg-grad-4",
  };

  const displayedCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterLevel === "all") return matchesSearch;
    if (filterLevel === "mine") return matchesSearch && course.mine;
    return matchesSearch && course.level === filterLevel;
  });

  const handleAddCourse = (e) => {
    e.preventDefault();

    if (!courseTitle.trim()) return;
    if (!selectedCourse) return alert(t("pleaseSelectCourse"));

    setCourses([
      ...courses,
      {
        id: Date.now(),
        title: courseTitle,
        description: courseDescription,
        author: "Teacher",
        initials: courseTitle
          .split(" ")
          .map((a) => a[0])
          .join("")
          .toUpperCase(),
        level: "Débutant",
        date: new Date().toLocaleDateString(),
        mine: true,
        courseId: selectedCourse,
      },
    ]);

    setCourseTitle("");
    setCourseDescription("");
    setSelectedCourse("");
    setOpenModal(false);
  };

  return (
    <div className="flex w-full bg-surface justify-between items-center min-h-screen">
      <Navbar />

      <main className="lg:ml-64 w-full min-h-screen px-6 py-6 bg-bg">
        <div className="flex justify-between items-center mb-6">
          <button
            className="text-muted font-medium hover:underline w-max flex items-center gap-1"
            onClick={() => navigate("/Spaces")}
          >
            <ArrowLeft size={16} /> {t("backToSpaces")}
          </button>

          <div className="flex justify-around items-center gap-4">
            <div className="bg-bg w-7 h-7 rounded-full flex items-center justify-center">
              <Bell size={16} />
            </div>
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => i18n.changeLanguage(lang)}
            />
          </div>
        </div>

        <div className="flex justify-between items-start mb-2">
          <h2 className="text-4xl font-semibold text-muted">My space</h2>
          <div className="flex items-center gap-2 bg-card text-muted font-semibold px-4 py-2 rounded-md">
            <Users size={16} /> {numberOfStudents} {t("students")}
          </div>
        </div>

        <Topbar
          steps={steps}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          className="my-6 flex justify-between items-center"
        />

        {/* Affichage selon l'étape active */}
        {activeStep === 1 && (
          <>
            <ContentFilters
              activeFilter={filterLevel}
              onFilterChange={setFilterLevel}
             
              type="courses"
            />

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4 -ml-5">
              <div className="w-full md:w-[800px]">
                <ContentSearchBar
                  placeholder={t("searchCourses")}
                  onChange={(value) => setSearchTerm(value)}
                />
              </div>

              <Button
                variant="primary"
                onClick={() => setOpenModal(true)}
                className="w-[150px] mr-35"
              >
                + {t("addCourse")}
              </Button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {displayedCourses.map((course) => (
                <ContentCard
                  key={course.id}
                  course={{
                    ...course,
                    duration: t("createdOn") + " " + course.date,
                    isMine: course.mine,
                  }}
                  role="enseignant"
                  className={gradientMap[course.level] || "bg-grad-1"}
                  showProgress={false}
                  onDelete={(id) => setCourses(courses.filter((c) => c.id !== id))}
                />
              ))}

              {displayedCourses.length === 0 && (
                <p className="text-center text-textc/70 w-full py-6">
                  {t("noCourses")}
                </p>
              )}
            </div>
          </>
        )}

        {activeStep === 2 && <h2 className="text-3xl text-textc/90">{t("quizzesTitle")}</h2>}
        {activeStep === 3 && <h2 className="text-3xl text-textc/90">{t("exercisesTitle")}</h2>}

        {/* Modal d’ajout de cours */}
        <AddModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={t("addCourseTitle")}
          subtitle={t("addCourseSubtitle")}
          submitLabel={t("createCourse")}
          cancelLabel={t("cancel")}
          onSubmit={handleAddCourse}
         fields={[
  {
    label: t("selectCourseLabel"),
    element: (
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="w-full bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{t("selectCoursePlaceholder")}</option>

        {teacherCourses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
    ),
  },
]}

        />
      </main>
    </div>
  );
}
