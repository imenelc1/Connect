import React, { useState, useEffect, useContext } from "react";
import Button from "../components/common/Button";
import ProgressBar from "../components/ui/ProgressBar";
import Navbar from "../components/common/NavBar";
import { Trash2, SquarePen, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import { toast } from "react-hot-toast";

// ================= MODAL DÉTAIL =================
function StudentDetailModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">{student.nom} {student.prenom}</h2>
        <p className="text-sm text-gray-500 mb-2">{student.email}</p>
        <p className="text-sm text-gray-500 mb-4">{`Cours suivis: ${student.courses_count || 0}`}</p>

        {student.courses_count > 0 ? (
          <div>
            {student.courses.map((course, idx) => (
              <div key={idx} className="mb-3 border-b pb-2">
                <p className="font-semibold">{course.title}</p>
                <p className="text-sm text-gray-500">Progression: {course.progress}%</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun cours suivi</p>
        )}
      </div>
    </div>
  );
}

// ================= MODAL ÉDITION =================
function StudentEditModal({ studentForm, setStudentForm, onClose, onSubmit }) {
  if (!studentForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Modifier {studentForm.nom} {studentForm.prenom}</h2>

        <form onSubmit={onSubmit} className="space-y-3">
          {["nom", "prenom", "email", "date_naissance", "matricule", "specialite", "annee_etude"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700">{field.replace("_", " ")}</label>
              <input
                type={field === "date_naissance" ? "date" : "text"}
                value={studentForm[field] || ""}
                onChange={(e) => setStudentForm({ ...studentForm, [field]: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary">Enregistrer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

//================= MODAL CREER ===================
// ================= MODAL AJOUT =================
function StudentAddModal({ studentForm, setStudentForm, onClose, onSubmit }) {
  if (!studentForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Ajouter un étudiant</h2>

        <form onSubmit={onSubmit} className="space-y-3">
          {["nom", "prenom", "email", "date_naissance", "matricule", "specialite", "annee_etude"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700">{field.replace("_", " ")}</label>
              <input
                type={field === "date_naissance" ? "date" : "text"}
                value={studentForm[field] || ""}
                onChange={(e) => setStudentForm({ ...studentForm, [field]: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary">Créer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}



// ================= COMPOSANT PRINCIPAL =================
export default function StudentsManagement() {
  const { t } = useTranslation("StudentsManagement");
  const { toggleDarkMode } = useContext(ThemeContext);

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [studentForm, setStudentForm] = useState(null);

  // ================= FETCH =================
  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return setError("Token JWT manquant.");

      setLoading(true);
      try {
        const res = await fetch(
          "http://localhost:8000/api/users/students-with-progress/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`Erreur (${res.status})`);
        const data = await res.json();

        const formatted = data.map(s => ({
          ...s,
          courses: s.courses || [],
          courses_count: s.courses_count || s.courses?.length || 0,
        }));

        setStudents(formatted);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les étudiants.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // ================= RESIZE =================
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ================= SUPPRIMER =================
  const handleDelete = async (studentId) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return setError("Token JWT manquant.");
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/users/admin/users/${studentId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }
      setStudents(prev => prev.filter(s => s.id === studentId ? false : true));
      toast.success("Étudiant supprimé avec succès !");
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible de supprimer l’étudiant");
    }
  };

  // ================= MODIFIER =================
  const handleEdit = (student) => {
    setEditStudent(student);
    setStudentForm({ ...student });
  };

  const handleUpdate = async (e) => {
    //e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token || !editStudent) return;

    try {
      const res = await fetch(`http://localhost:8000/api/users/etudiants/${editStudent.id}/update/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(studentForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }
      const updatedStudent = await res.json();
      setStudents(prev => prev.map(s => s.id === editStudent.id ? updatedStudent : s));
      toast.success("Étudiant mis à jour avec succès !");
      setEditStudent(null);
      setStudentForm(null);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour de l'étudiant");
    }
  };


  //===========AJOUTER UN ETUDIANT==========
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
const [newStudentForm, setNewStudentForm] = useState({
  nom: "",
  prenom: "",
  email: "",
  date_naissance: "",
  matricule: "",
  specialite: "",
  annee_etude: "",
});

const handleCreateStudent = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("admin_token");
  if (!token) return toast.error("Token JWT manquant");

  try {
    const res = await fetch("http://localhost:8000/api/users/admin/etudiants/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newStudentForm),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur lors de la création");
    }

    const createdStudent = await res.json();

    // Ajouter au state local
    setStudents((prev) => [
      ...prev,
      { ...newStudentForm, id: createdStudent.id_utilisateur, courses: [], courses_count: 0, progress: 0, joined: new Date().toLocaleDateString() }
    ]);

    toast.success("Étudiant créé et email envoyé !");
    setAddStudentModalOpen(false);
    setNewStudentForm({
      nom: "",
      prenom: "",
      email: "",
      date_naissance: "",
      matricule: "",
      specialite: "",
      annee_etude: "",
    });
  } catch (err) {
    console.error(err);
    toast.error(err.message);
  }
};

  const getGridCols = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  const filteredStudents = students.filter(s =>
    `${s.nom} ${s.prenom}`.toLowerCase().includes(search.toLowerCase())
  );
  console.log({filteredStudents});

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      <Navbar />
      <main className={`flex-1 p-6 pt-10 space-y-5 transition-all duration-300 ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("StudentsManagement.StudentsManagement")}</h1>
            <p className="text-gray">{t("StudentsManagement.view")}</p>
          </div>
          <Button
  text={<span className="flex items-center gap-2"><UserPlus size={18} />Ajouter</span>}
  variant="primary"
  className="!w-auto px-6 py-2 rounded-xl"
  onClick={() => setAddStudentModalOpen(true)}
/>
        </div>

        {/* Search */}
        <ContentSearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} className="w-full max-w-md mb-6 sm:mb-10" />

        {/* Grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
          {filteredStudents.map((s, index) => (
            <div key={index} className="bg-grad-2 rounded-2xl p-6 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-lg transition" onClick={() => setSelectedStudent(s)}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-grad-1 text-white flex items-center justify-center text-lg font-semibold">{s.initials}</div>
                  <div className="truncate">
                    <h2 className="font-semibold text-lg truncate">{s.nom} {s.prenom}</h2>
                    <p className="text-sm text-grayc truncate">{s.email}</p>
                  </div>
                </div>

                <div className="flex gap-4 text-gray-500">
                  <SquarePen size={20} className="text-muted hover:opacity-80" onClick={(e) => { e.stopPropagation(); handleEdit(s); }} />
                  <Trash2 size={20} className="text-red hover:opacity-80" onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} />
                </div>
              </div>

              <div className="mb-2">
                <p className="text-sm text-grayc mb-1">{t("StudentsManagement.Encolled")}: {s.courses_count || 0}</p>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>{t("StudentsManagement.Overal")}</span>
                  <span>{s.progress}%</span>
                </div>
                <ProgressBar value={s.progress} />
              </div>

              <div className="flex justify-between text-sm text-grayc mt-4">
                <span>{t("StudentsManagement.joined")}</span>
                <span className="font-medium">{s.joined}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      <StudentEditModal studentForm={studentForm} setStudentForm={setStudentForm} onClose={() => { setEditStudent(null); setStudentForm(null); }} onSubmit={handleUpdate} />
        {addStudentModalOpen && (
  <StudentAddModal
    studentForm={newStudentForm}
    setStudentForm={setNewStudentForm}
    onClose={() => {
      setAddStudentModalOpen(false);
      setNewStudentForm({
        nom: "",
        prenom: "",
        email: "",
        date_naissance: "",
        matricule: "",
        specialite: "",
        annee_etude: ""
      });
    }}
    onSubmit={handleCreateStudent}
  />
)}


    </div>
  );
}
