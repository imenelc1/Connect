import React, { useState, useEffect, useContext } from "react";
import Button from "../components/common/Button";
import ProgressBar from "../components/ui/ProgressBar";
import Navbar from "../components/common/Navbar";
import { Trash2, SquarePen, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import { toast } from "react-hot-toast";
import Input from "../components/common/Input.jsx";
import ModernDropdown from "../components/common/ModernDropdown.jsx";
import StudentDetailModal from "../components/ui/StudentDetailModal.jsx";

// ================= MODAL ÉDITION =================
function StudentEditModal({ studentForm, setStudentForm, onClose, onSubmit, editErrors }) {
  const { t } = useTranslation("StudentsManagement");
  if (!studentForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-card rounded-xl p-6 w-full max-w-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">
          {t("StudentsManagement.editStudentTitle", {
            firstName: studentForm.prenom,
            lastName: studentForm.nom,
          })}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nom / Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("StudentsManagement.labels.lastName")}
              value={studentForm.nom}
              onChange={e =>
                setStudentForm({ ...studentForm, nom: e.target.value })
              }
              error={editErrors?.nom}
            />
            <Input
              label={t("StudentsManagement.labels.firstName")}
              value={studentForm.prenom}
              onChange={e =>
                setStudentForm({ ...studentForm, prenom: e.target.value })
              }
              error={editErrors?.prenom}
            />
          </div>

          {/* Email */}
          <Input
            label={t("StudentsManagement.labels.email")}
            value={studentForm.email}
            onChange={e =>
              setStudentForm({ ...studentForm, email: e.target.value })
            }
            error={editErrors?.email}
          />

          {/* Date de naissance / Matricule */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label={t("StudentsManagement.labels.dob")}
              value={studentForm.date_naissance}
              onChange={e =>
                setStudentForm({ ...studentForm, date_naissance: e.target.value })
              }
              error={editErrors?.date_naissance}
            />
            <Input
              label={t("StudentsManagement.labels.regNumber")}
              value={studentForm.matricule}
              onChange={e =>
                setStudentForm({ ...studentForm, matricule: e.target.value })
              }
              error={editErrors?.matricule}
            />
          </div>

          {/* Spécialité  */}
          <div className="grid grid-cols-2 gap-4">
            <ModernDropdown
              value={studentForm.specialite}
              onChange={v =>
                setStudentForm({ ...studentForm, specialite: v })
              }
              options={[
                { value: "math", label: t("StudentsManagement.subjects.math") },
                { value: "cs", label: t("StudentsManagement.subjects.cs") },
                { value: "ST", label: t("StudentsManagement.subjects.st") },
              ]}
              placeholder={t("StudentsManagement.specialtyPlaceholder")}
              error={editErrors?.specialite}
            />
            <ModernDropdown
              value={studentForm.annee_etude}
              onChange={v =>
                setStudentForm({ ...studentForm, annee_etude: v })
              }
              options={[
                { value: "L1", label: "L1" },
                { value: "L2", label: "L2" },
                { value: "L3", label: "L3" },
                { value: "Ing1", label: "Ing1" },
                { value: "Ing2", label: "Ing2" },
                { value: "Ing3", label: "Ing3" },
                { value: "Ing4", label: "Ing4" },
                { value: "M1", label: "M1" },
                { value: "M2", label: "M2" },
                { value: "M2", label: "M2" },
              ]}
              placeholder={t("StudentsManagement.year")}
              error={editErrors?.annee_etude}
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={onClose}>
              {t("StudentsManagement.buttons.cancel")}
            </Button>
            <Button type="submit" variant="primary">
              {t("StudentsManagement.buttons.save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}



// ================= MODAL AJOUT =================
function StudentAddModal({ onClose, studentForm, setStudentForm, onSubmit, addErrors }) {
  const { t } = useTranslation("StudentsManagement");
  if (!studentForm) return null; 

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-card rounded-xl p-6 w-full max-w-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">  {t("StudentsManagement.addStudent")}</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nom / Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("StudentsManagement.labels.lastName")}
              value={studentForm.nickname}
              onChange={e => setStudentForm({ ...studentForm, nickname: e.target.value })}
              error={addErrors.nickname}
            />
            <Input
              label={t("StudentsManagement.labels.firstName")}
              value={studentForm.fullname}
              onChange={e => setStudentForm({ ...studentForm, fullname: e.target.value })}
              error={addErrors.fullname}
            />
          </div>

          {/* Email */}
          <Input
            label={t("StudentsManagement.labels.email")}
            value={studentForm.email}
            onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
            error={addErrors.email}
          />

          {/* Date de naissance / Matricule */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label={t("StudentsManagement.labels.dob")}
              value={studentForm.dob}
              onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })}
              error={addErrors.dob}
            />
            <Input
              label={t("StudentsManagement.labels.regNumber")}
              value={studentForm.regnumber}
              onChange={e => setStudentForm({ ...studentForm, regnumber: e.target.value })}
              error={addErrors.regnumber}
            />
          </div>

          {/* Spécialité / Année */}
          <div className="grid grid-cols-2 gap-4">
            <ModernDropdown
              value={studentForm.field}
              onChange={(v) => setStudentForm({ ...studentForm, field: v })}
              options={[
                { value: "math", label: t("StudentsManagement.subjects.math") },
                { value: "cs", label: t("StudentsManagement.subjects.cs") },
                { value: "ST", label: t("StudentsManagement.subjects.st") },
              ]}
              placeholder={t("StudentsManagement.specialtyPlaceholder")}
              error={addErrors.field}
            />
            <ModernDropdown
              value={studentForm.year}
              onChange={(v) => setStudentForm({ ...studentForm, year: v })}
              options={[
                { value: "L1", label: "L1" },
                { value: "L2", label: "L2" },
                { value: "L3", label: "L3" },
                { value: "M1", label: "M1" },
                { value: "M2", label: "M2" },
              ]}
              placeholder={t("StudentsManagement.year")}
              error={addErrors.year}
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={onClose}> {t("StudentsManagement.buttons.cancel")}</Button>
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
      if (!token) {
        setError(t("StudentsManagement.errors.missingToken"));
        return;
      }

      setLoading(true);
      try {
        // 1️⃣ Liste existante des étudiants
        const res = await fetch(
          "http://localhost:8000/api/users/students-with-progress/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`Erreur (${res.status})`);

        const studentsData = await res.json();

        const studentsWithRealProgress = await Promise.all(
          studentsData.map(async (s) => {
            const progRes = await fetch(
              `http://localhost:8000/api/dashboard/global-progress/${s.id}/`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!progRes.ok) {
              console.warn(t("StudentsManagement.errors.loadProgress"), s.id);
              return { ...s, progress: 0 };
            }

            const progData = await progRes.json();

            return {
              ...s,
              progress: progData.global_progress ?? 0,
            };
          })
        );

        setStudents(studentsWithRealProgress);

      } catch (err) {
        console.error(err);
        setError(t("StudentsManagement.errors.loadStudents"));
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);



  // ================= RESIZE =================
  useEffect(() => {
    const resizeHandler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);
  useEffect(() => {
    const handler = (e) => setSidebarCollapsed(e.detail);
    window.addEventListener("sidebarChanged", handler);
    return () => window.removeEventListener("sidebarChanged", handler);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 60 : 240;

  // ================= SUPPRIMER =================
  const handleDelete = async (studentId) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return setError(t("StudentsManagement.errors.missingToken"));
    if (!window.confirm(t("StudentsManagement.messages.confirmDeleteStudent"))) return;


    try {
      const res = await fetch(`http://localhost:8000/api/users/admin/users/${studentId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("StudentsManagement.errors.deleteFailed"));
      }
      setStudents(prev => prev.filter(s => s.id === studentId ? false : true));
      toast.success(t("StudentsManagement.messages.studentDeleted"));
    } catch (err) {
      console.error(err);
      setError(err.message || t("StudentsManagement.errors.deleteStudentFailed"));
    }
  };

  // ================= MODIFIER =================
  const handleEdit = (student) => {
    setEditStudent(student);
    setStudentForm({ ...student });
  };

  const handleUpdate = async (e) => {
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
        throw new Error(data.error || t("StudentsManagement.errors.updateStudentFailed"));

      }
      const updatedStudent = await res.json();
      setStudents(prev => prev.map(s => s.id === editStudent.id ? updatedStudent : s));
      toast.success(t("StudentsManagement.messages.studentUpdated"));
      setEditStudent(null);
      setStudentForm(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || t("StudentsManagement.errors.updateStudentFailed"));

    }
  };


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
    if (!newStudentForm.nickname) errors.nickname = t("StudentsManagement.errors.required");
    else if (/\d/.test(newStudentForm.nickname)) errors.nickname = t("StudentsManagement.errors.noNumbers");

    // Prénom
    if (!newStudentForm.fullname) errors.fullname = t("StudentsManagement.errors.required");
    else if (/\d/.test(newStudentForm.fullname)) errors.fullname = t("StudentsManagement.errors.noNumbers");

    // Email
    if (!newStudentForm.email || !newStudentForm.email.trim()) errors.email = t("StudentsManagement.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStudentForm.email.trim())) errors.email = t("StudentsManagement.errors.invalidEmail");


    // Date de naissance
    if (!newStudentForm.dob) {
      errors.dob = t("StudentsManagement.errors.required");
    } else {
      const dob = new Date(newStudentForm.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
      if (age < 16) errors.dob = t("StudentsManagement.errors.minAge");
    }

    // Matricule
    if (!newStudentForm.regnumber) errors.regnumber = t("StudentsManagement.errors.required");
    else if (!/^\d{12}$/.test(newStudentForm.regnumber)) errors.regnumber = t("StudentsManagement.errors.invalidRegNumber");

    // Spécialité
    if (!newStudentForm.field) errors.field = t("StudentsManagement.errors.required");

    // Année
    if (!newStudentForm.year) errors.year = t("StudentsManagement.errors.required");

    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    if (!validateAddStudent()) {
      toast.error(t("StudentsManagement.errors.fixErrors"));
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error(t("StudentsManagement.errors.missingToken"));
      return;
    }

    const payload = {
      nom: newStudentForm.nickname,
      prenom: newStudentForm.fullname,
      email: newStudentForm.email, 
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
        throw new Error(data.error || t("StudentsManagement.errors.createStudent"));
      }

      // Ajouter le nouvel étudiant à la liste
      setStudents((prev) => [
        ...prev,
        {
          id: data.id_utilisateur || Date.now(), 
          nom: payload.nom,
          prenom: payload.prenom,
          email: payload.adresse_email,
          progress: 0,
          courses_count: 0,
        },
      ]);

      toast.success(t("StudentsManagement.messages.studentCreated"));

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
      toast.error(err.message || t("StudentsManagement.errors.createStudent"));
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
            text={<span className="flex items-center gap-2"><UserPlus size={18} /> {t("StudentsManagement.buttons.add")}</span>}
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
        studentId={selectedStudent?.id}
        joined={selectedStudent?.joined}
        onClose={() => setSelectedStudent(null)}
      />


      <StudentEditModal studentForm={studentForm} setStudentForm={setStudentForm} onClose={() => { setEditStudent(null); setStudentForm(null); }} onSubmit={handleUpdate} />
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
        />
      )}



    </div>
  );
}
