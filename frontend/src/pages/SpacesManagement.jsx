import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import { Folder, SquarePen, Trash2, Plus } from "lucide-react";
import Button from "../components/common/Button";
import AddModel from "../components/common/AddModel";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function SpacesPage() {
  const { t } = useTranslation("space");
  const { toggleDarkMode } = useContext(ThemeContext);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newSpace, setNewSpace] = useState({ title: "", description: "", utilisateur: "" });
  const [spaces, setSpaces] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]); // étudiants à ajouter
  const [studentsInSpace, setStudentsInSpace] = useState([]); // étudiants déjà dans l'espace
  const [error, setError] = useState("");
const [courses, setCourses] = useState([]);
const [exercices, setExercices] = useState([]);
const [quizzes, setQuizzes] = useState([]);

  const [addStudentsModalOpen, setAddStudentsModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // ================= FETCH SPACES =================
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("http://localhost:8000/api/spaces/", {
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
        console.error("Erreur chargement espaces :", err);
      }
    };
    fetchSpaces();
  }, []);

  // ================= FETCH TEACHERS =================
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("http://localhost:8000/api/users/enseignants/", {
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
    //e.preventDefault();
    const token = localStorage.getItem("admin_token");
    const payload = { nom_space: newSpace.title, description: newSpace.description, utilisateur: newSpace.utilisateur };

    try {
      if (editIndex) {
        const res = await fetch(`http://localhost:8000/api/spaces/admin/${editIndex}/update/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erreur modification space");
        const data = await res.json();
        setSpaces((prev) =>
          prev.map((s) => s.id === editIndex ? { id: data.id_space, title: data.nom_space, description: data.description, utilisateur: data.utilisateur } : s)
        );
        toast.success("Espace mis à jour !");
      } else {
        const res = await fetch("http://localhost:8000/api/spaces/admin/create/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erreur création space");
        const data = await res.json();
        setSpaces((prev) => [...prev, { id: data.id_space, title: data.nom_space, description: data.description, utilisateur: data.utilisateur }]);
        toast.success("Espace créé !");
      }
      setOpenModal(false);
      setNewSpace({ title: "", description: "", utilisateur: "" });
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      toast.error("Opération échouée");
    }
  };

  // ================= HANDLE DELETE SPACE =================
  const handleDeleteSpace = async (id_space) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet espace ?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`http://localhost:8000/api/spaces/admin/${id_space}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur suppression espace");
      setSpaces((prev) => prev.filter((s) => s.id !== id_space));
      toast.success("Espace supprimé !");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de supprimer l'espace");
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
      `http://localhost:8000/api/spaces/space/${space.id}/details/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Erreur chargement espace");

    const data = await res.json();

    // =====================
    // Étudiants
    // =====================
    setStudentsInSpace(data.students || []);

    const resAll = await fetch(
      "http://localhost:8000/api/users/students-with-progress/",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const allStudentsData = await resAll.json();

    const inSpaceIds = data.students.map((s) => s.id_utilisateur);
    const otherStudents = allStudentsData.filter(
      (s) => !inSpaceIds.includes(s.id)
    );

    setStudents(otherStudents);
    setSelectedStudents([]);

    // =====================
    // Contenus
    // =====================
    setCourses(data.courses || []);
    setExercices(data.exercices || []);
    setQuizzes(data.quizzes || []);
  } catch (err) {
    console.error(err);
    toast.error("Impossible de charger les détails de l'espace");
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
    if (!selectedSpace || selectedStudents.length === 0) return toast.error("Sélectionnez au moins un étudiant");

    try {
      const token = localStorage.getItem("admin_token");
      for (let studentId of selectedStudents) {
        const student = students.find((s) => s.id_utilisateur === studentId);
        const res = await fetch("http://localhost:8000/api/spaces/admin/add-students/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ email: student.adresse_email || student.email, space_id: selectedSpace.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erreur ajout étudiant");
        }
      }
      toast.success("Étudiants ajoutés !");
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
    `Voulez-vous vraiment retirer ${student.nom} ${student.prenom} de l'espace ?`
  );
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("admin_token");

    const res = await fetch(
      "http://localhost:8000/api/spaces/admin/remove-student/",
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
      throw new Error(data.error || "Erreur suppression étudiant");
    }

    // 1️⃣ Retirer de "Déjà dans l'espace"
    setStudentsInSpace((prev) =>
      prev.filter((s) => s.id_utilisateur !== student.id_utilisateur)
    );

    // 2️⃣ Ajouter à "Ajouter à l'espace"
    setStudents((prev) => [...prev, student]);

    toast.success(`${student.nom} ${student.prenom} retiré de l'espace`);
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Impossible de supprimer l'étudiant");
  }
};

  // ================= FIELDS FOR SPACE MODAL =================
  const fields = [
    { label: "Nom", placeholder: "Nom de l'espace", value: newSpace.title, onChange: (e) => setNewSpace({ ...newSpace, title: e.target.value }) },
    { label: "Description", placeholder: "Description", value: newSpace.description, onChange: (e) => setNewSpace({ ...newSpace, description: e.target.value }) },
    {
      label: "Propriétaire",
      element: (
        <select value={newSpace.utilisateur} onChange={(e) => setNewSpace({ ...newSpace, utilisateur: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg">
          <option value="">-- Sélectionner un enseignant --</option>
          {teachers.map((t) => <option key={t.id_utilisateur} value={t.id_utilisateur}>{t.prenom} {t.nom}</option>)}
        </select>
      ),
    },
  ];

  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      <Navbar />
      <main className={`flex-1 p-6 pt-10 space-y-5 transition-all duration-300 ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}`}>
       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("title")}</h1>
            <p className="text-gray">{t("subtitle")}</p>
          </div>

          <Button
            text={<span className="flex items-center gap-2"><Plus size={18}/> {t("addSpace")}</span>}
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
                      Propriétaire : {teachers.find(t => t.id_utilisateur === space.utilisateur)?.prenom}{" "}
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
                  title="Supprimer"
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
      <AddModel open={openModal} onClose={() => setOpenModal(false)} fields={fields} onSubmit={handleSubmit} submitLabel={editIndex ? "Modifier" : "Créer"} cancelLabel="Annuler" />

      {/* Modal Gérer les étudiants */}
   {addStudentsModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-10 z-50 overflow-y-auto">
    <div className="bg-white dark:bg-gray-800 p-10 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden relative shadow-xl">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Gérer les étudiants et contenus de "{selectedSpace?.title}"
      </h2>
<div className="text-center mb-3 text-sm text-gray-500">
        Étudiants : {studentsInSpace.length} | Cours : {courses.length} | Quiz : {quizzes.length}
      </div>
      {/* Bouton Fermer */}
      <button
        className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl font-bold"
        onClick={() => setAddStudentsModalOpen(false)}
        aria-label="Fermer modal"
      >
        ✕
      </button>

      {/* Grille Étudiants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Déjà dans l'espace */}
        <div>
          <h3 className="font-semibold mb-4 text-xl">Déjà dans l'espace</h3>
          {studentsInSpace.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun étudiant</p>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-3">
              {studentsInSpace.map((s) => (
                <li
                  key={s.id_utilisateur}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm"
                >
                  <span className="truncate font-medium text-base">
                    {s.nom} {s.prenom} ({s.email || s.adresse_email})
                  </span>
                  <Trash2
                    size={20}
                    className="text-red hover:opacity-80 cursor-pointer"
                    title="Supprimer de l'espace"
                    onClick={() => handleRemoveStudentFromSpace(s)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ajouter à l'espace */}
        <div>
          <h3 className="font-semibold mb-4 text-xl">Ajouter à l'espace</h3>
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">
              Tous les étudiants sont déjà dans cet espace.
            </p>
          ) : (
            <form onSubmit={handleAddStudentsToSpace} className="space-y-3 max-h-96 overflow-y-auto pr-3">
              {students.map((student) => (
                <div
                  key={student.id_utilisateur}
                  className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                >
                  <input
                    type="checkbox"
                    id={`student-${student.id_utilisateur}`}
                    checked={selectedStudents.includes(student.id_utilisateur)}
                    onChange={() => toggleStudent(student.id_utilisateur)}
                  />
                  <label htmlFor={`student-${student.id_utilisateur}`} className="truncate font-medium text-base">
                    {student.nom} {student.prenom} ({student.adresse_email || student.email})
                  </label>
                </div>
              ))}
              <div className="flex justify-end gap-4 mt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAddStudentsModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Ajouter
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <hr className="my-10" />

      {/* Grille Cours / Exercices / Quiz */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cours */}
        <div>
          <h3 className="text-xl font-semibold mb-4">📘 Cours</h3>
          {courses.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun cours</p>
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
          <h3 className="text-xl font-semibold mb-4">📝 Exercices</h3>
          {exercices.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun exercice</p>
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
          <h3 className="text-xl font-semibold mb-4">❓ Quiz</h3>
          {quizzes.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun quiz</p>
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
    </div>
  </div>
)}





    </div>
  );
}
