import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/Navbar";
import Input from "../components/common/Input";
import Topbar from "../components/common/TopBar";
import { Trash2, ChevronUp } from "lucide-react";
import ThemeContext from "../context/ThemeContext";
import ThemeButton from "../components/common/ThemeButton";
import Select from "../components/common/Select";
import { Globe } from "lucide-react";
import { Monitor, BookOpenCheck, CheckCircle } from "lucide-react";
import { getCurrentUserId } from "../hooks/useAuth";
import api from "../services/courseService";

export default function CoursePage() {
  const { t, i18n } = useTranslation("courseInfo");
  const [activeStep, setActiveStep] = useState(1);
  const { toggleDarkMode } = useContext(ThemeContext);

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const courseSteps = [
    { label: t("course.basic_info"), icon: Monitor },
    { label: t("course.curriculum"), icon: BookOpenCheck },
    { label: t("course.publish_title"), icon: CheckCircle },
  ];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [currentCoursId, setCurrentCoursId] = useState(null);

  const [sections, setSections] = useState([
    {
      id: 1,
      title: "",
      open: true,
      lessons: [{ id: 1, title: "" }],
    },
  ]);

  // --- Gestion des sections et leçons ---
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        open: true,
        lessons: [{ id: Date.now(), title: "" }],
      },
    ]);
  };

  const toggleSection = (id) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, open: !s.open } : s))
    );
  };

  const updateSectionTitle = (id, newTitle) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const addLessonToSection = (sectionId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: [...s.lessons, { id: Date.now(), title: "" }] }
          : s
      )
    );
  };

  const updateLessonTitle = (sectionId, lessonId, newTitle) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === lessonId ? { ...l, title: newTitle } : l
              ),
            }
          : s
      )
    );
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const removeLesson = (sectionId, lessonId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
          : s
      )
    );
  };

  // --- Sauvegarde ---
  const handleSaveStep1 = async () => {
    const token = localStorage.getItem("access_token");
    const currentUserId = getCurrentUserId();

    if (!token || !currentUserId) {
      alert("Utilisateur non connecté");
      return null;
    }

    try {
      const res = await api.post(
        "courses/create/",
        {
          titre_cour: title,
          description,
          duration,
          niveau_cour: level,
          utilisateur: currentUserId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const coursId = res.data.id_cours;
      setCurrentCoursId(coursId);
      return coursId;
    } catch (err) {
      console.error("Erreur création cours :", err.response?.data || err.message);
      alert("Erreur lors de la création du cours");
      return null;
    }
  };

  const handleSaveAllSections = async (coursId) => {
    const token = localStorage.getItem("access_token");
    const currentUserId = getCurrentUserId();

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.title.trim()) {
        alert(`Le titre de la section ${i + 1} ne peut pas être vide`);
        return;
      }

      // Création section
      const sectionRes = await api.post(
        "courses/createSection/",
        {
          cours: coursId,
          titre_section: section.title,
          utilisateur: currentUserId,
          ordre: i + 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sectionId = sectionRes.data.id_section;

      // Création leçons
      for (let j = 0; j < section.lessons.length; j++) {
        const lesson = section.lessons[j];
        if (!lesson.title.trim()) continue;

        await api.post(
          "courses/createLesson/",
          {
            section: sectionId,
            titre_lecon: lesson.title,
            utilisateur: currentUserId,
            ordre: j + 1,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    }
  };

  const handleSaveAll = async () => {
    try {
      const coursId = await handleSaveStep1();
      if (!coursId) return;

      await handleSaveAllSections(coursId);
      setActiveStep(3);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement complet :", error);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-primary/5">
      <div className="hidden lg:block w-64 min-h-screen">
        <Navbar />
      </div>

      <div className="flex-1 flex flex-col p-4 lg:p-8 gap-6 ">
        <div className="w-full flex justify-between items-center mb-4">
          <ThemeButton onClick={toggleDarkMode} />
          <div onClick={toggleLanguage}>
            <Globe size={16} />
          </div>
        </div>

        <Topbar
          steps={courseSteps}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          className="flex justify-between"
        />

        {/* STEP 1 */}
        {activeStep === 1 && (
          <div className="w-full bg-grad-2 rounded-2xl shadow-md p-6 lg:p-10">
            <h2 className="text-2xl font-semibold mb-6 text-grad-1">
              {t("course.basic_info")}
            </h2>
            <div className="flex flex-col mb-6">
              <label className="font-medium mb-2 textc">{t("course.title")}</label>
              <Input
                placeholder={t("course.course_title_placeholder")}
                className="text-black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col mb-6">
              <label className="font-medium mb-2">{t("course.course_topic")}</label>
              <textarea
                className="w-full min-h-[180px] border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2"
                placeholder={t("course.course_topic_placeholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="flex flex-col ">
                <Input
                  label={t("course.duration")}
                  placeholder={t("course.duration_placeholder")}
                  className="w-full "
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium mb-2">{t("course.level")}</label>
                <Select
                  className="w-full rounded-full border border-grayc px-5 py-3 bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  options={[
                    { value: "", label: t("select.placeholder") },
                    { value: "debutant", label: t("select.Beginner") },
                    { value: "intermediaire", label: t("select.Intermediate") },
                    { value: "avance", label: t("select.Advanced") },
                  ]}
                />
              </div>
            </div>
            <div className="flex justify-between mt-10 ">
              <button className="px-6 py-2 rounded-xl border border-secondary font-medium bg-white shadow-sm transition text-black/50">
                {t("course.cancel")}
              </button>
              <button
                className="px-6 py-2 rounded-xl bg-grad-1 text-white font-medium"
                onClick={() => setActiveStep(2)}
              >
                {t("course.save_next")}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {activeStep === 2 && (
          <div className="w-full p-6">
            <div className="mt-6 relative bg-gradient-to-br from-grad-2/60 to-grad-2 rounded-2xl backdrop-blur-xl shadow-xl p-6 lg:p-10 border border-white/10">
              <div className="absolute right-8 top-8">
                <button
                  className="px-6 py-2 rounded-xl bg-grad-1 text-white shadow-lg hover:shadow-xl transition-transform hover:-translate-y-0.5"
                  onClick={addSection}
                >
                  + {t("course.add_section")}
                </button>
              </div>
              <h1 className="text-3xl font-semibold mb-6 tracking-tight text-textc">
                {t("course.curriculum")}
              </h1>

              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="bg-surface backdrop-blur-xl rounded-2xl p-5 shadow-inner border border-white/20 transition hover:border-primary/30 mb-6"
                >
                  <div className="flex items-center gap-4 mb-4 bg-transparent">
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-grad-1 text-white font-semibold">
                      {index + 1}
                    </div>

                    <Input
                      value={section.title}
                      onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                      placeholder={t("course.section_title_placeholder")}
                      className="!bg-transparent !border-none px-2 text-textc font-medium"
                    />

                    <div className="ml-auto flex items-center gap-2 text-muted">
                      <button
                        className="hover:text-primary transition-transform"
                        onClick={() => toggleSection(section.id)}
                      >
                        <ChevronUp
                          size={20}
                          strokeWidth={1.7}
                          className={`transition-transform duration-300 ${
                            section.open ? "" : "rotate-180"
                          }`}
                        />
                      </button>
                      <button
                        className="hover:text-red-500 transition-colors"
                        onClick={() => removeSection(section.id)}
                      >
                        <Trash2 size={20} strokeWidth={1.7} />
                      </button>
                    </div>
                  </div>

                  {section.open &&
                    section.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 rounded-xl p-4 bg-grad-3 border border-gray-200/50 shadow-sm hover:shadow-md transition-all mb-2"
                      >
                        <div className="text-sm font-medium w-6 text-textc">{idx + 1}.</div>
                        <Input
                          value={lesson.title}
                          onChange={(e) =>
                            updateLessonTitle(section.id, lesson.id, e.target.value)
                          }
                          className="!bg-transparent !border-none text-textc"
                        />
                        <div className="flex items-center gap-3 ml-auto">
                          <Select
                            options={[{ value: "type", label: t("course.lesson_type") }]}
                          />
                          <button
                            onClick={() => removeLesson(section.id, lesson.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={20} strokeWidth={1.8} />
                          </button>
                        </div>
                      </div>
                    ))}

                  <div className="flex justify-center mt-3">
                    <button
                      onClick={() => addLessonToSection(section.id)}
                      className="w-1/2 rounded-xl border py-2 bg-primary text-white font-medium hover:bg-primary/90 transition"
                    >
                      + {t("course.add_lesson")}
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-10 flex items-center justify-between">
                <button
                  className="px-8 py-2 rounded-xl bg-white dark:bg-white/10 shadow-sm font-medium text-black/60 dark:text-white/70 hover:shadow-md transition"
                  onClick={() => setActiveStep(1)}
                >
                  {t("course.back")}
                </button>
                <button
                  className="px-8 py-2 rounded-xl bg-grad-1 text-white font-medium shadow-lg hover:shadow-xl transition-transform hover:-translate-y-0.5"
                  onClick={handleSaveAll}
                >
                  {t("course.save_next")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {activeStep === 3 && (
          <div className="w-full bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold">Publish Course</h2>
          </div>
        )}
      </div>
    </div>
  );
}
