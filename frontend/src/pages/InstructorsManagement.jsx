import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import AddModel from "../components/common/AddModel";
import { Users, Trash2, Edit, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

// Petit composant pour afficher les détails
function DetailsModal({ open, onClose, instructor }) {
  if (!open || !instructor) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">{t("instructorSummary")}</h2>
        <ul className="text-sm text-gray-700 space-y-2">
          <li><strong>Prénom :</strong> {instructor.firstName}</li>
          <li><strong>Nom :</strong> {instructor.lastName}</li>
          <li><strong>Email :</strong> {instructor.email}</li>
          <li><strong>Date de naissance :</strong> {instructor.birthdate}</li>
          <li><strong>Rang :</strong> {instructor.rank}</li>
          <li><strong>Matricule :</strong> {instructor.matricule}</li>
          <li><strong>Mot de passe :</strong> {instructor.password}</li>
        </ul>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}

export default function InstructorsPage() {
  const { t, i18n } = useTranslation("instructors");

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

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex">
      <Navbar />

      <main className="flex-1 p-6 ml-16 md:ml-56 bg-background transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-black flex items-center gap-2">
              <Users size={28} /> {t("title")}
            </h1>
            <p className="text-gray-700">{t("subtitle")}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={toggleLanguage}
              className="!px-3 !py-1 !w-auto !h-auto text-sm"
            >
              {t("toggleLang")}
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                setEditIndex(null);
                setNewInstructor({ firstName: "", lastName: "", email: "", birthdate: "", rank: "", matricule: "", password: "" });
                setOpenModal(true);
              }}
              className="!px-4 !py-2 !w-auto !h-auto"
            >
              {t("addInstructor")}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-6xl mx-auto mb-6">
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray_light text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

                {/* Table */}
        <div className="max-w-6xl mx-auto bg-white rounded-xl border border-gray_light shadow-card overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray_light/40 text-grayc">
              <tr>
                <th className="px-6 py-3">{t("firstName")}</th>
                <th className="px-6 py-3">{t("lastName")}</th>
                <th className="px-6 py-3">{t("email")}</th>
                <th className="px-6 py-3">{t("birthdate")}</th>
                <th className="px-6 py-3">{t("rank")}</th>
                <th className="px-6 py-3">{t("matricule")}</th>
                <th className="px-6 py-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i, index) => (
                <tr
                  key={index}
                  className="border-t border-gray_light hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(i)} // clic sur la ligne => ouvre détails
                >
                  <td className="px-6 py-4 text-textc">{i.firstName}</td>
                  <td className="px-6 py-4 text-textc">{i.lastName}</td>
                  <td className="px-6 py-4 text-grayc">{i.email}</td>
                  <td className="px-6 py-4 text-grayc flex items-center gap-2">
                    <Calendar size={16} className="text-blue" />
                    {i.birthdate}
                  </td>
                  <td className="px-6 py-4 text-grayc">{i.rank}</td>
                  <td className="px-6 py-4 text-grayc">{i.matricule}</td>
                  <td className="px-6 py-4 text-grayc flex items-center gap-4">
                    <button
                      className="hover:opacity-80"
                      onClick={(e) => {
                        e.stopPropagation(); // empêche ouverture détails
                        handleEdit(index);
                      }}
                    >
                      <Edit size={18} className="text-blue" />
                    </button>
                    <button
                      className="hover:opacity-80"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(index);
                      }}
                    >
                      <Trash2 size={18} className="text-red" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
