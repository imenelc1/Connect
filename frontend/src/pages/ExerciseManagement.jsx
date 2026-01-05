import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/Navbar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Search, SquarePen, Trash2, Code } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
// Navigation entre routes (React Router)
import { useNavigate } from "react-router-dom";
import api from "../services/courseService";
import { toast } from 'react-hot-toast';
// Thème global (dark/light mode)
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import ContentSearchBar from "../components/common/ContentSearchBar";

const buttonStyles = {
  Débutant: "bg-blue text-white",
  Intermédiaire: "bg-purple text-white",
  Avancé: "bg-pink text-white",
};

export default function ExercisesManagement() {
  // SEARCH contrôlé
  const [search, setSearch] = useState("");
  // Hook pour naviguer vers d'autres pages
  const navigate = useNavigate();
  const { toggleDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation("ExerciseManagement");

  // États pour la responsivité
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);



  // LISTE
  const [exercises, setExercises] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [courses, setCourses] = useState([]);
useEffect(() => {
  const fetchCourses = async () => {
    try {
      const res = await api.get("courses/");
      setCourses(res.data);
    } catch (err) {
      console.error("Erreur chargement cours", err);
    }
  };

  fetchCourses();
}, []);
const getCourseTitle = (courseId) => {
  const course = courses.find(c => c.id_cours === courseId);
  return course ? course.titre_cour : "—";
};


  const [editValues, setEditValues] = useState({
    titre_exo: "",
    categorie: "",
    enonce: "",
    niveau_exo: "debutant",
    visibilite_exo: false,
    cours: 1,
    utilisateur: 1
  });


  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("http://localhost:8000/api/exercices/api/exo")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error(t("errors.invalidData"), data);
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
          visibilite_exo: ex.visibilite_exo, //est un boolean
          visibilite_exo_label:ex.visibilite_exo_label,
          max_soumissions:ex.max_soumissions
        }));

        setExercises(formatted);
      })
      .catch((err) => {
        console.error(t("errors.fetchExercises"), err);
        setExercises([]);
      });
  }, []);


  /* ================= FILTER ================= */
  const filtered = exercises.filter((e) =>
    (e.titre_exo || "").toLowerCase().includes(search.toLowerCase())
  );


  /* ================= EDIT ================= */
  const openEdit = (ex) => {
    setSelectedExercise(ex);
    setEditValues({
      titre_exo: ex.titre_exo,
      categorie: ex.categorie,
      enonce: ex.enonce,
      niveau_exo: ex.niveau_exo,
      cours: ex.cours,
      visibilite_exo: ex.visibilite_exo,
      utilisateur: ex.utilisateur,
    });
    setEditModal(true);
  };
  const token = localStorage.getItem("admin_token"); // JWT admin


  const submitEdit = async () => {
    if (!selectedExercise) return;

    const token = localStorage.getItem("admin_token"); // ou "token"

    console.log({ selectedExercise });

    try {
      const res = await api.put(
        `exercices/${selectedExercise.id_exercice}/`,
        {
          titre_exo: editValues.titre_exo,
          enonce: editValues.enonce,
          niveau_exo: editValues.niveau_exo,
          categorie: editValues.categorie,
          visibilite_exo: editValues.visibilite_exo,
          
          utilisateur: editValues.utilisateur,
          cours: editValues.cours
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Toast ou alert succès
      toast.success("Exercice mis à jour avec succès !");

      // Mettre à jour la liste localement
      const updatedExo = res.data;
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id_exercice === updatedExo.id_exercice ? updatedExo : ex
        )
      );

      // Fermer modal
      setEditModal(false);
      setSelectedExercise(null);

      return updatedExo.id_exercice;
    } catch (err) {
      console.error("Erreur mise à jour:", err.response?.data || err.message);
      alert("Erreur lors de la mise à jour de l'exercice");
      return null;
    }
  };


  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    if (!window.confirm("Tu es sûr de supprimer cet exercice ?")) return;
    fetch(`http://localhost:8000/api/exercices/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(() =>
      setExercises(exercises.filter((ex) => ex.id_exercice !== id))
    );
  };

const [viewModal, setViewModal] = useState(false);
///const [selectedExercise, setSelectedExercise] = useState(null);
const openView = (exercise) => {
  setSelectedExercise(exercise);
  setViewModal(true);
};



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


  const difficultyBgMap = {
    debutant: "bg-grad-2",
    intermediaire: "bg-grad-3",
    avance: "bg-grad-4",
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
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("title")}</h1>
            <p className="text-gray">{t("description")}</p>
          </div>


        </div>

        {/* Search */}
        <div className="relative mb-6 sm:mb-10 w-full max-w-md">
          <ContentSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
         <div
  key={item.id_exercice}
  className={`
    ${difficultyBgMap[item.niveau_exo] || "bg-white"}
    rounded-2xl p-6 shadow-sm hover:shadow-md transition
    flex flex-col
    overflow-hidden
  `}
>


              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-grad-2 rounded-xl">
                  <Code size={24} className="text-muted" />
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${item.niveau_exo === "debutant"
                    ? "bg-muted/20 text-muted"
                    : item.niveau_exo === "intermediaire"
                      ? "bg-pink/20 text-pink"
                      : "bg-purple/20 text-purple"
                    }`}
                >
                  {item.niveau_exercice_label}
                </span>

              </div>

              <h3 className="font-semibold text-lg mb-2 whitespace-normal break-words ">
                {item.titre_exo}
              </h3>
              <p className="text-grayc text-sm mb-4 whitespace-normal break-words">
                {item.utilisateur_name}
              </p>
              <p className="text-grayc text-sm mb-4 whitespace-normal break-words">
                {item.categorie}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                <Button
                                      variant="courseStart"
                                      className={`px-4 py-2 whitespace-nowrap ${buttonStyles[item.niveau_exercice_label]}`}
                                     onClick={() => openView(item)}
                                    >
                                      Voir Exercice
                                    </Button>
                <div className="flex gap-3" >
                 
                  <button className="text-muted hover:opacity-80" onClick={() => openEdit(item)}>
                    <SquarePen size={20} />
                  </button>
                  <button className="text-red hover:opacity-80" onClick={() => handleDelete(item.id_exercice)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Modals */}


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
            value: editValues.titre_exo,               // ✅ correct
            onChange: (e) => setEditValues({ ...editValues, titre_exo: e.target.value }),
          },
          {
            label: t("field.category"),
            element: (
              <select
                value={editValues.categorie}
                onChange={(e) => setEditValues({ ...editValues, categorie: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="code">{t("categorie.code")}</option>
                <option value="question_cours">{t("categorie.question_cours")}</option>
              </select>
            )

          },
          {
            label: t("field.difficulty"),
            element: (
              <select
                value={editValues.niveau_exo}
                onChange={(e) => setEditValues({ ...editValues, niveau_exo: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="debutant">{t("difficulty.easy")}</option>
                <option value="intermediaire">{t("difficulty.medium")}</option>
                <option value="avance">{t("difficulty.hard")}</option>
              </select>
            ),
          },
          {
            label: t("field.visibilite"),
            element: (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editValues.visibilite_exo}   // ✅ checked
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      visibilite_exo: e.target.checked, // ✅ boolean
                    })
                  }
                />
                <span>{t("field.visibiliteLabel")}</span>
              </label>
            ),
          }

        ]}
      />
      <AddModal
  open={viewModal}
  onClose={() => setViewModal(false)}
  title="Voir Exercice"
  submitLabel="Fermer"
  cancelLabel=""
  onSubmit={() => setViewModal(false)}
  fields={[
    { label: "Titre", value: selectedExercise?.titre_exo, readonly: true },
    { label: "Énoncé", value: selectedExercise?.enonce, readonly: true },
    { label: "Auteur", value: selectedExercise?.utilisateur_name, readonly: true },
    { label: "Catégorie", value: selectedExercise?.categorie, readonly: true },
    { label: "Niveau", value: selectedExercise?.niveau_exercice_label, readonly: true },
    { label: "Visibilité", value: selectedExercise?.visibilite_exo_label, readonly: true },
    { label: "Cours",  value: getCourseTitle(selectedExercise?.cours), readonly: true },
    { label: "Maximum de tentatives", value: selectedExercise?.max_soumissions, readonly: true },
    
  ]}
/>


    </div>
  );
}