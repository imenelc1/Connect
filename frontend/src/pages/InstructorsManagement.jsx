import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ModernDropdown from "../components/common/ModernDropdown.jsx";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import { Users, Trash2, Edit, Calendar, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../services/api";

// ================= MODAL DETAILS =================
function InstructorDetailModal({ open, onClose, instructor }) {
  if (!open || !instructor) return null;
  const { t } = useTranslation("instructors");
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-card rounded-xl shadow-lg p-6 w-[400px]">
        <h2 className="text-xl text-muted font-bold mb-4">{t("instructorResume")}</h2>
        <ul className="text-sm text-gray space-y-2">
          <li><strong>{t("firstName")} :</strong> {instructor.nickname}</li>
          <li><strong>{t("lastName")} :</strong> {instructor.fullname}</li>
          <li><strong>{t("email")} :</strong> {instructor.email}</li>
          <li><strong>{t("birthdate")} :</strong> {instructor.dob}</li>
          <li><strong>{t("rank")} :</strong> {instructor.rank}</li>
          <li><strong>{t("matricule")} :</strong> {instructor.regnumber}</li>
        </ul>

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>{t("close")}</Button>
        </div>
      </div>
    </div>
  );
}

// ================= MODAL AJOUT / EDIT =================
function InstructorAddEditModal({ open, onClose, onSubmit, instructorForm, setInstructorForm, errors, isEdit }) {
  if (!open) return null;
  const { t } = useTranslation("instructors");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? t("updateInstructor") : t("addInstructor")}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("firstName")}
              name="nickname"
              value={instructorForm.nickname}
              onChange={e => setInstructorForm({ ...instructorForm, nickname: e.target.value })}
              error={errors.nickname}
            />
            <Input
              label={t("lastName")}
              name="fullname"
              value={instructorForm.fullname}
              onChange={e => setInstructorForm({ ...instructorForm, fullname: e.target.value })}
              error={errors.fullname}
            />
          </div>

          <Input
            label={t("email")}
            name="email"
            value={instructorForm.email}
            onChange={e => setInstructorForm({ ...instructorForm, email: e.target.value })}
            error={errors.email}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("birthdate")}
              type="date"
              name="dob"
              value={instructorForm.dob}
              onChange={e => setInstructorForm({ ...instructorForm, dob: e.target.value })}
              error={errors.dob}
            />
            <Input
              label={t("matricule")}
              name="regnumber"
              value={instructorForm.regnumber}
              onChange={e => setInstructorForm({ ...instructorForm, regnumber: e.target.value })}
              error={errors.regnumber}
            />
          </div>

          <ModernDropdown
            value={instructorForm.rank}
            onChange={val => setInstructorForm({ ...instructorForm, rank: val })}
            options={[
              { value: "Prof", label: t("prof") },
              { value: "maitre conf", label: t("MC") },
              { value: "maitre ass", label: t("MA") }
            ]}
            placeholder={t("rank")}
            error={errors.rank}
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={onClose}>{t("cancel")}</Button>
            <Button type="submit" variant="primary" className="!px-6 !py-2">{isEdit ? t("update") : t("create")}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ================= PAGE =================
