import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/NavBar";
import Input from "../components/common/Input";
import Topbar from "../components/common/TopBar";
import { Trash2, ChevronUp } from "lucide-react";
import ThemeContext from "../context/ThemeContext";
import Select from "../components/common/Select";
import { FolderPlus } from "lucide-react";
import { Monitor, BookOpenCheck, CheckCircle } from "lucide-react";
import { getCurrentUserId } from "../hooks/useAuth";
import api from "../services/courseService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ModernDropdown from "../components/common/ModernDropdown";
import UserCircle from "../components/common/UserCircle";
import { useEffect } from "react";
export default function CoursePage() {
  const navigate = useNavigate();

  const { t, i18n } = useTranslation("courseInfo");
  const { toggleDarkMode } = useContext(ThemeContext);

  // --- Auth States ---
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);

  // --- Read localStorage ONCE ---
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const rawUserData = localStorage.getItem("user");

    if (!storedToken || !rawUserData) {
      window.location.replace("/login/instructor");
      return;
    }

    try {
      const parsedUser = JSON.parse(rawUserData);
      setToken(storedToken);
      setUserData(parsedUser);
      setIsAuthenticated(true);
    } catch (e) {
      window.location.replace("/login/instructor");
    } finally {
      setAuthLoading(false);
    }
  }, []);



  // user data
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""
    }`.toUpperCase();
  const currentUserId = userData?.id_utilisateur;
  const userRole = userData?.role;


  // --- Step management ---
  const [activeStep, setActiveStep] = useState(1);

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  const courseSteps = [
    { label: t("course.basic_info"), icon: Monitor },
    { label: t("course.curriculum"), icon: BookOpenCheck },
    { label: t("course.publish_title"), icon: CheckCircle },
  ];
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  useEffect(() => {
    setDuration(`${hours}:${minutes}:${seconds}`);
  }, [hours, minutes, seconds]);
  const hourOptions = [...Array(13)].map((_, i) => ({
    value: String(i).padStart(2, "0"),
    label: `${i} h`,
  }));

  const minuteSecondOptions = [...Array(12)].map((_, i) => ({
    value: String(i * 5).padStart(2, "0"),
    label: `${i * 5} min`
  }));


  // --- Course info ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [courseVisibility, setCourseVisibility] = useState("public"); // default

  const [currentCoursId, setCurrentCoursId] = useState(null);

  // --- Sections & lessons ---
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "",
      description: "",
      open: true,
      lessons: [{ id: 1, title: "", content: "" }],
    },
  ]);

  // --- Section management ---
  const addSection = () => {
    setSections(prev => [
      ...prev,
      { id: Date.now(), title: "", description: "", open: true, lessons: [{ id: Date.now(), title: "" }] },
    ]);
  };

  const toggleSection = id => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, open: !s.open } : s));
  };

  const updateSectionTitle = (id, newTitle) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const updateSectionDescription = (id, newDesc) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, description: newDesc } : s));
  };

  const removeSection = id => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  // --- Lesson management ---
  const addLessonToSection = sectionId => {
    setSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, lessons: [...s.lessons, { id: Date.now(), title: "", content: "" }] } : s)
    );
  };

  const updateLessonTitle = (sectionId, lessonId, newTitle) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map(l => l.id === lessonId ? { ...l, title: newTitle } : l) }
          : s
      )
    );
  };

  const updateLessonContent = (sectionId, lessonId, newContent) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map(l => l.id === lessonId ? { ...l, content: newContent } : l) }
          : s
      )
    );
  };

  const removeLesson = (sectionId, lessonId) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s
      )
    );
  };

  const handleLessonImageUpload = (sectionId, lessonId, file) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? {
            ...s,
            lessons: s.lessons.map(l =>
              l.id === lessonId ? { ...l, imageFile: file, preview: URL.createObjectURL(file) } : l
            ),
          }
          : s
      )
    );
  };

  // --- Save course & sections ---
  const handleSaveStep1 = async () => {
    try {
      const res = await api.post(
        "courses/create/",
        {
          titre_cour: title,
          description,
          duration,
          niveau_cour: level,
          utilisateur: currentUserId,
          visibilite_cour: courseVisibility === "private" ? false : true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const coursId = res.data.id_cours;
      setCurrentCoursId(coursId);
      return coursId;
    } catch (err) {
      console.error("Erreur création cours :", err.response?.data || err.message);
      toast.error("Erreur lors de la création du cours");
      return null;
    }
  };

  const handleSaveAllSections = async courseId => {
    try {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        // Création section
        const sectionRes = await api.post(
          "courses/createSection/",
          {
            cours: courseId,
            titre_section: section.title || `Section ${i + 1}`,
            description: section.description || "",
            ordre: i + 1,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const sectionId = sectionRes.data.id;

        // Création leçons
        for (let j = 0; j < section.lessons.length; j++) {
          const lesson = section.lessons[j];
          const lessonType = lesson.type || "text";

          const formData = new FormData();
          formData.append("section", sectionId);
          formData.append("titre_lecon", lesson.title || `Leçon ${j + 1}`);
          formData.append("contenu_lecon", lesson.content || "");
          formData.append("utilisateur", currentUserId);
          formData.append("type_lecon", lessonType);
          formData.append("ordre", j + 1);

          if (lessonType === "image" && lesson.imageFile) {
            formData.append("image_lecon", lesson.imageFile);
          }

          await api.post("courses/createLesson/", formData, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          });
        }
      }

      toast.success("Sections et leçons enregistrées !");
      setActiveStep(3);
    } catch (err) {
      console.error("Erreur création sections/leçons :", err.response?.data || err);
      toast.error("Erreur lors de l’enregistrement.");
    }
  };

  const handleSaveAll = async () => {
    try {
      const coursId = await handleSaveStep1();
      if (!coursId) return;

      await handleSaveAllSections(coursId); // ✅ passe le bon id
      navigate("/all-courses");

    } catch (error) {
      console.error("Erreur lors de l'enregistrement complet :", error);
    }
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);
  if (authLoading) {
    return <div style={{ padding: 20 }}>Checking authentication...</div>;
  }

  // --- Security check ---
  if (!isAuthenticated || !userData) {
    return <div style={{ padding: 20 }}>Not authenticated...</div>;
  }


  return (
    <div className="w-full min-h-screen  bg-surface">

      <div className="flex-shrink-0 w-14 sm:w-16 md:w-48">
        <Navbar />
      </div>

      <div className={`
        p-6 pt-10 min-h-screen text-textc transition-all duration-300 space-y-5
        ${sidebarCollapsed ? "ml-20" : "ml-64"}
      `}>
        <div className="flex justify-end">
          <UserCircle
            initials={initials}
            onToggleTheme={toggleDarkMode}
            onChangeLang={(lang) => i18n.changeLanguage(lang)}
          />
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
              <div className="flex flex-col">
                <label className="font-medium mb-2">{t("course.duration")}</label>
                <div className="flex gap-2">
                  <ModernDropdown
                    value={hours}
                    onChange={setHours}
                    options={hourOptions}
                    placeholder="Heures"
                  />
                  <ModernDropdown
                    value={minutes}
                    onChange={setMinutes}
                    options={minuteSecondOptions.map(o => ({ ...o, label: `${o.value} min` }))}
                    placeholder="Minutes"
                  />
                  <ModernDropdown
                    value={seconds}
                    onChange={setSeconds}
                    options={minuteSecondOptions.map(o => ({ ...o, label: `${o.value} s` }))}
                    placeholder="Secondes"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-2">{t("course.level")}</label>
                <ModernDropdown
                  value={level}
                  onChange={(v) => setLevel(v)}
                  placeholder={t("select.placeholder")}
                  options={[
                    { value: "debutant", label: t("select.Beginner") },
                    { value: "intermediaire", label: t("select.Intermediate") },
                    { value: "avance", label: t("select.Advanced") },
                  ]}
                />

              </div>
              <div className="flex flex-col mt-4">
                <label className="font-medium mb-2">{t("course.visibility")}</label>
                <ModernDropdown
                  value={courseVisibility}
                  onChange={(v) => setCourseVisibility(v)}
                  placeholder={t("course.visibility")}
                  options={[
                    { value: "public", label: t("course.public") },
                    { value: "private", label: t("course.private") },
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
          <div className="w-full p-5">
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col w-full gap-4">
                      <div className="flex flex-col-2 ">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-grad-1 text-white font-semibold">
                          {index + 1}
                        </div>

                        <div className="flex">
                          <Input
                            value={section.title}
                            onChange={(e) =>
                              updateSectionTitle(section.id, e.target.value)
                            }
                            placeholder={t("course.section_title_placeholder")}
                            className="!bg-transparent !border-none px-2 text-textc font-medium"
                          />
                          <div className="flex ml-[500px]">
                            <button
                              className="hover:text-primary transition-transform"
                              onClick={() => toggleSection(section.id)}
                            >
                              <ChevronUp
                                size={20}
                                strokeWidth={1.7}
                                className={`transition-transform duration-300 ${section.open ? "" : "rotate-180"
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
                      </div>
                      <textarea
                        className="w-full mt-2 min-h-[80px] border border-gray-300 rounded-xl p-3"
                        placeholder={t(
                          "course.section_description_placeholder"
                        )}
                        value={section.description}
                        onChange={(e) =>
                          updateSectionDescription(section.id, e.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 text-muted"></div>
                  </div>

                  {section.open &&
                    section.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex flex-col gap-2 rounded-xl p-4 bg-grad-3 border border-gray-200/50 shadow-sm hover:shadow-md transition-all mb-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium w-6 text-textc">{idx + 1}.</div>
                          <Input
                            placeholder={t("course.lesson_title")}
                            value={lesson.title}
                            onChange={(e) =>
                              updateLessonTitle(section.id, lesson.id, e.target.value)
                            }
                            className="!bg-transparent !border-none text-textc flex-1"
                          />
                          <div className="flex ml-[270px] gap-4">
                            <ModernDropdown
                              value={lesson.type}
                              placeholder={"type"}
                              onChange={(value) =>
                                setSections((prev) =>
                                  prev.map((s) =>
                                    s.id === section.id
                                      ? {
                                        ...s,
                                        lessons: s.lessons.map((l) =>
                                          l.id === lesson.id ? { ...l, type: value } : l
                                        ),
                                      }
                                      : s
                                  )
                                )
                              }
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

                        {/* --- Rendu conditionnel selon le type --- */}
                        {lesson.type === "text" && (
                          <textarea
                            className="w-full min-h-[100px] border border-gray-300 rounded-xl p-3"
                            placeholder={t("course.lesson_content")}
                            value={lesson.content}
                            onChange={(e) =>
                              updateLessonContent(section.id, lesson.id, e.target.value)
                            }
                          />
                        )}

                        {lesson.type === "example" && (
                          <textarea
                            className="w-full min-h-[100px] border border-gray-300 rounded-xl p-3"
                            placeholder={t("course.lesson_content")}
                            value={lesson.content}
                            onChange={(e) =>
                              updateLessonContent(section.id, lesson.id, e.target.value)
                            }
                          />
                        )}

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
                              onChange={(e) =>
                                handleLessonImageUpload(section.id, lesson.id, e.target.files[0])
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}


                  <div className="flex justify-center mt-2">
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
                  onClick={() => setActiveStep(3)}
                >
                  {t("course.save_next")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {activeStep === 3 && (
          <div className="w-full flex flex-col items-center gap-10">

            {/* ---------- RÉSUMÉ INFOS GÉNÉRALES ---------- */}
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                {t("course.summary")}
              </h2>

              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>{t("course.title")} :</strong> {title}
                </p>
                <p>
                  <strong>{t("course.course_topic")} :</strong> {description}
                </p>
                <p>
                  <strong>{t("course.duration")} :</strong> {duration}
                </p>
                <p>
                  <strong>{t("course.level")} :</strong> {level}
                </p>
                <p>
                  <strong>{t("course.courseVisibility")} :</strong> {courseVisibility}
                </p>
              </div>
            </div>

            {/* ---------- RÉSUMÉ SECTIONS + LEÇONS ---------- */}
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-8">
              <h3 className="text-xl font-semibold mb-6 text-primary">
                {t("course.curriculum")}
              </h3>

              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="mb-6 pb-4 border-b border-gray-200">

                  <h4 className="text-lg font-semibold text-gray-800">
                    {sectionIndex + 1}. {section.title || t("course.untitled_section")}
                  </h4>

                  {section.description && (
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  )}

                  {/* Leçons */}
                  <div className="mt-4 pl-4 space-y-3">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="bg-gray-50 p-3 rounded-lg border">

                        <p className="font-medium text-gray-800">
                          {lessonIndex + 1}. {lesson.title || t("course.untitled_lesson")}
                        </p>

                        {/* type */}
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {lesson.type}
                        </span>

                        {/* Texte ou exemple */}
                        {(lesson.type === "text" || lesson.type === "example") && (
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                            {lesson.content || t("course.no_content")}
                          </p>
                        )}

                        {/* Image */}
                        {lesson.type === "image" && lesson.preview && (
                          <img
                            src={lesson.preview}
                            alt="Lesson visual"
                            className="w-48 mt-2 rounded-xl border object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ---------- Boutons ---------- */}
            <div className="flex justify-between items-center mt-10 max-w-xl w-full mx-auto">
              <button
                className="px-6 py-2 bg-[#DDE7FF] text-gray-700 rounded-xl text-sm shadow"
                onClick={() => setActiveStep(2)}
              >
                {t("course.back")}
              </button>

              <div className="flex gap-3">


                <button className="px-6 py-2 bg-primary text-white rounded-xl text-sm shadow hover:bg-grad-1" onClick={handleSaveAll}>
                  {t("course.save_publier")}
                </button>
              </div>
            </div>


          </div>
        )}

      </div>
    </div>
  );
}