import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { Plus, Trash, SquarePen } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import ContentSearchBar from "../components/common/ContentSearchBar";
import api from "../services/apiGenerale";
import { toast } from "react-hot-toast";

// Couleurs selon la catégorie
const categoryColors = {
  success: "bg-muted/20 text-muted",
  special: "bg-purple/20 text-purple",
  progress: "bg-pink/20 text-pink",
};
const buttonStyles = {
  success: "bg-muted/20 text-muted",
 special: "bg-purple/20 text-purple",
  progress: "bg-pink/20 text-pink",
};
// Fonction pour générer l'URL de l'image
const getBadgeImageUrl = (iconPath) => {
  if (!iconPath) return null;
  return `http://127.0.0.1:8000/${iconPath.replace(/\\/g, "/")}`;
};

export default function BadgesManagement() {
  const { t } = useTranslation("BadgesManagement");
  const { toggleDarkMode } = useContext(ThemeContext);

  const [badges, setBadges] = useState([]);
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [previewIcon, setPreviewIcon] = useState("");

  const [formValues, setFormValues] = useState({
    title: "",
    desc: "",
    category: "success",
    condition: "",
    xpPoint: 0,
    icon: "",
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await api.get("badges/badge/");
        const mappedBadges = res.data.map((b) => ({
          id: b.id,
          title: b.nom,
          desc: b.description,
          category: b.categorie.toLowerCase(),
          condition: b.condition,
          xpPoint: b.numpoints,
          icon: b.icone,
          locked: false,
        }));
        setBadges(mappedBadges);
      } catch (err) {
        console.error("Erreur récupération badges :", err);
      }
    };
    fetchBadges();
  }, []);

  // Resize & sidebar
  useEffect(() => {
    const resizeHandler = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    const sidebarHandler = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", resizeHandler);
    window.addEventListener("sidebarChanged", sidebarHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("sidebarChanged", sidebarHandler);
    };
  }, []);


  //voir les etudiants qui ont gagner le badge
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
const [students, setStudents] = useState([]);
const handleViewStudents = async (badge) => {
  try {
    const res = await api.get(`badges/badge/${badge.id}/utilisateurs/`);
    setStudents(res.data);
    setSelectedBadge(badge); 
    setStudentsModalOpen(true);
  } catch (err) {
    console.error("Erreur récupération étudiants :", err);
    toast.error("Impossible de récupérer les étudiants");
  }
};

  const getGridCols = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  const filteredBadges = badges.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.desc.toLowerCase().includes(search.toLowerCase())
  );

  // Open modals
  const handleCreate = () => {
    setSelectedBadge(null);
    setFormValues({ title: "", desc: "", category: "success", condition: "", xpPoint: 0, icon: "" });
    setCreateModal(true);
  };

  const handleEdit = (badge) => {
    setSelectedBadge(badge);
    setFormValues({
      title: badge.title,
      desc: badge.desc,
      category: badge.category,
      condition: badge.condition,
      xpPoint: badge.xpPoint,
      icon: badge.icon,
    });
     setPreviewIcon(getBadgeImageUrl(badge.icon));
    setEditModal(true);
  };

  // Submit creation or edition
  const submitBadge = async () => {
    try {
      const formData = new FormData();
      formData.append("nom", formValues.title);
      formData.append("description", formValues.desc);
      formData.append("categorie", formValues.category);
      formData.append("condition", formValues.condition);
      formData.append("numpoints", formValues.xpPoint);
      if (formValues.icon instanceof File) formData.append("icone", formValues.icon);

      if (selectedBadge) {
        // Edit
        const res = await api.put(`badges/badge/${selectedBadge.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBadges((prev) =>
          prev.map((b) =>
            b.id === selectedBadge.id
              ? {
                  ...b,
                  title: res.data.nom,
                  desc: res.data.description,
                  category: res.data.categorie.toLowerCase(),
                  condition: res.data.condition,
                  xpPoint: res.data.numpoints,
                  icon: res.data.icone,
                }
              : b
          )
        );
        setEditModal(false);
        toast.success("Badge mis à jour !");
      } else {
        // Create
        const res = await api.post("badges/create_badge/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBadges((prev) => [
          ...prev,
          {
            id: res.data.id,
            title: res.data.nom,
            desc: res.data.description,
            category: res.data.categorie.toLowerCase(),
            condition: res.data.condition,
            xpPoint: res.data.numpoints,
            icon: res.data.icone,
            locked: false,
          },
        ]);
        setCreateModal(false);
        toast.success("Badge créé !");
      }
    } catch (err) {
      console.error("Erreur badge :", err);
      toast.error("Erreur lors de l'opération");
    }
  };

  // Delete
  const handleDelete = async (badgeId) => {
    if (!window.confirm("Tu es sûr de supprimer ce badge ?")) return;
    try {
      await api.delete(`badges/badge/${badgeId}/delete/`);
      setBadges((prev) => prev.filter((b) => b.id !== badgeId));
      toast.error("Badge supprimé");
    } catch (err) {
      console.error(err);
      toast.error("Erreur suppression badge");
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-surface gap-16 md:gap-1">
      <Navbar />
      <main
        className={`flex-1 p-6 pt-10 space-y-5 transition-all duration-300 ${
          !isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">
              {t("BadgesManagement.BadgesManagement")}
            </h1>
            <p className="text-gray">{t("BadgesManagement.badgesp")}</p>
          </div>
          <Button
            text={<span className="flex items-center gap-2"><Plus size={18}/> Créer Badge</span>}
            variant="primary"
            className="!w-auto px-6 py-2 rounded-xl"
            onClick={handleCreate}
          />
        </div>

        <ContentSearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un badge"
          className="w-full max-w-md mb-6 sm:mb-10"
        />

        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0,1fr))` }}>
          {filteredBadges.map((badge) => (
            <div key={badge.id} className="rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between bg-white">
              <div className="flex justify-between mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                  <img src={getBadgeImageUrl(badge.icon)} alt={badge.title} className="w-full h-full object-cover" />
                </div>
                <span className={`h-6 px-3 py-1 text-xs font-medium rounded-full ${categoryColors[badge.category] || "bg-gray-200 text-gray-600"}`}>
                  {badge.category}
                </span>
              </div>
              <h2 className="font-semibold text-lg">{badge.title}</h2>
              <p className="text-sm text-grayc/85">{badge.desc}</p>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-2">
                <p className="text-sm text-gray">{badge.xpPoint}</p>
                <div className="flex gap-3 text-gray">
                  <Button variant="courseStart" className={`px-4 py-2 whitespace-nowrap ${buttonStyles[badge.category]}`} onClick={() => handleViewStudents(badge)}> Voir étudiants</Button>
                  <button className="text-muted hover:opacity-80" onClick={() => handleEdit(badge)}><SquarePen size={20} /></button>
                  <button className="text-red hover:opacity-80" onClick={() => handleDelete(badge.id)}><Trash size={20} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AddModal
        open={createModal || editModal}
        onClose={() => { setCreateModal(false); setEditModal(false); }}
        title={selectedBadge ? "Modifier le badge" : "Créer un badge"}
        submitLabel={selectedBadge ? "Enregistrer" : "Créer"}
        cancelLabel="Annuler"
        onSubmit={submitBadge}
        fields={[
          {
            label: "Titre",
            element: (
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={formValues.title}
                onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
              />
            ),
          },
          {
            label: "Description",
            element: (
              <textarea
                className="border p-2 rounded w-full"
                value={formValues.desc}
                onChange={(e) => setFormValues({ ...formValues, desc: e.target.value })}
              />
            ),
          },
          {
            label: "Catégorie",
            element: (
              <select
                value={formValues.category}
                onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                className="border p-2 rounded w-full"
              >
                <option value="success">success</option>
                <option value="special">special</option>
                <option value="progress">progress</option>
              </select>
            ),
          },
          {
            label: "Condition",
            element: (
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={formValues.condition}
                onChange={(e) => setFormValues({ ...formValues, condition: e.target.value })}
              />
            ),
          },
          {
            label: "Points XP",
            element: (
              <input
                type="number"
                className="border p-2 rounded w-full"
                value={formValues.xpPoint}
                onChange={(e) => setFormValues({ ...formValues, xpPoint: Number(e.target.value) })}
              />
            ),
          },
      
          {
  label: "Icône",
  element: (
    <div className="flex flex-col gap-2">
      {previewIcon && (
        <img
          src={previewIcon}
          alt="Aperçu icône"
          className="w-24 h-24 object-cover rounded-lg border"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          setFormValues({ ...formValues, icon: file });
          if (file) setPreviewIcon(URL.createObjectURL(file));
        }}
      />
    </div>
  ),
}

        ]}
      />

      <AddModal
  open={studentsModalOpen}
  onClose={() => setStudentsModalOpen(false)}
  title={`Étudiants ayant gagné "${selectedBadge?.title}"`}
  submitLabel="Fermer"
  cancelLabel=""
  onSubmit={() => setStudentsModalOpen(false)}
  fields={[
    {
      label: "",
      element: (
        <div className="flex flex-col gap-2 max-h-96 overflow-auto">
          {students.length === 0 ? (
            <p>Aucun étudiant n'a gagné ce badge.</p>
          ) : (
            students.map((s, index) => (
              <div
                key={index}
                className="border-b py-2 flex justify-between"
              >
                <span>{s.nom} {s.prenom}</span>
                <span>{s.specialite} - {s.annee_etude}e année</span>
              </div>
            ))
          )}
        </div>
      ),
    },
  ]}
/>

    </div>
  );
}
