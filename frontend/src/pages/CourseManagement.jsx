import React, { useState, useEffect } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Search, Pencil, Trash2, BookOpen } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ModernDropdown from "../components/common/ModernDropdown";

export default function CoursesManagement() {
  const navigate = useNavigate();
  const { t } = useTranslation("CoursesManagement");

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    titre_cour: "",
    niveau_cour: "debutant",
    description: "",
    duration: "00:30:00",
    utilisateur: "",
  });

  const [editValues, setEditValues] = useState({
    titre_cour: "",
    niveau_cour: "debutant",
    description: "",
    duration: "00:30:00",
    utilisateur: "",
  });
  const [editModal, setEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);

  const token = localStorage.getItem("admin_token"); // JWT admin

  const difficultyOptions = [
    { value: "debutant", label: t("difficulty.Beginner") },
    { value: "intermediaire", label: t("difficulty.Intermediate") },
    { value: "avance", label: t("difficulty.Advanced") },
  ];

  const teacherOptions = teachers.map((t) => ({
    value: t.id_utilisateur,
    label: `${t.nom} ${t.prenom}`,
  }));

  const gradientMap = {
    Débutant: "bg-grad-2",
    Intermédiaire: "bg-grad-3",
    Avancé: "bg-grad-4",
  };

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/courses/admin/courses/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur récupération cours");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, [token]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/users/enseignants/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur récupération enseignants");
        const data = await res.json();
        setTeachers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeachers();
  }, [token]);

  // Filtered courses
  const filtered = courses.filter((c) =>
    (c.titre_cour || "").toLowerCase().includes(search.toLowerCase())
  );

  // CREATE
  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/create_cours/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCourse),
      });
      if (!res.ok) throw new Error("Erreur création cours");
      const data = await res.json();
      setCourses([...courses, data]);
      setNewCourse({ titre_cour: "", niveau_cour: "debutant", description: "", duration: "00:30:00", utilisateur: "" });
      setCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // EDIT
  const openEdit = (course) => {
    setSelectedCourse(course);
    setEditValues({
      titre_cour: course.titre_cour || "",
      niveau_cour: course.niveau_cour || "debutant",
      description: course.description || "",
      duration: course.duration || "00:30:00",
      utilisateur: course.utilisateur || "",
    });
    setEditModal(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/api/cours/${selectedCourse.id_cours}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editValues),
      });
      if (!res.ok) throw new Error("Erreur modification cours");
      const data = await res.json();
      setCourses(courses.map(c => (c.id_cours === data.id_cours ? data : c)));
      setEditModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE
  const handleDelete = async (id_cours) => {
    try {
      const res = await fetch(`http://localhost:8000/api/delete_cours/${id_cours}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCourses(courses.filter(c => c.id_cours !== id_cours));
      else console.error("Erreur suppression cours");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex w-full bg-surface min-h-screen overflow-x-hidden">
      <Navbar />

      <div className="flex-1 p-4 md:p-8 md:ml-56">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-textc">{t("title")}</h1>
            <p className="text-textc mb-6">{t("description")}</p>
          </div>
          <div className="flex gap-4">
            <Button
              text={t("addCourseButton")}
              variant="primary"
              className="px-6 py-3 whitespace-nowrap"
              onClick={() => setCreateModal(true)}
            />
            <Button
              text={t("validationButton")}
              variant="primary"
              className="px-6 py-3 whitespace-nowrap"
              onClick={() => navigate("/validation-courses")}
            />
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-6 w-full">
          <div className="relative flex-1 min-w-[280px] lg:min-w-[450px]">
            <ContentSearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id_cours}
              className={`rounded-xl shadow p-5 flex flex-col border hover:shadow-md transition
                ${gradientMap[item.niveau_cour_label] || "bg-white"}`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="w-12 h-12 flex items-center justify-center bg-grad-2 rounded-lg">
                  <BookOpen size={24} className="text-primary" />
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-lg font-medium ${item.niveau_cour === "debutant"
                    ? "bg-primary/30 text-primary"
                    : item.niveau_cour === "intermediaire"
                      ? "bg-secondary/30 text-secondary"
                      : "bg-pink/30 text-pink"
                    }`}
                >
                  {item.niveau_cour_label}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-textc">{item.titre_cour}</h3>

              <div className="flex justify-end mt-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-lg text-primary hover:bg-primary/10 hover:scale-110 transition"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id_cours)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:scale-110 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL */}
      <AddModal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title={t("modal.create.title")}
        subtitle={t("modal.create.subtitle")}
        submitLabel={t("modal.create.submit")}
        cancelLabel={t("modal.create.cancel")}
        onSubmit={submitCreate}
        fields={[
          {
            label: t("field.title"),
            placeholder: t("field.titlePlaceholder"),
            value: newCourse.titre_cour,
            onChange: (e) => setNewCourse({ ...newCourse, titre_cour: e.target.value }),
          },
          {
            label: t("field.description"),
            placeholder: t("field.descriptionPlaceholder"),
            value: newCourse.description,
            onChange: (e) => setNewCourse({ ...newCourse, description: e.target.value }),
          },
          {
            label: t("field.duration"),
            placeholder: t("field.durationPlaceholder"),
            value: newCourse.duration,
            onChange: (e) => setNewCourse({ ...newCourse, duration: e.target.value }),
          },
          {
            label: t("field.teacher"),
            element: (
              <ModernDropdown
                value={newCourse.utilisateur}
                onChange={(value) => setNewCourse({ ...newCourse, utilisateur: value })}
                options={teacherOptions}
                placeholder="Sélectionner un enseignant"
              />
            ),
          },
          {
            label: t("field.difficulty"),
            element: (
              <ModernDropdown
                value={newCourse.niveau_cour}
                onChange={(value) => setNewCourse({ ...newCourse, niveau_cour: value })}
                options={difficultyOptions}
                placeholder={t("field.difficulty")}
              />
            ),
          },
        ]}
      />

      {/* EDIT MODAL */}
      <AddModal
        open={editModal}
        onClose={() => setEditModal(false)}
        title={t("modal.edit.title")}
        subtitle={t("modal.edit.subtitle")}
        submitLabel={t("modal.edit.submit")}
        cancelLabel={t("modal.edit.cancel")}
        onSubmit={submitEdit}
        fields={[
          {
            label: t("field.title"),
            placeholder: t("field.titlePlaceholder"),
            value: editValues.titre_cour,
            onChange: (e) => setEditValues({ ...editValues, titre_cour: e.target.value }),
          },
          {
            label: t("field.teacher"),
            element: (
              <ModernDropdown
                value={editValues.utilisateur}
                onChange={(value) => setEditValues({ ...editValues, utilisateur: value })}
                options={teacherOptions}
                placeholder="Sélectionner un enseignant"
              />
            ),
          },
          {
            label: t("field.difficulty"),
            element: (
              <ModernDropdown
                value={editValues.niveau_cour}
                onChange={(value) => setEditValues({ ...editValues, niveau_cour: value })}
                options={difficultyOptions}
                placeholder={t("field.difficulty")}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
