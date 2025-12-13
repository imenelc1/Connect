import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/common/NavBar";
import Topbar from "../components/common/TopBar";
import AddModal from "../components/common/AddModel";
import Button from "../components/common/Button";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ContentCard from "../components/common/ContentCard";
import ContentFilters from "../components/common/ContentFilters";
import UserCircle from "../components/common/UserCircle";
import {
  ArrowLeft,
  Users,
  Bell,
  BookOpen,
  NotebookPen,
  FileCheck,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";

export default function SpaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation("CourseDetails");

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userRole = userData?.role || "";
  const initials = `${userData?.nom?.[0] || ""}${
    userData?.prenom?.[0] || ""
  }`.toUpperCase();

  const [spaceName, setSpaceName] = useState("");
  const [studentsCount, setStudentsCount] = useState(0);
  const [spaceCourses, setSpaceCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeStep, setActiveStep] = useState(1);
  const [openModal, setOpenModal] = useState(false);

  const steps = [
    { label: t("topbar.course"), icon: BookOpen },
    { label: t("topbar.quizzes"), icon: NotebookPen },
    { label: t("topbar.exercises"), icon: FileCheck },
  ];

  const gradientMap = {
    Débutant: "bg-grad-2",
    Intermédiaire: "bg-grad-3",
    Avancé: "bg-grad-4",
  };

  // --- fetch space details ---
  useEffect(() => {
    if (!id) return;
    fetch(`http://127.0.0.1:8000/api/spaces/${id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSpaceName(data.nom_space || "My space");
        setStudentsCount(data.students_count || 0);
      })
      .catch((err) => console.error("Failed to load space details:", err));
  }, [id]);

  // --- fetch space courses ---
  useEffect(() => {
    if (!id) return;
    fetch(`http://127.0.0.1:8000/api/spaces/${id}/courses/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data || [])
          .filter((sc) => sc.cours)
          .map((sc) => ({
            id: sc.cours.id_cours,
            title: sc.cours.titre_cour || "",
            description: sc.cours.description || "",
            level: sc.cours.niveau_cour_label || "",
            author: sc.cours.utilisateur_name || "",
            date: sc.cours.date_ajout || "",
            isMine: sc.cours.utilisateur_id === userData?.id,
          }));
        setSpaceCourses(formatted);
      })
      .catch((err) => console.error("Failed to fetch space courses:", err));
  }, [id, userData?.id]);

  // --- fetch all courses of the prof ---
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/my-courses/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data || []).map((c) => ({
          id: c.id_cours,
          title: c.titre_cour,
          description: c.description,
          level: c.niveau_cour_label,
          author: c.utilisateur_name,
          date: c.date_ajout,
        }));
        setMyCourses(formatted);
      })
      .catch((err) => console.error("Failed to fetch my courses:", err));
  }, []);

  const handleAddCourse = (selectedCourseId) => {
    if (!selectedCourseId) return;
    fetch(`http://127.0.0.1:8000/api/spaces/${id}/courses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ cours: selectedCourseId }),
    })
      .then((res) => res.json())
      .then((newCourse) => {
        setSpaceCourses([
          ...spaceCourses,
          {
            id: newCourse.cours.id_cours,
            title: newCourse.cours.titre_cour,
            description: newCourse.cours.description,
            level: newCourse.cours.niveau_cour_label,
            author: newCourse.cours.utilisateur_name,
            date: newCourse.cours.date_ajout,
            isMine: true,
          },
        ]);
        setOpenModal(false);
      })
      .catch((err) => console.error("Failed to add course:", err));
  };

  // --- filtered courses ---
  const filteredCourses = spaceCourses
    .filter((c) => filterLevel === "ALL" || c.level === filterLevel)
    .filter(
      (c) => userRole !== "enseignant" || categoryFilter !== "mine" || c.isMine
    )
    .filter((c) => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex w-full bg-surface min-h-screen">
      <Navbar />
      <main className="lg:ml-64 w-full min-h-screen px-6 py-6 bg-bg">
        {/* Back + User */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="text-muted font-medium hover:underline flex items-center gap-1"
            onClick={() => navigate("/Spaces")}
          >
            <ArrowLeft size={16} /> {t("backToSpaces")}
          </button>
          <div className="flex gap-4 items-center">
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

        {/* Space Info + Students */}
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-4xl font-semibold text-muted">{spaceName}</h2>
          <div className="w-full md:w-[400px]">
            <ContentSearchBar
              placeholder={t("searchCourses")}
              onChange={setSearchTerm}
            />
          </div>
          <div className="flex items-center gap-2 bg-card text-muted font-semibold px-4 py-2 rounded-md">
            <Users size={16} /> {studentsCount} {t("students")}
          </div>
        </div>

        {/* Steps */}
        <Topbar
          steps={steps}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          className="my-6 flex justify-between items-center"
        />

        {/* Filters + Add Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <ContentFilters
            type="courses"
            userRole={userRole}
            activeFilter={filterLevel}
            onFilterChange={setFilterLevel}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            showCompletedFilter={false}
          />

          {userRole === "enseignant" && (
            <Button
              variant="courseStart"
              className="w-full sm:w-50 md:w-40 lg:w-70 h-10 md:h-12 lg:h-10 mt-4 sm:mt-0 bg-grad-1 text-white transition-all flex items-center gap-2 justify-center whitespace-nowrap"
              onClick={() => setOpenModal(true)}
            >
              <Plus size={18} />
              {t("addCourseTitle")}
            </Button>
          )}
        </div>

        {/* Courses List */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <ContentCard
              key={course.id}
              course={{
                ...course,
                initials:
                  course.author?.[0] + course.author?.split(" ")[1]?.[0] || "",
                duration: course.date ? "Created on " + course.date : "",
                isMine: course.isMine,
                progress: 0,
              }}
              role={userRole}
              showProgress={false}
              className={gradientMap[course.level] ?? "bg-grad-1"}
              onDelete={(id) =>
                setSpaceCourses(spaceCourses.filter((c) => c.id !== id))
              }
              onClick={() => navigate(`/courses/${course.id}`)}
            />
          ))}
        </div>

        {/* Add Modal */}
        {openModal && (
          <AddModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            title={t("addCourseTitle")}
            subtitle={t("addCourseSubtitle")}
            fields={[
              {
                label: t("selectCourseLabel"),
                element: (
                  <select
                    className="w-full bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) => handleAddCourse(e.target.value)}
                    defaultValue=""
                  >
                    <option value="">{t("selectCoursePlaceholder")}</option>
                    {myCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                ),
              },
            ]}
          />
        )}
      </main>
    </div>
  );
}
