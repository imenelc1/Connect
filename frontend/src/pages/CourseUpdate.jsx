import React, { useState, useContext } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, ChevronUp } from "lucide-react";
import { Monitor, BookOpenCheck, CheckCircle } from "lucide-react";
import { FolderPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { getCurrentUserId } from "../hooks/useAuth";
import ThemeContext from "../context/ThemeContext";

//les composants utilisés
import Navbar from "../components/common/Navbar";
import Input from "../components/common/Input";
import Topbar from "../components/common/TopBar";
import Select from "../components/common/Select";
import ModernDropdown from "../components/common/ModernDropdown";
import UserCircle from "../components/common/UserCircle";

//services api utilisé
import api from "../services/courseService";







export default function CourseUpdate() {
  const { t, i18n } = useTranslation("courseInfo"); //traduction
  const [activeStep, setActiveStep] = useState(1); //les etpaes de la modifications
  const { toggleDarkMode } = useContext(ThemeContext); //changer le theme
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); //sidebar reduite ou non
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); //detection mobile

  //====== HANDLE RESIZE==========
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);


  const navigate = useNavigate(); //pour la navigation, redirecton
  //changer la langue
  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  //definition des etapes da la modifcation du cours
  const courseSteps = [
    { label: t("course.basic_info"), icon: Monitor },
    { label: t("course.curriculum"), icon: BookOpenCheck },
    { label: t("course.publish_title"), icon: CheckCircle },
  ];
  const { id: coursId } = useParams(); //recuperer l'id du cours depuis l'url
  //=====STATS===
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [currentCoursId, setCurrentCoursId] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user")); //recuperer l'utilisateur
  const userRole = userData?.user?.role ?? userData?.role;

  //generation d'un ID temporaire pour les nouvelle sections ou leçons
  const generateTempId = () => `temp-${Date.now()}-${Math.random()}`;
  const isTempId = (id) => typeof id === "string" && id.startsWith("temp-");


  //==============FETCH course =====
  useEffect(() => {
    if (!coursId) return;

    const fetchCourse = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await api.get(`courses/courses/${coursId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setTitle(data.titre_cour);
        setDescription(data.description);
        setDuration(data.duration);
        setLevel(data.niveau_cour);
        //transformer les sections et leçons pour l'etat local
        const fetchedSections = (data.sections || []).map((sec) => ({
          id: sec.id_section,
          title: sec.titre_section,
          description: sec.description || "",
          open: true,
          lessons: (sec.lecons || []).map((lec) => ({
            id: lec.id_lecon,
            title: lec.titre_lecon,
            content: lec.contenu_lecon,
            type: lec.type_lecon,
            preview: lec.type_lecon === "image"
              ? `http://localhost:8000/media/${lec.contenu_lecon.replace(/\\/g, "/")}`
              : null
          })),
        }));

        setSections(fetchedSections);
      } catch (err) {
        console.error(
          `${t("course.error_loading_course")} :`,
          err.response?.data?.message || err.message || err
        );
      }
    };

    fetchCourse();
  }, [coursId]);


  //initials pour l'auteur du cours
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""
    }`.toUpperCase();

  //les sections
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "",
      description: "", // ⭐ AJOUTÉ
      open: true,
      lessons: [{ id: 1, title: "", content: "" }], // ⭐ AJOUTÉ
    },
  ]);

  // --- Gestion des sections et leçons ---
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: null,
        title: "",
        open: true,
        lessons: [{ id: null, title: "" }],
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

  const updateSectionDescription = (id, newDesc) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, description: newDesc } : s))
    );
  };

  const addLessonToSection = (sectionId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
            ...s,
            lessons: [
              ...s.lessons,
              {
                id: generateTempId(),
                title: "",
                content: "",
                type: "text",
              },
            ],
          }
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

  const updateLessonContent = (sectionId, lessonId, newContent) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
            ...s,
            lessons: s.lessons.map((l) =>
              l.id === lessonId ? { ...l, content: newContent } : l
            ),
          }
          : s
      )
    );
  };

  const updateLessonType = (sectionId, lessonId, newType) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
            ...s,
            lessons: s.lessons.map((l) =>
              l.id === lessonId
                ? {
                  ...l,
                  type: newType,
                  content: newType !== "image" ? l.content || "" : "",
                  imageFile: newType === "image" ? l.imageFile : null,
                  preview: newType === "image" ? l.preview : null,
                }
                : l
            ),
          }
          : s
      )
    );
  };


  //supprimer section
  const removeSection = async (id) => {

    const confirmDelete = window.confirm(t("course.confirm_delete_section"));
    if (!confirmDelete) return;
    const token = localStorage.getItem("token");

    try {
      // Appel API pour supprimer la section
      await api.delete(`courses/sections/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Puis mettre à jour le state
      setSections((prev) => prev.filter((s) => s.id !== id));

      toast.success(t("course.section_deleted_success"));
    } catch (err) {
      console.error(
        `${t("course.error_delete_section")} :`,
        err.response?.data?.message || err.message || err
      );
      toast.error(t("course.error_cannot_delete_section"));

    }
  };

  //supprimer leçon
  const removeLesson = async (sectionId, lessonId) => {
    const confirmDelete = window.confirm(t("course.confirm_delete_lesson"));
    if (!confirmDelete) return;
    const token = localStorage.getItem("token");

    try {
      // Appel API pour supprimer la leçon
      await api.delete(`courses/lecons/${lessonId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Puis mettre à jour le state
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
            : s
        )
      );

      toast.success(t("course.lesson_deleted_success"));
    } catch (err) {
      console.error(
        `${t("course.error_delete_lesson")} :`,
        err.response?.data?.message || err.message || err
      );
      toast.error(t("course.error_cannot_delete_lesson"));
    }
  };

  // L'image d'une leçon
  const handleLessonImageUpload = (sectionId, lessonId, file) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
            ...s,
            lessons: s.lessons.map((l) =>
              l.id === lessonId
                ? {
                  ...l,
                  imageFile: file,
                  preview: URL.createObjectURL(file),
                }
                : l
            ),
          }
          : s
      )
    );
  };

  //======ENREGESTRER les modifications du cours , ses sections et leçons
  const handleSaveCourse = async (coursId) => {
    const currentUserId = getCurrentUserId();
    const token = localStorage.getItem("token");

    try {
      // --- Étape 1 : Mettre à jour le cours ---
      await api.put(
        `courses/${coursId}/`,
        {
          utilisateur: currentUserId,
          titre_cour: title,
          description,
          duration,
          niveau_cour: level,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // --- Étape 2 : Créer / Mettre à jour toutes les sections d'abord ---
      for (const section of sections) {
        if (!section.id) {
          const resSection = await api.post(
            "courses/createSection/",
            {
              titre_section: section.title,
              description: section.description,
              ordre: sections.indexOf(section) + 1,
              cours: coursId,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          section.id = resSection.data.id;
        } else {
          await api.put(
            `courses/sections/${section.id}/`,
            {
              titre_section: section.title,
              description: section.description,
              ordre: sections.indexOf(section) + 1,
              cours: coursId,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      // --- Étape 3 : Créer / Mettre à jour toutes les leçons ---
      for (const section of sections) {
        const sectionId = section.id;

        for (const lesson of section.lessons) {
          const ordre = section.lessons.indexOf(lesson) + 1;


          // FormData pour image
          const formData = new FormData();
          formData.append("section", sectionId);
          formData.append("titre_lecon", lesson.title);
          formData.append("type_lecon", lesson.type);
          formData.append("ordre", ordre);
          formData.append("contenu_lecon", lesson.content);
          if (lesson.type === "image" && lesson.imageFile) {
            formData.append("image_lecon", lesson.imageFile);
          }


          if (lesson.id && !isTempId(lesson.id)) {
            // 🔵 Leçon EXISTANTE → UPDATE
            await api.put(`courses/Lesson/${lesson.id}/`, formData, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } else {
            // 🟢 Nouvelle leçon → CREATE
            const resLesson = await api.post("courses/createLesson/", formData, {
              headers: { Authorization: `Bearer ${token}` },
            });
            lesson.id = resLesson.data.id_lecon; // remplace l’id temporaire
          }


        }

      }

      toast.success(t("course.course_updated_success"));
      setActiveStep(3)
    } catch (err) {
      console.error(
        `${t("course.error_update_course")} :`,
        err.response?.data?.message || err.message || err
      );
      toast.error(t("course.error_cannot_update_course"));
    }
  };










  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      {/* Main Content */}
      <main className={`
            flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen
            ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
          `}>
        {/* User controls */}
        <div className="flex justify-end items-center gap-4">
          <UserCircle
            initials={initials}
            onToggleTheme={toggleDarkMode}
            onChangeLang={(lang) => i18n.changeLanguage(lang)}
          />
        </div>

        {/* Topbar avec étapes */}
        <Topbar
          steps={courseSteps}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          className="flex justify-between"
        />
        {/* STEP 1  : les infos generale du cours*/}
        {activeStep === 1 && (
          <div className="w-full bg-grad-2 rounded-2xl shadow-md p-6 lg:p-10">
            <h2 className="text-2xl font-semibold mb-6 text-grad-1">
              {t("course.basic_info")}
            </h2>

            {/* Title */}
            <div className="flex flex-col mb-6">
              <label className="font-medium mb-2 textc">{t("course.title")}</label>
              <Input
                placeholder={t("course.course_title_placeholder")}
                className="bg-card dark:bg-surface text-text dark:text-text border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col mb-6">
              <label className="font-medium mb-2">{t("course.course_topic")}</label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-card dark:bg-surface text-text dark:text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("course.course_topic_placeholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Duration & Level */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Input
                label={t("course.duration")}
                placeholder={t("course.duration_placeholder")}
                className="w-full"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
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

            {/* Buttons */}
            <div className="flex justify-between mt-10">
              <button
                className="px-6 py-2 rounded-xl border border-secondary font-medium bg-white shadow-sm transition text-black/50"
                onClick={() => navigate("/all-courses")}
              >
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

        {/* STEP 2  : les sections et leçons*/}
        {activeStep === 2 && (
          <div className="w-full p-5">
            <div className="mt-6 relative bg-gradient-to-br from-grad-2/60 to-grad-2 rounded-2xl backdrop-blur-xl shadow-xl p-6 lg:p-10 border border-white/10">
              <div className="absolute right-8 top-8">
                {/*button pour ajouter une section*/}
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
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col w-full gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-grad-1 text-white font-semibold">
                          {index + 1}
                        </div>

                        {/*titre de la section */}
                        <Input
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          placeholder={t("course.section_title_placeholder")}
                          className="!bg-transparent !border-none px-2 text-textc font-medium"
                        />
                        <div className="flex gap-2 ml-auto">
                          <button
                            className="hover:text-primary transition-transform"
                            onClick={() => toggleSection(section.id)}
                          >
                            <ChevronUp
                              size={20}
                              strokeWidth={1.7}
                              className={`${section.open ? "" : "rotate-180"} transition-transform duration-300`}
                            />
                          </button>
                          {/*Supprimer une section */}
                          <button
                            className="hover:text-red-500 transition-colors"
                            onClick={() => removeSection(section.id)}
                          >
                            <Trash2 size={20} strokeWidth={1.7} />
                          </button>
                        </div>
                      </div>
                      {/*description de la section */}
                      <textarea
                        className="w-full mt-2 min-h-[80px] border border-gray-300 rounded-xl p-3"
                        placeholder={t("course.section_description_placeholder")}
                        value={section.description}
                        onChange={(e) => updateSectionDescription(section.id, e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Lessons */}
                  {section.open &&
                    section.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex flex-col gap-2 rounded-xl p-4 bg-grad-3 border border-gray-200/50 shadow-sm hover:shadow-md transition-all mb-4"
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                          <div className="text-sm font-medium w-6 text-textc">{idx + 1}.</div>
                          {/* titre de la leçon */}
                          <Input
                            placeholder={t("course.lesson_title")}
                            value={lesson.title}
                            onChange={(e) => updateLessonTitle(section.id, lesson.id, e.target.value)}
                            className="!bg-transparent !border-none text-textc flex-1"
                          />
                          {/*type de la leçon */}
                          <div className="flex justify-end gap-4 flex-wrap md:flex-nowrap">
                            <ModernDropdown
                              value={lesson.type}
                              placeholder="type"
                              onChange={(value) => updateLessonType(section.id, lesson.id, value)}
                              options={[
                                { value: "text", label: t("course.text") },
                                { value: "image", label: t("course.image") },
                                { value: "example", label: t("course.example") },
                              ]}
                            />
                            <button
                              onClick={() => removeLesson(section.id, lesson.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={20} strokeWidth={1.8} />
                            </button>
                          </div>
                        </div>

                        {/* Conditional Lesson Content */}
                        {(lesson.type === "text" || lesson.type === "example") && (
                          <textarea
                            className="w-full min-h-[100px] border border-gray-300 rounded-xl p-3"
                            placeholder={t("course.lesson_content")}
                            value={lesson.content}
                            onChange={(e) => updateLessonContent(section.id, lesson.id, e.target.value)}
                          />
                        )}
                        {/*les images(type =image) */}
                        {lesson.type === "image" && (
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor={`file-${section.id}-${lesson.id}`}
                              className="cursor-pointer w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed hover:bg-gray-200 transition"
                            >
                              {lesson.preview ? (
                                <img
                                  src={lesson.preview}
                                  alt="preview"
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <FolderPlus />
                              )}
                            </label>
                            <input
                              id={`file-${section.id}-${lesson.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleLessonImageUpload(section.id, lesson.id, e.target.files[0])}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  {/* ajouter leçon */}
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => addLessonToSection(section.id)}
                      className="px-4 py-2 w-full sm:w-auto rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition"
                    >
                      + {t("course.add_lesson")}
                    </button>
                  </div>
                </div>
              ))}

              {/* Navigation */}
              <div className="mt-10 flex items-center justify-between">
                {/*retour aux info generale du cours */}
                <button
                  className="px-8 py-2 rounded-xl bg-white dark:bg-white/10 shadow-sm font-medium text-black/60 dark:text-white/70 hover:shadow-md transition"
                  onClick={() => setActiveStep(1)}
                >
                  {t("course.back")}
                </button>
                {/*Enregistrer les modifications */}
                <button
                  className="px-8 py-2 rounded-xl bg-grad-1 text-white font-medium shadow-lg hover:shadow-xl transition-transform hover:-translate-y-0.5"
                  onClick={() => handleSaveCourse(coursId)}
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
            <h2 className="text-xl font-semibold">{t("course.publish_description")}</h2>
          </div>
        )}
      </main>
    </div>
  );
}
