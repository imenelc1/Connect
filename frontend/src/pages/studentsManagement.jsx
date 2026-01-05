import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import Button from "../components/common/Button";
import ProgressBar from "../components/ui/ProgressBar";
import Navbar from "../components/common/NavBar";
import { Trash2, SquarePen, UserPlus } from "lucide-react";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import { toast } from "react-hot-toast";
import Input from "../components/common/Input.jsx";
import ModernDropdown from "../components/common/ModernDropdown.jsx";
import StudentDetailModal from "../components/ui/StudentDetailModal.jsx";
import progressionService from "../services/progressionService";
// ================= MODAL ÉDITION =================
function StudentEditModal({ studentForm, setStudentForm, onClose, onSubmit, editErrors = {}, t }) {
  if (!studentForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-card rounded-xl p-6 w-full max-w-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">
          {t("StudentsManagement.editStudent")}: {studentForm.nom} {studentForm.prenom}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("StudentsManagement.labels.lastName")}
              value={studentForm.nom || ""}
              onChange={e => setStudentForm({ ...studentForm, nom: e.target.value })}
              error={editErrors.nom && t(`StudentsManagement.errors.${editErrors.nom}`)}
            />
            <Input
              label={t("StudentsManagement.labels.firstName")}
              value={studentForm.prenom || ""}
              onChange={e => setStudentForm({ ...studentForm, prenom: e.target.value })}
              error={editErrors.prenom && t(`StudentsManagement.errors.${editErrors.prenom}`)}
            />
          </div>

          <Input
            label={t("StudentsManagement.labels.email")}
            value={studentForm.email || ""}
            onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
            error={editErrors.email && t(`StudentsManagement.errors.${editErrors.email}`)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label={t("StudentsManagement.labels.dob")}
              value={studentForm.dob || ""}
              onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })}
              error={editErrors.dob && t(`StudentsManagement.errors.${editErrors.dob}`)}
            />

            <Input
              label={t("StudentsManagement.labels.regNumber")}
              value={studentForm.matricule || ""}
              onChange={e => setStudentForm({ ...studentForm, matricule: e.target.value })}
              error={editErrors.matricule && t(`StudentsManagement.errors.${editErrors.matricule}`)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ModernDropdown
              value={studentForm.specialite || ""}
              onChange={v => setStudentForm({ ...studentForm, specialite: v })}
              options={[
                { value: "math", label: "Math" },
                { value: "cs", label: "Informatique" },
                { value: "ST", label: "ST" },
              ]}
              placeholder={t("StudentsManagement.labels.speciality")}
              error={editErrors.specialite && t(`StudentsManagement.errors.${editErrors.specialite}`)}
            />
            <ModernDropdown
              value={studentForm.annee_etude || ""}
              onChange={v => setStudentForm({ ...studentForm, annee_etude: v })}
              options={[
                { value: "L1", label: "L1" },
                { value: "L2", label: "L2" },
                { value: "L3", label: "L3" },
                { value: "M1", label: "M1" },
                { value: "M2", label: "M2" },
              ]}
              placeholder={t("StudentsManagement.labels.year")}
              error={editErrors.annee_etude && t(`StudentsManagement.errors.${editErrors.annee_etude}`)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={onClose}>{t("StudentsManagement.buttons.cancel")}</Button>
            <Button type="submit" variant="primary">{t("StudentsManagement.buttons.save")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ================= MODAL AJOUT =================
function StudentAddModal({ studentForm, setStudentForm, onClose, onSubmit, addErrors, t }) {
  if (!studentForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-card rounded-xl p-6 w-full max-w-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">{t("StudentsManagement.addStudent")}</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("StudentsManagement.labels.lastName")}
              value={studentForm.nickname}
              onChange={e => setStudentForm({ ...studentForm, nickname: e.target.value })}
              error={addErrors.nickname && t(`StudentsManagement.errors.${addErrors.nickname}`)}
            />
            <Input
              label={t("StudentsManagement.labels.firstName")}
              value={studentForm.fullname}
              onChange={e => setStudentForm({ ...studentForm, fullname: e.target.value })}
              error={addErrors.fullname && t(`StudentsManagement.errors.${addErrors.fullname}`)}
            />
          </div>

          <Input
            label={t("StudentsManagement.labels.email")}
            value={studentForm.email}
            onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
            error={addErrors.email && t(`StudentsManagement.errors.${addErrors.email}`)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label={t("StudentsManagement.labels.dob")}
              value={studentForm.dob}
              onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })}
              error={addErrors.dob && t(`StudentsManagement.errors.${addErrors.dob}`)}
            />
            <Input
              label={t("StudentsManagement.labels.regNumber")}
              value={studentForm.regnumber}
              onChange={e => setStudentForm({ ...studentForm, regnumber: e.target.value })}
              error={addErrors.regnumber && t(`StudentsManagement.errors.${addErrors.regnumber}`)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ModernDropdown
              value={studentForm.field}
              onChange={v => setStudentForm({ ...studentForm, field: v })}
              options={[
                { value: "math", label: "Math" },
                { value: "cs", label: "Informatique" },
                { value: "ST", label: "ST" },
              ]}
              placeholder={t("StudentsManagement.labels.speciality")}
              error={addErrors.field && t(`StudentsManagement.errors.${addErrors.field}`)}
            />
            <ModernDropdown
              value={studentForm.year}
              onChange={v => setStudentForm({ ...studentForm, year: v })}
              options={[
                { value: "L1", label: "L1" },
                { value: "L2", label: "L2" },
                { value: "L3", label: "L3" },
                { value: "M1", label: "M1" },
                { value: "M2", label: "M2" },
              ]}
              placeholder={t("StudentsManagement.labels.year")}
              error={addErrors.year && t(`StudentsManagement.errors.${addErrors.year}`)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={onClose}>{t("StudentsManagement.buttons.cancel")}</Button>
            <Button type="submit" variant="primary">{t("StudentsManagement.buttons.create")}</Button>
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

    // Convertir la date au format YYYY-MM-DD
    let dobFormatted = "";
    if (student.date_naissance) {
      const date = new Date(student.date_naissance);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0"); // mois commence à 0
      const dd = String(date.getDate()).padStart(2, "0");
      dobFormatted = `${yyyy}-${mm}-${dd}`;
    }

    setStudentForm({
      nom: student.nom || "",
      prenom: student.prenom || "",
      email: student.email || "",
      dob: dobFormatted,   // ici la date correctement formatée
      matricule: student.matricule || "",
      specialite: student.specialite || "",
      annee_etude: student.annee_etude || "",
    });
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

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await progressionService.getCurrentProgressStudents();

        // Formater si nécessaire
        const formatted = data.map(s => ({
          ...s,
          courses_count: s.courses_count || s.courses?.length || 0,
        }));

        setStudents(formatted);
      } catch (err) {
        console.error("Erreur récupération étudiants:", err);
        setError("Impossible de charger les étudiants.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);
  //===========AJOUTER UN ETUDIANT==========
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    nickname: "",
    fullname: "",
    email: "",
    dob: "",
    regnumber: "",
    field: "",
    year: "",
  });


  const [addErrors, setAddErrors] = useState({});


  const validateAddStudent = () => {
    const errors = {};

    // Nom
    if (!newStudentForm.nickname) errors.nickname = "Champ requis";
    else if (/\d/.test(newStudentForm.nickname)) errors.nickname = "Pas de chiffres";

    // Prénom
    if (!newStudentForm.fullname) errors.fullname = "Champ requis";
    else if (/\d/.test(newStudentForm.fullname)) errors.fullname = "Pas de chiffres";

    // Email
    if (!newStudentForm.email || !newStudentForm.email.trim()) errors.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStudentForm.email.trim())) errors.email = "Email invalide";


    // Date de naissance
    if (!newStudentForm.dob) {
      errors.dob = "Champ requis";
    } else {
      const dob = new Date(newStudentForm.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
      if (age < 16) errors.dob = "L'étudiant doit avoir au moins 16 ans";
    }

    // Matricule
    if (!newStudentForm.regnumber) errors.regnumber = "Champ requis";
    else if (!/^\d{12}$/.test(newStudentForm.regnumber)) errors.regnumber = "Matricule invalide";

    // Spécialité
    if (!newStudentForm.field) errors.field = "Champ requis";

    // Année
    if (!newStudentForm.year) errors.year = "Champ requis";

    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    if (!validateAddStudent()) {
      toast.error("Corrigez les erreurs avant de continuer");
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Token JWT manquant");
      return;
    }

    const payload = {
      nom: newStudentForm.nickname,
      prenom: newStudentForm.fullname,
      email: newStudentForm.email, // <-- changer ici
      date_naissance: newStudentForm.dob,
      matricule: newStudentForm.regnumber,
      specialite: newStudentForm.field,
      annee_etude: newStudentForm.year,
      role: "etudiant",
    };


    try {
      const res = await fetch("http://localhost:8000/api/users/admin/etudiants/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend error:", data);
        throw new Error(data.error || "Erreur lors de la création");
      }

      // Ajouter le nouvel étudiant à la liste
      setStudents((prev) => [
        ...prev,
        {
          id: data.id_utilisateur || Date.now(), // fallback ID
          nom: payload.nom,
          prenom: payload.prenom,
          email: payload.adresse_email,
          progress: 0,
          courses_count: 0,
        },
      ]);

      toast.success("Étudiant créé avec succès");

      // Reset formulaire
      setNewStudentForm({
        nickname: "",
        fullname: "",
        email: "",
        dob: "",
        regnumber: "",
        field: "",
        year: "",
      });
      setAddErrors({});
      setAddStudentModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur création étudiant");
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
  console.log({ filteredStudents });

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      <main className={`
        flex-1 p-4 sm:p-6 pt-10 space-y-5 transition-all duration-300 min-h-screen w-full overflow-x-hidden
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>


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
            <div key={index} className="bg-grad-2 rounded-2xl p-6 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-lg transition" onClick={() => setSelectedStudent(s)} >
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
      <StudentDetailModal
        open={!!selectedStudent}
        studentId={selectedStudent?.id} // juste l'ID pour fetch les détails
        onClose={() => setSelectedStudent(null)}
      />


      <StudentEditModal
        studentForm={studentForm}
        setStudentForm={setStudentForm}
        onClose={() => { setEditStudent(null); setStudentForm(null); }}
        onSubmit={handleUpdate}
        editErrors={{}} // si tu veux
        t={t}          // <-- ajouter ça
      />
      {addStudentModalOpen && (
        <StudentAddModal
          studentForm={newStudentForm}
          setStudentForm={setNewStudentForm}
          onClose={() => {
            setAddStudentModalOpen(false);
            setNewStudentForm({
              nickname: "",
              fullname: "",
              email: "",
              dob: "",
              regnumber: "",
              field: "",
              year: "",
            });
          }}
          onSubmit={handleCreateStudent}
          addErrors={addErrors}
          t={t}          // <-- ajouter ça
        />
      )}



    </div>
  );
}