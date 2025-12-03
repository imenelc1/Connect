
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
  const { t } = useTranslation("CourseDetails"); // <-- namespace CourseDetails

  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");

  const courseSteps = [
    { label: t("topbar.course"), icon: BookOpen },
    { label: t("topbar.quizzes"), icon: NotebookPen },
    { label: t("topbar.exercises"), icon: FileCheck },
  ];

  const numberOfStudents = 34;
  const [sections, setSections] = useState([
    { id: 1, title: t("sections.intro.title"), description: t("sections.intro.desc"), bg: "bg-grad-2", date: "12/01/2025" },
    { id: 2, title: t("sections.basics.title"), description: t("sections.basics.desc"), bg: "bg-grad-3", date: "12/05/2025" },
    { id: 3, title: t("sections.advanced.title"), description: t("sections.advanced.desc"), bg: "bg-grad-4", date: "12/10/2025" },
  ]);

  const handleAddSection = (e) => {
    e.preventDefault();
    setSections([
      ...sections,
      {
        id: Date.now(),
        title: sectionTitle,
        description: sectionDescription,
        bg: "bg-grad-5",
        date: new Date().toLocaleDateString(),
      },
    ]);
    setSectionTitle("");
    setSectionDescription("");
    setOpenModal(false);
  };

  return (
    <div className="flex w-full">
      <Navbar className="hidden lg:block" />
      <main className="lg:ml-64 w-full min-h-screen px-6 py-6 bg-bg">
        <div className="flex flex-col gap-6 mb-6">
          <button
            className="text-primary/60 font-medium hover:underline w-max flex items-center gap-1"
            onClick={() => navigate("/Spaces")}
          >
            <ArrowLeft size={16} /> {t("backToSpaces")}
          </button>

          <div className="flex justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-semibold text-primary">{t("courseTitle")}</h2>
              <p className="text-textc/75 text-m">{t("courseSubtitle")}</p>
            </div>

            <div className="flex items-center gap-1 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-md text-sm">
              <Users size={16} /> {numberOfStudents} {t("students")}
            </div>
          </div>
        </div>

        <Topbar steps={courseSteps} activeStep={activeStep} setActiveStep={setActiveStep} className="mb-6 flex justify-between" />

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
              {sections.map((section) => (
                <Cards2
                  key={section.id}
                  icon={
                    <UserCircle
                      initials={section.title
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    />
                  }
                  roundedIcon={true}
                  title={section.title}
                  description={section.description}
                  progress={section.progress}
                  status={`${t("createdOn")} ${section.date}`}
                  className={`${section.bg} rounded-xl shadow-md border p-6`}
                />
              ))}
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div>
            <h2 className="text-3xl font-semibold mb-4">{t("quizzesTitle")}</h2>
            <p className="text-textc/80">{t("quizzesSubtitle")}</p>
          </div>
        )}

        {activeStep === 3 && (
          <div>
            <h2 className="text-3xl font-semibold mb-4">{t("exercisesTitle")}</h2>
            <p className="text-textc/80">{t("exercisesSubtitle")}</p>
          </div>
        )}

        <AddModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={t("addSectionTitle")}
          subtitle={t("addSectionSubtitle")}
          submitLabel={t("createSection")}
          onSubmit={handleAddSection}
          fields={[
            { label: t("sectionTitleLabel"), placeholder: t("sectionTitlePlaceholder"), value: sectionTitle, onChange: (e) => setSectionTitle(e.target.value) },
            {
              label: t("sectionDescriptionLabel"),
              element: (
                <textarea
                  placeholder={t("sectionDescriptionPlaceholder")}
                  value={sectionDescription}
                  onChange={(e) => setSectionDescription(e.target.value)}
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
