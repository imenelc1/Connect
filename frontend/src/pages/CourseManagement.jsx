import React, { useState, useEffect } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Search, Pencil, Trash2, BookOpen } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";


export default function CoursesManagement() {
  const navigate = useNavigate();
  //const { t } = useTranslation("CoursesManagement");

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    titre_cour: "",
    niveau_cour: "debutant",
    description: "",
    duration: "00:30:00",
    utilisateur: "", // id de l’enseignant
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

  const token = localStorage.getItem("admin_token"); // ⚡ JWT admin

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

  const filtered = courses.filter((c) =>
    (c.titre_cour || "").toLowerCase().includes(search.toLowerCase())
  );
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
  const fetchTeachers = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/users/enseignants/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Erreur récupération enseignants");
      }

      const data = await res.json();
      setTeachers(data);
      console.log("Enseignants récupérés :", data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchTeachers();
}, [token]);


  // --- CREATE ---
  const submitCreate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/create_cours/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titre_cour: newCourse.titre_cour,
          niveau_cour: newCourse.niveau_cour,
          description: newCourse.description,
          duration: newCourse.duration,
          utilisateur: newCourse.utilisateur, // ⚡ id de l’enseignant
        }),
      });

      if (!res.ok) throw new Error("Erreur création cours");

      const data = await res.json();
      setCourses([...courses, data]); // ⚡ mettre à jour la liste depuis la BDD
      setNewCourse({ titre_cour: "", niveau_cour: "debutant" });
      setCreateModal(false);

    } catch (err) {
      console.error(err);
    }
  };

  // --- EDIT ---
  const openEdit = (course) => {
    setSelectedCourse(course);
    setEditValues({
      titre_cour: course.titre_cour,
      niveau_cour: course.niveau_cour,
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
        body: JSON.stringify({
          titre_cour: editValues.titre_cour,
          niveau_cour: editValues.niveau_cour,
          description: editValues.description,
          duration: editValues.duration,
          utilisateur: editValues.utilisateur, // ⚡ id de l’enseignant
        }),
      });

      if (!res.ok) throw new Error("Erreur modification cours");

      const data = await res.json();
      setCourses(
        courses.map(c => (c.id_cours === data.id_cours ? data : c))
      );

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

      if (res.ok) {
        setCourses(courses.filter(c => c.id_cours !== id_cours));
      } else {
        console.error("Erreur suppression cours");
      }
    } catch (err) {
      console.error(err);
    }
  };


  const { t } = useTranslation("CoursesManagement");
  const gradientMap = {
    Débutant: "bg-grad-2",
    Intermédiaire: "bg-grad-3",
    Avancé: "bg-grad-4",
  };


  return (
    <div className="flex w-full bg-bg min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Main Content */}
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

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-6 w-full">
          <div className="relative flex-1 min-w-[280px] lg:min-w-[450px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-primary
             focus:bg-white focus:text-primary focus:ring-2 focus:ring-primary outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id_cours}
              className={`rounded-xl shadow p-5 flex flex-col border hover:shadow-md transition
    ${gradientMap[item.niveau_cour_label] || "bg-white"}
  `}
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

              <h3 className="text-lg font-semibold text-textc">
                {item.titre_cour}
              </h3>

              <div className="flex justify-end mt-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-lg text-primary
                 hover:bg-primary/10 hover:scale-110 transition"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id_cours)}
                    className="p-2 rounded-lg text-red-500
                 hover:bg-red-500/10 hover:scale-110 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
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
              <select
                value={newCourse.utilisateur}
                onChange={(e) => setNewCourse({ ...newCourse, utilisateur: e.target.value })}
                className="bg-grisclair rounded-md px-3 py-2 border-primary"
              >
                <option value="">Sélectionner un enseignant</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id_utilisateur} value={teacher.id_utilisateur}>
                    {teacher.nom} {teacher.prenom}
                  </option>
                ))}
              </select>
            ),
          },
          {
            label: t("field.difficulty"),
            element: (
              <select
                value={newCourse.niveau_cour}
                onChange={(e) => setNewCourse({ ...newCourse, niveau_cour: e.target.value })}
                className="bg-grisclair rounded-md px-3 py-2 border-primary"
              >
                <option value="debutant">{t("difficulty.Beginner")}</option>
                <option value="intermediaire">{t("difficulty.Intermediate")}</option>
                <option value="avance">{t("difficulty.Advanced")}</option>
              </select>
            ),
          },
        ]}
      />

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
            value: editValues.title,
            onChange: (e) => setEditValues({ ...editValues, title: e.target.value }),
          },
          {
            label: t("field.category"),
            placeholder: t("field.categoryPlaceholder"),
            value: editValues.category,
            onChange: (e) => setEditValues({ ...editValues, category: e.target.value }),
          },
          {
            label: t("field.teacher"),
            element: (
              <select
                value={editValues.utilisateur}
                onChange={(e) =>
                  setEditValues({ ...editValues, utilisateur: e.target.value })
                }
                className="bg-grisclair rounded-md px-3 py-2 border-primary"
              >
                <option value="">Sélectionner un enseignant</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id_utilisateur} value={teacher.id_utilisateur}>
                    {teacher.nom} {teacher.prenom}
                  </option>
                ))}
              </select>
            ),
          },
          {
            label: t("field.difficulty"),
            element: (
              <select
                value={newCourse.niveau_cour}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, niveau_cour: e.target.value })
                }
                className="bg-grisclair rounded-md px-3 py-2 border-primary"
              >
                <option value="debutant">{t("difficulty.Beginner")}</option>
                <option value="intermediaire">{t("difficulty.Intermediate")}</option>
                <option value="avance">{t("difficulty.Advanced")}</option>
              </select>

            ),
          },
        ]}
      />
    </div>
  );
}
