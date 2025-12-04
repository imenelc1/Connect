
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/NavBar.jsx";
import Topbar from "../components/common/TopBar.jsx";
import Cards2 from "../components/common/Cards2.jsx";
import Button from "../components/common/Button.jsx";
import AddModal from "../components/common/AddModel.jsx";
import UserCircle from "../components/common/UserCircle.jsx";
import { BookOpen, NotebookPen, FileCheck, ArrowLeft, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CourseDetails() {
  const { t } = useTranslation("CourseDetails"); // namespace CourseDetails
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");

  const courseSteps = [
    { label: t("topbar.course"), icon: BookOpen },
    { label: t("topbar.quizzes"), icon: NotebookPen },
    { label: t("topbar.exercises"), icon: FileCheck },
  ];

  const numberOfStudents = 34;

  // Liste des cours
  const [courses, setCourses] = useState([
    { id: 1, title: "Introduction to Design Patterns", description: "Mobile design patterns", bg: "bg-grad-2", date: "12/01/2025" },
    { id: 2, title: "Design Patterns Basics", description: "Mobile design patterns", bg: "bg-grad-3", date: "12/05/2025" },
    { id: 3, title: "Advanced Patterns", description: "Mobile design patterns", bg: "bg-grad-4", date: "12/10/2025" },
  ]);

  // Ajouter un nouveau cours
  const handleAddCourse = (e) => {
    e.preventDefault();
    setCourses([
      ...courses,
      {
        id: Date.now(),
        title: courseTitle,
        description: courseDescription,
        bg: "bg-grad-5",
        date: new Date().toLocaleDateString(),
      },
    ]);
    setCourseTitle("");
    setCourseDescription("");
    setOpenModal(false);
  };

  return (
    <div className="flex w-full">
      <Navbar className="hidden lg:block" />
      <main className="lg:ml-64 w-full min-h-screen px-6 py-6 bg-bg">

        {/* Bouton retour */}
        <div className="flex flex-col gap-6 mb-6">
          <button
            className="text-primary/60 font-medium hover:underline w-max flex items-center gap-1"
            onClick={() => navigate("/Spaces")}
          >
            <ArrowLeft size={16} /> {t("backToSpaces")}
          </button>

          <div className="flex justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-semibold text-primary">Mobile Design Patterns</h2>
              <p className="text-textc/75 text-m">Learn mobile design fundamentals</p>
            </div>

            <div className="flex items-center gap-1 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-md text-sm">
              <Users size={16} /> {numberOfStudents} {t("students")}
            </div>
          </div>
        </div>

        <Topbar steps={courseSteps} activeStep={activeStep} setActiveStep={setActiveStep} className="mb-6 flex justify-between" />

        {/* Affichage selon l'étape active */}
        {activeStep === 1 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl text-textc/90 font-regular">{t("coursesTitle")}</h1>
              <Button
                variant="primary"
                className="!px-4 !py-2 !text-white !w-auto sm:!w-auto"
                onClick={() => setOpenModal(true)}
              >
                + {t("addCourse")}
              </Button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {courses.map((course) => (
                <Cards2
                  key={course.id}
                  icon={
                    <UserCircle
                      initials={course.title
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    />
                  }
                  roundedIcon={true}
                  title={course.title}
                  description={course.description}
                  progress={course.progress}
                  status={`${t("createdOn")} ${course.date}`}
                  className={`${course.bg} rounded-xl shadow-md border p-6`}
                />
              ))}
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div>
            <h2 className="text-3xl font-regular mb-4">{t("quizzesTitle")}</h2>
            <p className="text-textc/80"></p>
          </div>
        )}

        {activeStep === 3 && (
          <div>
            <h2 className="text-3xl font-regular mb-4">{t("exercisesTitle")}</h2>
            <p className="text-textc/80"></p>
          </div>
        )}

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
            { label: t("courseTitleLabel"), placeholder: t("courseTitlePlaceholder"), value: courseTitle, onChange: (e) => setCourseTitle(e.target.value) },
            {
              label: t("courseDescriptionLabel"),
              element: (
                <textarea
                  placeholder={t("courseDescriptionPlaceholder")}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={4}
                />
              ),
            },
          ]}
        />
      </main>
    </div>
  );
}
