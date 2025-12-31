import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import { Folder, Edit, Trash2, Plus } from "lucide-react";
import Button from "../components/common/Button";
import AddModel from "../components/common/AddModel";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import ContentSearchBar from "../components/common/ContentSearchBar";
import { getSpaces, createSpace, deleteSpace } from "../services/spacesService";

import toast from "react-hot-toast";

export default function SpacesPage() {
  const { t } = useTranslation("space");
  const { toggleDarkMode } = useContext(ThemeContext);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newSpace, setNewSpace] = useState({ nom_space: "", description: "", utilisateur: "" });
  const [spaces, setSpaces] = useState([]);
  const [teachers, setTeachers] = useState([]);


  // ================= FETCH BACKEND =================
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const token = localStorage.getItem("admin_token");

        const res = await fetch("http://localhost:8000/api/spaces/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("Raw spaces data:", data);

        // Mapping pour frontend
        const formatted = data.map((s) => ({
          id: s.id_space,
          title: s.nom_space,
          description: s.description || "—",
          utilisateur:s.utilisateur
        }));

        setSpaces(formatted);
      } catch (err) {
        console.error("Erreur chargement espaces :", err);
      }
    };

    fetchSpaces();
  }, []);


  //==================== ENSEIGNANT================
useEffect(() => {
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("http://localhost:8000/api/users/enseignants/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(t("errors.fetchTeachers"));
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchTeachers();
}, []);

  //console.log({teachers});
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


  

  const filteredSpaces = spaces.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

 const handleDeleteSpace = async (id_space) => {
  const confirmDelete = window.confirm(t("confirmDeleteSpace"));
  if (!confirmDelete) return;

  try {
    await deleteSpace(id_space);

    // 🔥 suppression immédiate du state
    setSpaces((prev) => prev.filter((s) => s.id !== id_space));

    toast.success(t("spaceDeleted"));
  } catch (err) {
    console.error("Erreur deleteSpace:", err);
    toast.error(t("spaceDeleteFailed"));
  }
};

  const fields = [
  {
  label: t("editModalTitle"),
  placeholder: "Ex: Algorithm Masters",
  value: newSpace.title,
  onChange: (e) => setNewSpace({ ...newSpace, title: e.target.value }),
},
  {
    label: t("editModalSubtitle"),
    placeholder: t("subtitlePlaceholder"),
    value: newSpace.description,
    onChange: (e) =>
      setNewSpace({ ...newSpace, description: e.target.value }),
  },
  {
    label: t("spaceOwner"),
    element: (
      <select
        value={newSpace.utilisateur}
        onChange={(e) =>
          setNewSpace({ ...newSpace, utilisateur: e.target.value })
        }
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">-- Sélectionner un enseignant --</option>
        {teachers.map((teacher) => (
          <option key={teacher.id_utilisateur} value={teacher.id_utilisateur}>
            {teacher.prenom} {teacher.nom}
          </option>
        ))}
      </select>
    ),
  },
];


const addSpace = async (spaceData, setSpaces, t, setOpenModal, setNewSpace) => {
  try {
    // Mapping frontend → backend
    const payload = {
      nom_space: spaceData.title,
      description: spaceData.description,
      utilisateur: spaceData.utilisateur,
    };

    const res = await fetch("http://localhost:8000/api/spaces/admin/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Erreur création space");

    const data = await res.json();

    // Mise à jour immédiate du state
    setSpaces((prev) => [
      ...prev,
      {
        id: data.id_space,
        title: data.nom_space,
        description: data.description,
        utilisateur: data.utilisateur,
      },
    ]);

    toast.success(t("spaceCreated"));

    // Reset formulaire
    setOpenModal(false);
    setNewSpace({ title: "", description: "", utilisateur: "" });
  } catch (err) {
    console.error(err);
    toast.error(t("operationFailed"));
  }
};


const updateSpace = async (spaceId, spaceData, setSpaces, t, setOpenModal, setNewSpace) => {
  try {
    const payload = {
      nom_space: spaceData.title,
      description: spaceData.description,
      utilisateur: spaceData.utilisateur,
    };

    const res = await fetch(`http://localhost:8000/api/spaces/admin/${spaceId}/update/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Erreur modification space");

    const data = await res.json();

    // Mise à jour immédiate du state
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId
          ? {
              id: data.id_space,
              title: data.nom_space,
              description: data.description,
              utilisateur: data.utilisateur,
            }
          : s
      )
    );

    toast.success(t("spaceUpdated"));

    // Reset formulaire
    setOpenModal(false);
    setNewSpace({ title: "", description: "", utilisateur: "" });
  } catch (err) {
    console.error(err);
    toast.error(t("operationFailed"));
  }
};


const handleSubmit = (e) => {
  //e.preventDefault();

  if (editIndex) {
    updateSpace(editIndex, newSpace, setSpaces, t, setOpenModal, setNewSpace);
  } else {
    addSpace(newSpace, setSpaces, t, setOpenModal, setNewSpace);
  }
};


 
  const handleEdit = (index) => {
  const space = spaces[index];

  setNewSpace({
    title: space.title,
    description: space.description,
    utilisateur: space.utilisateur,
  });

  setEditIndex(space.id); // ID BACKEND
  setOpenModal(true);
};


  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      <Navbar />
      <main className={`flex-1 p-6 pt-10 space-y-5 transition-all duration-300 ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}`}>
        {/* Header */}
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

        {/* Search */}
        <div className="max-w-md mb-6">
          <ContentSearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space, index) => (
            <div key={space.id} className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between h-full">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-muted/20 flex items-center justify-center flex-shrink-0">
                  <Folder className="w-6 h-6 text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-muted truncate">{space.title}</h2>
                  <p className="text-grayc text-sm mt-1 line-clamp-2">{space.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button className="text-muted hover:text-primary" onClick={() => handleEdit(index)} title={t("edit")}><Edit size={18} /></button>
                <button className="text-red hover:text-red" onClick={() => handleDeleteSpace(space.id)} title={t("delete")}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>

        {filteredSpaces.length === 0 && <p className="text-center py-10 text-gray-500">{t("noSpacesFound")}</p>}
      </main>

      <AddModel
        open={openModal}
        onClose={() => setOpenModal(false)}
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel={editIndex !== null ? t("update") : t("create")}
        cancelLabel={t("cancel")}
      />
    </div>
  );
}