export default function InstructorsPage() {
  const { t } = useTranslation("instructors");
  const { toggleDarkMode } = useContext(ThemeContext);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [instructorForm, setInstructorForm] = useState({
    nickname: "",
    fullname: "",
    email: "",
    dob: "",
    regnumber: "",
    rank: ""
  });
  const [errors, setErrors] = useState({});

  // ================= FETCH =================
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("http://localhost:8000/api/users/enseignants/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const formatted = data.map(e => ({
          nickname: e.prenom,
          fullname: e.nom,
          email: e.email || "",
          dob: e.date_naissance || "",
          rank: e.grade || "",
          regnumber: e.matricule || ""
        }));
        setInstructors(formatted);
      } catch (err) {
        console.error("Erreur chargement enseignants :", err);
        toast.error(t("loadError"));
      }
    };
    fetchInstructors();
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

  // ================= VALIDATION =================
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
    const matriculeRegex = /^\d{12}$/;
    const newErrors = {};

    if (!instructorForm.nickname.trim()) newErrors.nickname = t("requiredField");
    else if (!nameRegex.test(instructorForm.nickname)) newErrors.nickname = t("invalidName");

    if (!instructorForm.fullname.trim()) newErrors.fullname = t("requiredField");
    else if (!nameRegex.test(instructorForm.fullname)) newErrors.fullname = t("invalidName");

    if (!instructorForm.email.trim()) newErrors.email = t("requiredField");
    else if (!emailRegex.test(instructorForm.email)) newErrors.email = t("invalidEmail");

    if (!instructorForm.dob) newErrors.dob = t("requiredField");

    if (!instructorForm.regnumber) newErrors.regnumber = t("requiredField");
    else if (!matriculeRegex.test(instructorForm.regnumber)) newErrors.regnumber = t("regnumberInvalid");

    if (!instructorForm.rank) newErrors.rank = t("gradeRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error(t("fixErrors"));
      return;
    }

    const payload = {
      prenom: instructorForm.nickname,
      nom: instructorForm.fullname,
      email: instructorForm.email, // <-- utiliser le nom correct
      date_naissance: instructorForm.dob,
      matricule: instructorForm.regnumber,
      grade: instructorForm.rank,
      role: "enseignant"
    };


    try {
      const token = localStorage.getItem("admin_token");
      const url = editIndex !== null
        ? `http://localhost:8000/api/users/admin/enseignants/${editIndex}/update/`
        : "http://localhost:8000/api/users/admin/enseignants/create/";

      const method = editIndex !== null ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      if (editIndex !== null) {
        const updated = [...instructors];
        updated[editIndex] = instructorForm;
        setInstructors(updated);
        setEditIndex(null);
      } else {
        setInstructors([...instructors, instructorForm]);
      }

      toast.success(editIndex !== null ? t("updateSuccess") : t("createSuccess"));
      setInstructorForm({
        nickname: "", fullname: "", email: "", dob: "", regnumber: "", rank: ""
      });
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || t("networkError"));
    }
  };

  // ================= LOGIC =================
  const handleEdit = (index) => {
    setInstructorForm(instructors[index]);
    setEditIndex(index);
    setOpenModal(true);
  };

  const handleDelete = (index) => {
    setInstructors(instructors.filter((_, i) => i !== index));
  };

  const handleRowClick = (instructor) => {
    setSelectedInstructor(instructor);
    setOpenDetails(true);
  };

  const filtered = instructors.filter(i =>
    `${i.nickname} ${i.fullname}`.toLowerCase().includes(search.toLowerCase())
  );

  // ================= RENDER =================
  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      <Navbar />
      <main
        className={`flex-1 p-6 pt-10 space-y-5 transition-all duration-300 ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""
          }`}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Users size={28} className="text-muted" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("title")}</h1>
              <p className="text-gray">{t("subtitle")}</p>
            </div>
          </div>

          <Button
            text={<span className="flex items-center gap-2"><Plus size={18} />{t("addInstructor")}</span>}
            variant="primary"
            className="!w-auto px-6 py-2 rounded-xl"
            onClick={() => { setEditIndex(null); setOpenModal(true); }}
          />
        </div>

        {/* SEARCH */}
        <div className="max-w-md">
          <ContentSearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} />
        </div>

        {/* TABLE */}
        <div className="bg-card rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-grad-3">
              <tr>
                <th className="px-6 py-3">{t("firstName")}</th>
                <th className="px-6 py-3">{t("lastName")}</th>
                <th className="px-6 py-3 hidden sm:table-cell">{t("email")}</th>
                <th className="px-6 py-3 hidden md:table-cell">{t("birthdate")}</th>
                <th className="px-6 py-3 hidden lg:table-cell">{t("rank")}</th>
                <th className="px-6 py-3 hidden lg:table-cell">{t("matricule")}</th>
                <th className="px-6 py-3">{t("actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((i, index) => (
                <tr key={index} onClick={() => handleRowClick(i)} className="border-t hover:bg-card cursor-pointer">
                  <td className="px-6 py-4">{i.nickname}</td>
                  <td className="px-6 py-4">{i.fullname}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">{i.email}</td>
                  <td className="px-6 py-4 hidden md:table-cell"><Calendar size={14} className="inline mr-2" />{i.dob}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">{i.rank}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">{i.regnumber}</td>
                  <td className="px-6 py-4">
                    <Edit size={18} className="inline mr-3 text-blue" onClick={e => { e.stopPropagation(); handleEdit(index); }} />
                    <Trash2 size={18} className="inline text-red" onClick={e => { e.stopPropagation(); handleDelete(index); }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODALS */}
      <InstructorAddEditModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
        instructorForm={instructorForm}
        setInstructorForm={setInstructorForm}
        errors={errors}
        isEdit={editIndex !== null}
      />

      <InstructorDetailModal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        instructor={selectedInstructor}
      />
    </div>
  );
}
