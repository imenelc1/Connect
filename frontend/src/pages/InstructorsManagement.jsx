import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import AddModel from "../components/common/AddModel";
import { Users, Trash2, Edit, Calendar, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";

// Petit composant pour afficher les détails
function DetailsModal({ open, onClose, instructor }) {
  if (!open || !instructor) return null;
  const { t, i18n } = useTranslation("instructors");
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-card rounded-xl shadow-lg p-6 w-[400px]">
        <h2 className="text-xl text-muted font-bold mb-4">{t("instructorResume")}</h2>
        <ul className="text-sm text-gray space-y-2">
          <li><strong>{t("firstName")} :</strong> {instructor.firstName}</li>
          <li><strong>{t("lastName")} :</strong> {instructor.lastName}</li>
          <li><strong>{t("email")} :</strong> {instructor.email}</li>
          <li><strong>{t("birthdate")} :</strong> {instructor.birthdate}</li>
          <li><strong>{t("rank")} :</strong> {instructor.rank}</li>
          <li><strong>{t("matricule")} :</strong> {instructor.matricule}</li>
          <li><strong>{t("password")} :</strong> {instructor.password}</li>
        </ul>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>{t("close")}</Button>
        </div>
      </div>
    </div>
  );
}

export default function InstructorsPage() {
  const { t, i18n } = useTranslation("instructors");
  const { toggleDarkMode } = useContext(ThemeContext);
  
  // États pour la responsivité
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const [newInstructor, setNewInstructor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthdate: "",
    rank: "",
    matricule: "",
    password: ""
  });

  const [instructors, setInstructors] = useState([
    { firstName: "John", lastName: "Smith", email: "smith@platform.com", birthdate: "1975-03-12", rank: "Professeur", matricule: "MAT001", password: "pass123" },
    { firstName: "Paul", lastName: "Johnson", email: "johnson@platform.com", birthdate: "1980-07-22", rank: "Maître de conférence", matricule: "MAT002", password: "pass456" },
    { firstName: "David", lastName: "Williams", email: "williams@platform.com", birthdate: "1978-11-05", rank: "Maître assistant", matricule: "MAT003", password: "pass789" }
  ]);

  // Effet pour la responsivité
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Gestion de la sidebar
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  const filtered = instructors.filter((i) =>
    (i.firstName + " " + i.lastName).toLowerCase().includes(search.toLowerCase())
  );

  const fields = [
    { label: t("firstName"), placeholder: "Ex: John", value: newInstructor.firstName, onChange: (e) => setNewInstructor({ ...newInstructor, firstName: e.target.value }) },
    { label: t("lastName"), placeholder: "Ex: Smith", value: newInstructor.lastName, onChange: (e) => setNewInstructor({ ...newInstructor, lastName: e.target.value }) },
    { label: t("email"), placeholder: "Ex: smith@platform.com", value: newInstructor.email, onChange: (e) => setNewInstructor({ ...newInstructor, email: e.target.value }) },
    { label: t("birthdate"), type: "date", placeholder: "Ex: 1975-03-12", value: newInstructor.birthdate, onChange: (e) => setNewInstructor({ ...newInstructor, birthdate: e.target.value }) },
    { label: t("rank"), placeholder: "Ex: Professeur", value: newInstructor.rank, onChange: (e) => setNewInstructor({ ...newInstructor, rank: e.target.value }) },
    { label: t("matricule"), placeholder: "Ex: MAT001", value: newInstructor.matricule, onChange: (e) => setNewInstructor({ ...newInstructor, matricule: e.target.value }) },
    { label: t("password"), type: "password", placeholder: "••••••", value: newInstructor.password, onChange: (e) => setNewInstructor({ ...newInstructor, password: e.target.value }) }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = [...instructors];
      updated[editIndex] = { ...newInstructor };
      setInstructors(updated);
      setEditIndex(null);
    } else {
      setInstructors([...instructors, { ...newInstructor }]);
    }
    setOpenModal(false);
    setNewInstructor({ firstName: "", lastName: "", email: "", birthdate: "", rank: "", matricule: "", password: "" });
  };

  const handleDelete = (index) => {
    setInstructors(instructors.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    const instructor = instructors[index];
    setNewInstructor({ ...instructor });
    setEditIndex(index);
    setOpenModal(true);
  };

  const handleRowClick = (instructor) => {
    setSelectedInstructor(instructor);
    setOpenDetails(true);
  };

  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      {/* Sidebar */}
      <div>
        <Navbar />
      </div>

      {/* Main Content */}
      <main className={`
        flex-1 p-6 pt-10 space-y-5 transition-all duration-300
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Users size={28} className="text-muted" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("title")}</h1>
              <p className="text-gray">{t("subtitle")}</p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <Button
              text={
                <span className="flex items-center gap-2">
                  <Plus size={18} />
                  {t("addInstructor")}
                </span>
              }
              variant="primary"
              className="!w-auto px-6 py-2 rounded-xl"
              onClick={() => {
                setEditIndex(null);
                setNewInstructor({ firstName: "", lastName: "", email: "", birthdate: "", rank: "", matricule: "", password: "" });
                setOpenModal(true);
              }}
            />
           
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-6 sm:mb-10 w-full max-w-md">
          <ContentSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full"
          />
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl  shadow-sm overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-grad-3 text-gray-700">
                <tr>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 font-medium">{t("firstName")}</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 font-medium">{t("lastName")}</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 font-medium hidden sm:table-cell">{t("email")}</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 font-medium hidden md:table-cell">{t("birthdate")}</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 font-medium hidden lg:table-cell">{t("rank")}</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 font-medium hidden lg:table-cell">{t("matricule")}</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 font-medium">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 hover:bg-card cursor-pointer transition"
                    onClick={() => handleRowClick(i)}
                  >
                    <td className="px-4 py-4 sm:px-6 sm:py-4 font-medium text-muted">{i.firstName}</td>
                    <td className="px-4 py-4 sm:px-6 sm:py-4 font-medium text-muted">{i.lastName}</td>
                    <td className="px-4 py-4 sm:px-6 sm:py-4 text-grayc hidden sm:table-cell">{i.email}</td>
                    <td className="px-4 py-4 sm:px-6 sm:py-4 text-grayc hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue" />
                        {i.birthdate}
                      </div>
                    </td>
                    <td className="px-4 py-4 sm:px-6 sm:py-4 text-grayc hidden lg:table-cell">{i.rank}</td>
                    <td className="px-4 py-4 sm:px-6 sm:py-4 text-grayc hidden lg:table-cell">{i.matricule}</td>
                    <td className="px-4 py-4 sm:px-6 sm:py-4 text-gray-500">
                      <div className="flex items-center gap-3">
                        <button
                          className="hover:opacity-80 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(index);
                          }}
                          title={t("edit")}
                        >
                          <Edit size={18} className="text-blue" />
                        </button>
                        <button
                          className="hover:opacity-80 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(index);
                          }}
                          title={t("delete")}
                        >
                          <Trash2 size={18} className="text-red" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">{t("noResults")}</p>
          </div>
        )}
      </main>

      {/* Modal d'ajout/édition */}
      <AddModel
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editIndex !== null ? t("modalEditTitle") : t("modalAddTitle")}
        subtitle={editIndex !== null ? t("modalEditSubtitle") : t("modalAddSubtitle")}
        fields={fields}
        submitLabel={editIndex !== null ? t("update") : t("create")}
        cancelLabel={t("cancel")}
        onSubmit={handleSubmit}
      />

      {/* Modal de détails */}
      <DetailsModal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        instructor={selectedInstructor}
      />
    </div>
  );
}
