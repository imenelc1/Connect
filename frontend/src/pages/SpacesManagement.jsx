import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/Navbar";
import {
  Folder,
  SquarePen,
  Trash2,
  Plus,
  BookOpen,
  FileText,
  HelpCircle
} from "lucide-react";
import Button from "../components/common/Button";
import AddModel from "../components/common/AddModel";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ModernDropdown from "../components/common/ModernDropdown";

export default function SpacesPage() {
  const { t } = useTranslation("Spaces");
  const { toggleDarkMode } = useContext(ThemeContext);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newSpace, setNewSpace] = useState({ title: "", description: "", utilisateur: "" });
  const [spaces, setSpaces] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsInSpace, setStudentsInSpace] = useState([]);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [exercices, setExercices] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [addStudentsModalOpen, setAddStudentsModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTab, setSelectedTab] = useState("students");

  // ================= FETCH SPACES =================
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("${process.env.REACT_APP_API_URL}/api/spaces/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const formatted = data.map((s) => ({
          id: s.id_space,
          title: s.nom_space,
          description: s.description || "—",
          utilisateur: s.utilisateur,
        }));
        setSpaces(formatted);
      } catch (err) {
        console.error(t("space.errors.load"), err);

      }
    };
    fetchSpaces();
  }, []);

  // ================= FETCH TEACHERS =================
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("${process.env.REACT_APP_API_URL}/api/users/enseignants/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTeachers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeachers();
  }, []);

  // ================= RESPONSIVE =================
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

  // ================= FILTERED SPACES =================
  const filteredSpaces = spaces.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  // ================= HANDLE ADD / EDIT SPACE =================
  const handleSubmit = async (e) => {
    const token = localStorage.getItem("admin_token");
    const payload = { nom_space: newSpace.title, description: newSpace.description, utilisateur: newSpace.utilisateur };

    try {
      if (editIndex) {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/spaces/admin/${editIndex}/update/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(t("errors.update"));
        const data = await res.json();
        setSpaces((prev) =>
          prev.map((s) => s.id === editIndex ? { id: data.id_space, title: data.nom_space, description: data.description, utilisateur: data.utilisateur } : s)
        );
        toast.success(t("messages.updateSuccess"));
      } else {
        const res = await fetch("${process.env.REACT_APP_API_URL}/api/spaces/admin/create/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(t("errors.create"));

        const data = await res.json();
        setSpaces((prev) => [...prev, { id: data.id_space, title: data.nom_space, description: data.description, utilisateur: data.utilisateur }]);
        toast.success(t("messages.createSuccess"));
      }
      setOpenModal(false);
      setNewSpace({ title: "", description: "", utilisateur: "" });
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      toast.error(t("messages.operationFailed"));
    }
  };

  // ================= HANDLE DELETE SPACE =================
  const handleDeleteSpace = async (id_space) => {
    if (!window.confirm(t("confirmDeleteSpace"))) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/spaces/space/${id_space}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(t("errors.delete"));
      setSpaces((prev) => prev.filter((s) => s.id !== id_space));
      toast.success(t("messages.deleteSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("errors.spaceDeleteFailed"));
    }
  };

  // ================= OPEN MODAL POUR GÉRER LES ÉTUDIANTS =================
  const handleOpenSpaceStudents = async (space) => {
    setSelectedSpace(space);
    setAddStudentsModalOpen(true);

    const token = localStorage.getItem("admin_token");
    if (!token) return toast.error("Token manquant");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/spaces/space/${space.id}/details/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(t("errors.load"));
      const data = await res.json();

      const inSpace = data.students.map((s) => ({
        ...s,
        id_utilisateur: s.id_utilisateur || s.id,
      }));
      setStudentsInSpace(inSpace);

      // Récupérer tous les étudiants
      const resAll = await fetch(
        "${process.env.REACT_APP_API_URL}/api/users/students-with-progress/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const allStudentsData = await resAll.json();

      // Étudiants disponibles à ajouter (ceux qui ne sont pas déjà dans l'espace)
      const inSpaceIds = inSpace.map((s) => s.id_utilisateur);
      const otherStudents = allStudentsData
        .filter((s) => !inSpaceIds.includes(s.id))
        .map((s) => ({
          ...s,
          id_utilisateur: s.id,
        }));

      setStudents(otherStudents);
      setSelectedStudents([]); t

      // Contenus
      setCourses(data.courses || []);
      setExercices(data.exercices || []);
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error(err);
      toast.error(t("errors.loadDetails"));
    }
  };


  // ================= ADD STUDENTS TO SPACE =================
  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddStudentsToSpace = async (e) => {
    e.preventDefault();
    if (!selectedSpace || selectedStudents.length === 0) return toast.error(t("errors.selectAtLeastOneStudent"));

    try {
      const token = localStorage.getItem("admin_token");
      for (let studentId of selectedStudents) {
        const student = students.find((s) => s.id_utilisateur === studentId);
        const res = await fetch("${process.env.REACT_APP_API_URL}/api/spaces/admin/add-students/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ email: student.adresse_email || student.email, space_id: selectedSpace.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || t("errors.addStudentFailed"));
        }
      }
      toast.success(t("messages.AddSuccess"));

      setAddStudentsModalOpen(false);
      setSelectedStudents([]);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };
  const handleRemoveStudentFromSpace = async (student) => {
    if (!selectedSpace) return;

    const confirmDelete = window.confirm(
      t("messages.confirmRemoveStudent", { firstName: student.prenom, lastName: student.nom })
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("admin_token");

      const res = await fetch(
        "${process.env.REACT_APP_API_URL}/api/spaces/admin/remove-student/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            student_id: student.id_utilisateur,
            space_id: selectedSpace.id,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("messages.studentRemoveFailed"));
      }

      setStudentsInSpace((prev) =>
        prev.filter((s) => s.id_utilisateur !== student.id_utilisateur)
      );

      setStudents((prev) => [...prev, student]);

      toast.success(t("messages.studentRemovedFromSpace", { firstName: student.prenom, lastName: student.nom })
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || t("messages.studentRemoveFailed"));
    }
  };
  const teacherOptions = teachers.map((t) => ({
    value: t.id_utilisateur,
    label: `${t.prenom} ${t.nom}`,
  }));

  // ================= FIELDS FOR SPACE MODAL =================
  const fields = [
    { label: t("fieldSpaceName"), placeholder: t("fieldSpaceNamePlaceholder"), value: newSpace.title, onChange: (e) => setNewSpace({ ...newSpace, title: e.target.value }) },
    { label: t("fieldDescription"), placeholder: t("fieldDescriptionPlaceholder"), value: newSpace.description, onChange: (e) => setNewSpace({ ...newSpace, description: e.target.value }) },
    {
      label: t("owner"),
      element: (
        <ModernDropdown
          value={newSpace.utilisateur}
          onChange={(value) =>
            setNewSpace({ ...newSpace, utilisateur: value })
          }
          options={teacherOptions}
          placeholder={t("selectTeacher")}
          style={{ width: "100%" }}
        />
      ),
    }
  ];

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>
      <main className={`flex-1 p-6 pt-10 space-y-5 transition-all duration-300 ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted"> {t("title")}</h1>
            <p className="text-gray">{t("description")}</p>
          </div>

          <Button
            text={<span className="flex items-center gap-2"><Plus size={18} /> {t("addSpaceButton")}</span>}
            variant="primary"
            className="!w-auto px-6 py-2 rounded-xl"
            onClick={() => { setEditIndex(null); setNewSpace({ title: "", description: "", utilisateur: "" }); setOpenModal(true); }}
          />
        </div>

        <div className="max-w-md mb-6">
          <ContentSearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredSpaces.map((space) => (
            <div key={space.id} className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer" onClick={() => handleOpenSpaceStudents(space)}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-muted/20 flex items-center justify-center flex-shrink-0">
                  <Folder className="w-6 h-6 text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">{space.title}</h2>
                  <p className="text-grayc text-sm mt-1 line-clamp-2">{space.description}</p>
                  {space.utilisateur && (
                    <p className="text-sm text-gray-500 mb-1">
                      {t("owner")} : {teachers.find(t => t.id_utilisateur === space.utilisateur)?.prenom}{" "}
                      {teachers.find(t => t.id_utilisateur === space.utilisateur)?.nom}
                    </p>
                  )}

                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <SquarePen
                  size={18}
                  className="text-muted hover:text-primary cursor-pointer"
                  title="Modifier"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditIndex(space.id);
                    setNewSpace({ title: space.title, description: space.description, utilisateur: space.utilisateur });
                    setOpenModal(true);
                  }}
                />
                <Trash2
                  size={18}
                  className="text-red hover:opacity-80 cursor-pointer"
                  title={t("deleteSpace")}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSpace(space.id);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Création/Edition d'espace */}
      <AddModel open={openModal} onClose={() => setOpenModal(false)} fields={fields} onSubmit={handleSubmit} submitLabel={editIndex ? t("update") : t("create")} cancelLabel={t("cancel")} />

      {/* ========== MODAL : GÉRER LES ÉTUDIANTS ========== */}
      {addStudentsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-10 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col p-4 md:p-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("editSpace")} "{selectedSpace?.title}"
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl font-bold"
                onClick={() => setAddStudentsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Onglets */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                className={`flex-1 py-2 text-center font-medium ${selectedTab === "students"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500"
                  }`}
                onClick={() => setSelectedTab("students")}
              >
                {t("tabs.students")}
              </button>
              <button
                className={`flex-1 py-2 text-center font-medium ${selectedTab === "contents"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500"
                  }`}
                onClick={() => setSelectedTab("contents")}
              >
                {t("tabs.contents")}
              </button>
            </div>

            {/* CONTENU */}
            {selectedTab === "students" && (
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 flex-1 overflow-y-auto">

                {/* Déjà dans l'espace */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 shadow-inner overflow-y-auto">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    {t("actions.alreadyInSpace")}
                  </h3>

                  {studentsInSpace.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("noStudents")}</p>
                  ) : (
                    <ul className="space-y-2">
                      {studentsInSpace.map((s) => (
                        <li
                          key={s.id_utilisateur}
                          className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition"
                        >
                          <span className="truncate font-medium">
                            {s.nom} {s.prenom} ({s.email || s.adresse_email})
                          </span>
                          <Trash2
                            size={20}
                            className="text-red-500 hover:text-red-600 cursor-pointer"
                            onClick={() => handleRemoveStudentFromSpace(s)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Ajouter à l'espace */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 shadow-inner overflow-y-auto">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    {t("actions.addToSpace")}
                  </h3>

                  {students.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("actions.allStudentsInSpace")}</p>
                  ) : (
                    <form onSubmit={handleAddStudentsToSpace} className="space-y-2">
                      {students.map((student) => (
                        <label
                          key={student.id_utilisateur}
                          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id_utilisateur)}
                            onChange={() => toggleStudent(student.id_utilisateur)}
                            className="accent-primary w-5 h-5"
                          />
                          <span className="truncate">
                            {student.nom} {student.prenom} (
                            {student.adresse_email || student.email})
                          </span>
                        </label>
                      ))}

                      <div className="flex justify-end gap-4 mt-4">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setAddStudentsModalOpen(false)}
                        >
                          {t("cancel")}
                        </Button>
                        <Button type="submit" variant="primary">
                          {t("addToSpaceButton")}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {selectedTab === "contents" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">

                {/* Cours */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen size={20} /> {t("contents.courses")}
                  </h3>
                  {courses.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("contents.noCourses")}</p>
                  ) : (
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                      {courses.map((c) => (
                        <li
                          key={c.id_cours}
                          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                        >
                          {c.titre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Exercices */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FileText size={20} /> {t("contents.exercises")}
                  </h3>
                  {exercices.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("contents.noExercises")}</p>
                  ) : (
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                      {exercices.map((e) => (
                        <li
                          key={e.id_exercice}
                          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                        >
                          {e.titre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Quiz */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle size={20} /> {t("contents.quiz")}
                  </h3>
                  {quizzes.length === 0 ? (
                    <p className="text-sm text-gray-500">{t("contents.noQuiz")}</p>
                  ) : (
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                      {quizzes.map((q) => (
                        <li
                          key={q.id_quiz}
                          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                        >
                          {q.titre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
