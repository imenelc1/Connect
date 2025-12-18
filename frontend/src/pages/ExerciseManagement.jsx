import React, { useState, useEffect } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Search, Pencil, Trash2, Code } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";

export default function ExercisesManagement() {
  const { t } = useTranslation("ExerciseManagement");

  /* ================= STATE ================= */
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState([]);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const [newExercise, setNewExercise] = useState({
    titre_exo: "",
    categorie: "",
    enonce: "",
    niveau_exo: "debutant",
    cours: 1,
  });

  const [editValues, setEditValues] = useState({
    titre_exo: "",
    categorie: "",
    enonce: "",
    niveau_exo: "debutant",
    cours: 1,
  });

  const gradientMap = {
    Débutant: "bg-grad-2",
    Intermédiaire: "bg-grad-3",
    Avancé: "bg-grad-4",
  };

  /* ================= FETCH ================= */
 useEffect(() => {
  fetch("http://localhost:8000/api/exercices/api/exo")
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Les exercices ne sont pas un tableau :", data);
        setExercises([]);
        return;
      }

      const formatted = data.map((ex) => ({
        id_exercice: ex.id_exercice,
        titre_exo: ex.titre_exo,
        categorie: ex.categorie,
        enonce: ex.enonce,
        niveau_exo: ex.niveau_exo, // debutant / intermediaire / avance
        niveau_exercice_label: ex.niveau_exercice_label, // Débutant / Intermédiaire / Avancé
        cours: ex.cours,
        utilisateur: ex.utilisateur,
        utilisateur_name: ex.utilisateur_name,
      }));

      setExercises(formatted);
    })
    .catch((err) => {
      console.error("Erreur chargement exercices :", err);
      setExercises([]);
    });
}, []);


  /* ================= FILTER ================= */
  const filtered = exercises.filter((e) =>
    (e.titre_exo || "").toLowerCase().includes(search.toLowerCase())
  );

  /* ================= CREATE ================= */
  const submitCreate = (e) => {
    e.preventDefault();

    fetch("http://localhost:8000/api/exercices/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(newExercise),
    })
      .then((res) => res.json())
      .then((data) => {
        setExercises([...exercises, data]);
        setCreateModal(false);
        setNewExercise({ titre_exo: "", categorie: "", enonce: "", niveau_exo: "debutant", cours: 1 });
      });
  };

  /* ================= EDIT ================= */
  const openEdit = (ex) => {
    setSelectedExercise(ex);
    setEditValues({
      titre_exo: ex.titre_exo,
      categorie: ex.categorie,
      enonce: ex.enonce,
      niveau_exo: ex.niveau_exo,
      cours: ex.cours,
    });
    setEditModal(true);
  };

  const submitEdit = (e) => {
    e.preventDefault();

    fetch(`http://localhost:8000/api/exercices/${selectedExercise.id_exercice}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(editValues),
    })
      .then((res) => res.json())
      .then((updated) => {
        setExercises(
          exercises.map((ex) =>
            ex.id_exercice === updated.id_exercice ? updated : ex
          )
        );
        setEditModal(false);
      });
  };

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    fetch(`http://localhost:8000/api/exercices/delete/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(() =>
      setExercises(exercises.filter((ex) => ex.id_exercice !== id))
    );
  };

  /* ================= UI ================= */
  return (
    <div className="flex w-full bg-bg min-h-screen overflow-x-hidden">
      <Navbar />

      <div className="flex-1 p-4 md:p-8 md:ml-56">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-textc">{t("title")}</h1>
            <p className="text-textc">{t("description")}</p>
          </div>
          <Button
            text={t("addExerciseButton")}
            variant="primary"
            className="!w-auto px-6 py-3 rounded-xl"
            onClick={() => setCreateModal(true)}
          />
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-6 w-full">
          <div className="relative flex-1 min-w-[280px] lg:min-w-[450px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-primary focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id_exercice}
              className={`rounded-xl shadow p-5 flex flex-col border hover:shadow-md transition ${gradientMap[item.niveau_exercice_label] || "bg-white"}`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="w-12 h-12 flex items-center justify-center bg-grad-2 rounded-lg">
                  <Code size={24} className="text-primary" />
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-lg font-medium ${item.niveau_exo === "debutant"
                    ? "bg-primary/30 text-primary"
                    : item.niveau_exo === "intermediaire"
                    ? "bg-secondary/30 text-secondary"
                    : "bg-pink/30 text-pink"
                  }`}
                >
                  {item.niveau_exercice_label}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-textc">{item.titre_exo}</h3>
              <p className="text-sm text-gray-500">{item.categorie}</p>

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
                    onClick={() => handleDelete(item.id_exercice)}
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
          { label: t("field.title"), value: newExercise.titre_exo, onChange: (e) => setNewExercise({ ...newExercise, titre_exo: e.target.value }) },
          { label: t("field.category"), value: newExercise.categorie, onChange: (e) => setNewExercise({ ...newExercise, categorie: e.target.value }) },
          { label: t("field.statement"), value: newExercise.enonce, onChange: (e) => setNewExercise({ ...newExercise, enonce: e.target.value }) },
          { label: t("field.difficulty"), element: (
            <select value={newExercise.niveau_exo} onChange={(e) => setNewExercise({ ...newExercise, niveau_exo: e.target.value })} className="bg-grisclair rounded-md px-3 py-2">
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          )},
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
          { label: t("field.title"), value: editValues.titre_exo, onChange: (e) => setEditValues({ ...editValues, titre_exo: e.target.value }) },
          { label: t("field.category"), value: editValues.categorie, onChange: (e) => setEditValues({ ...editValues, categorie: e.target.value }) },
          { label: t("field.statement"), value: editValues.enonce, onChange: (e) => setEditValues({ ...editValues, enonce: e.target.value }) },
          { label: t("field.difficulty"), element: (
            <select value={editValues.niveau_exo} onChange={(e) => setEditValues({ ...editValues, niveau_exo: e.target.value })} className="bg-grisclair rounded-md px-3 py-2">
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          )},
        ]}
      />
    </div>
  );
}
