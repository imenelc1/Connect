import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/Navbar";
import Input from "../components/common/Input";
import Topbar from "../components/common/TopBar";
import { Trash2, ChevronUp } from "lucide-react";
import ThemeContext from "../context/ThemeContext";
import { FolderPlus } from "lucide-react";
import { Monitor, BookOpenCheck, CheckCircle } from "lucide-react";
import api from "../services/courseService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ModernDropdown from "../components/common/ModernDropdown";
import UserCircle from "../components/common/UserCircle";
import NotificationBell from "../components/common/NotificationBell";

export default function CoursePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("courseInfo");
  const { toggleDarkMode } = useContext(ThemeContext);
  
  // États pour la responsivité
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // --- Auth States ---
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);

  // Effet pour la responsivité
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

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
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();
  const currentUserId = userData?.id_utilisateur;
  const userRole = userData?.role;

  // --- Step management ---
  const [activeStep, setActiveStep] = useState(1);

  const courseSteps = [
    { label: t("course.basic_info"), icon: Monitor },
    { label: t("course.curriculum"), icon: BookOpenCheck },
    { label: t("course.publish_title"), icon: CheckCircle },
  ];
  
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [duration, setDuration] = useState("");

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
  const [level, setLevel] = useState("");
  const [courseVisibility, setCourseVisibility] = useState("public");

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
      toast.error("Erreur lors de l'enregistrement.");
    }
  };

  const handleSaveAll = async () => {
    try {
      const coursId = await handleSaveStep1();
      if (!coursId) return;

      await handleSaveAllSections(coursId);
      navigate("/all-courses");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement complet :", error);
    }
  };

  if (authLoading) {
    return <div style={{ padding: 20 }}>Checking authentication...</div>;
  }

  if (!isAuthenticated || !userData) {
    return <div style={{ padding: 20 }}>Not authenticated...</div>;
  }

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
          <NotificationBell />
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

        {/* STEP 1 */}
        {activeStep === 1 && (
          <div className="w-full bg-grad-2 rounded-2xl shadow-md p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-muted">
              {t("course.basic_info")}
            </h2>
            
            <div className="flex flex-col mb-4 sm:mb-6">
              <label className="font-medium mb-2 text-muted">{t("course.title")}</label>
              <Input
                placeholder={t("course.course_title_placeholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col mb-4 sm:mb-6">
              <label className="font-medium mb-2 text-muted">{t("course.course_topic")}</label>
              <textarea
                className="w-full min-h-[120px] sm:min-h-[180px] border border-gray-300 rounded-xl p-3 sm:p-4 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("course.course_topic_placeholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col">
                <label className="font-medium mb-2 text-muted">{t("course.duration")}</label>
                <div className="flex gap-2">
                  <ModernDropdown
                    value={hours}
                    onChange={setHours}
                    options={hourOptions}
                    placeholder="Heures"
                    className="flex-1"
                  />
                  <ModernDropdown
                    value={minutes}
                    onChange={setMinutes}
                    options={minuteSecondOptions.map(o => ({ ...o, label: `${o.value} min` }))}
                    placeholder="Minutes"
                    className="flex-1"
                  />
                  <ModernDropdown
                    value={seconds}
                    onChange={setSeconds}
                    options={minuteSecondOptions.map(o => ({ ...o, label: `${o.value} s` }))}
                    placeholder="Secondes"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-2 text-muted">{t("course.level")}</label>
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
              
              <div className="flex flex-col md:col-span-2">
                <label className="font-medium mb-2 text-muted">{t("course.visibility")}</label>
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
            
            <div className="flex justify-between mt-6 sm:mt-10">
              <button className="px-4 sm:px-6 py-2 rounded-xl border border-gray-300 font-medium bg-white shadow-sm transition hover:bg-gray-50">
                {t("course.cancel")}
              </button>
              <button
                className="px-4 sm:px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition"
                onClick={() => setActiveStep(2)}
              >
                {t("course.save_next")}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {activeStep === 2 && (
          <div className="w-full">
            <div className="bg-grad-2 rounded-2xl p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-muted">
                  {t("course.curriculum")}
                </h1>
                <button
                  className="px-4 sm:px-6 py-2 rounded-xl bg-primary text-white shadow-sm hover:shadow-md transition self-start"
                  onClick={addSection}
                >
                  + {t("course.add_section")}
                </button>
              </div>

              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="bg-grad-2 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:border-primary/30 transition mb-6"
                >
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-primary text-white font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <Input
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          placeholder={t("course.section_title_placeholder")}
                          className="!border-none !bg-transparent px-0 font-medium text-lg"
                        />
                        <textarea
                          className="w-full mt-2 min-h-[60px] sm:min-h-[80px] border border-gray-300 rounded-xl p-3 text-sm sm:text-base "
                          placeholder={t("course.section_description_placeholder")}
                          value={section.description}
                          onChange={(e) => updateSectionDescription(section.id, e.target.value)}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          className="hover:text-primary transition"
                          onClick={() => toggleSection(section.id)}
                        >
                          <ChevronUp
                            size={20}
                            className={`transition-transform duration-300 ${section.open ? "" : "rotate-180"}`}
                          />
                        </button>
                        <button
                          className="hover:text-red-500 transition"
                          onClick={() => removeSection(section.id)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {section.open && section.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <div className="text-sm font-medium text-gray-600 w-6">{idx + 1}.</div>
                        <Input
                          placeholder={t("course.lesson_title")}
                          value={lesson.title}
                          onChange={(e) => updateLessonTitle(section.id, lesson.id, e.target.value)}
                          className="flex-1 !bg-white"
                        />
                        <div className="flex gap-3">
                          <ModernDropdown
                            value={lesson.type || "text"}
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
                            className="w-32"
                          />
                          <button
                            onClick={() => removeLesson(section.id, lesson.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>

                      {lesson.type === "text" && (
                        <textarea
                          className="w-full min-h-[100px] border border-gray-300 rounded-xl p-3 text-sm sm:text-base"
                          placeholder={t("course.lesson_content")}
                          value={lesson.content}
                          onChange={(e) => updateLessonContent(section.id, lesson.id, e.target.value)}
                        />
                      )}

                      {lesson.type === "example" && (
                        <textarea
                          className="w-full min-h-[100px] border border-gray-300 rounded-xl p-3 text-sm sm:text-base"
                          placeholder={t("course.lesson_content")}
                          value={lesson.content}
                          onChange={(e) => updateLessonContent(section.id, lesson.id, e.target.value)}
                        />
                      )}

                      {lesson.type === "image" && (
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor={`file-${section.id}-${lesson.id}`}
                            className="cursor-pointer w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed hover:bg-gray-200 transition"
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

                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => addLessonToSection(section.id)}
                      className="w-full sm:w-1/2 rounded-xl py-2 bg-primary text-white font-medium hover:bg-primary/90 transition"
                    >
                      + {t("course.add_lesson")}
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                <button
                  className="px-6 py-2 rounded-xl bg-gray-100 font-medium text-gray-700 hover:bg-gray-200 transition"
                  onClick={() => setActiveStep(1)}
                >
                  {t("course.back")}
                </button>
                <button
                  className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition"
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
          <div className="space-y-6">
            {/* RÉSUMÉ INFOS GÉNÉRALES */}
            <div className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-muted">
                {t("course.summary")}
              </h2>
              <div className="space-y-3 text-grayc">
                <p><strong>{t("course.title")} :</strong> {title}</p>
                <p><strong>{t("course.course_topic")} :</strong> {description}</p>
                <p><strong>{t("course.duration")} :</strong> {duration}</p>
                <p><strong>{t("course.level")} :</strong> {level}</p>
                <p><strong>{t("course.courseVisibility")} :</strong> {courseVisibility}</p>
              </div>
            </div>

            {/* RÉSUMÉ SECTIONS */}
            <div className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-6 text-primary">
                {t("course.curriculum")}
              </h3>
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="mb-6 pb-4 border-b border-gray-200 ">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                    {sectionIndex + 1}. {section.title || t("course.untitled_section")}
                  </h4>
                  {section.description && (
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  )}
                  <div className="mt-4 pl-4 space-y-3 ">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="bg-gray-50 p-3 rounded-lg border">
                        <p className="font-medium text-gray-800">
                          {lessonIndex + 1}. {lesson.title || t("course.untitled_lesson")}
                        </p>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {lesson.type || "text"}
                        </span>
                        {(lesson.type === "text" || lesson.type === "example") && (
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                            {lesson.content || t("course.no_content")}
                          </p>
                        )}
                        {lesson.type === "image" && lesson.preview && (
                          <img
                            src={lesson.preview}
                            alt="Lesson visual"
                            className="w-full sm:w-48 mt-2 rounded-xl border object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* BOUTONS */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                onClick={() => setActiveStep(2)}
              >
                {t("course.back")}
              </button>
              <button
                className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
                onClick={handleSaveAll}
              >
                {t("course.save_publier")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}