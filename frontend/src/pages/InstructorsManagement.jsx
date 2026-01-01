import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import AddModel from "../components/common/AddModel";
import { Users, Trash2, Edit, Calendar, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContentSearchBar from "../components/common/ContentSearchBar";
import ThemeContext from "../context/ThemeContext";
import { toast } from "react-hot-toast";

// ================= DETAILS MODAL =================
function DetailsModal({ open, onClose, instructor }) {
   const { t } = useTranslation("instructors");
  if (!open || !instructor) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-card rounded-xl shadow-lg p-6 w-[400px]">
        <h2 className="text-xl text-muted font-bold mb-4">
          Résumé de l'enseignant
        </h2>

        <ul className="text-sm text-gray space-y-2">
          <li><strong>{t("firstName")} :</strong> {instructor.firstName}</li>
          <li><strong>{t("lastName")} :</strong> {instructor.lastName}</li>
          <li><strong>{t("email")} :</strong> {instructor.email}</li>
          <li><strong>{t("birthdate")} :</strong> {instructor.birthdate}</li>
          <li><strong>{t("rank")} :</strong> {instructor.rank}</li>
          <li><strong>{t("matricule")} :</strong> {instructor.matricule}</li>
        </ul>

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
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
  });

  const [instructors, setInstructors] = useState([]);

  // ================= FETCH BACKEND =================
 useEffect(() => {
  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await fetch("http://localhost:8000/api/users/enseignants/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();  // <-- ici tu transformes la réponse en JSON
      console.log("Raw instructors data:", data); // <-- place ton console.log ici

      const formatted = data.map((e) => ({
        id_utilisateur: e.id_utilisateur, // 🔹 ajoute l'ID pour la suppression
        firstName: e.prenom,
        lastName: e.nom,
        email: e.email || "—",
        birthdate: e.date_naissance || "—",
        rank: e.grade || "—",
        matricule: e.matricule || "—",
      }));

      setInstructors(formatted);
    } catch (err) {
      console.error("Erreur chargement enseignants :", err);
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

  // ================= LOGIC =================
  const filtered = instructors.filter((i) =>
    `${i.firstName} ${i.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const fields = [
    {
      label: t("firstName"),
      value: newInstructor.firstName,
      onChange: (e) =>
        setNewInstructor({ ...newInstructor, firstName: e.target.value }),
    },
    {
      label: t("lastName"),
      value: newInstructor.lastName,
      onChange: (e) =>
        setNewInstructor({ ...newInstructor, lastName: e.target.value }),
    },
    {
      label: t("email"),
      value: newInstructor.email,
      onChange: (e) =>
        setNewInstructor({ ...newInstructor, email: e.target.value }),
    },
    {
      label: t("birthdate"),
      type: "date",
      value: newInstructor.birthdate,
      onChange: (e) =>
        setNewInstructor({ ...newInstructor, birthdate: e.target.value }),
    },
    {
      label: t("rank"),
      value: newInstructor.rank,
      onChange: (e) =>
        setNewInstructor({ ...newInstructor, rank: e.target.value }),
    },
    {
      label: t("matricule"),
      value: newInstructor.matricule,
      onChange: (e) =>
        setNewInstructor({ ...newInstructor, matricule: e.target.value }),
    },
  ];

const handleSubmit = async (e) => {
  // e.preventDefault(); // si tu l'utilises dans un form

  const token = localStorage.getItem("admin_token");
  if (!token) {
    toast.error("Token JWT manquant");
    return;
  }

  // ================= UPDATE =================
  if (editIndex !== null) {
    const instructorToUpdate = instructors[editIndex];
    await handleUpdateInstructor(instructorToUpdate.id_utilisateur, newInstructor);
    return;
  }

  // ================= CREATE =================
  try {
    const res = await fetch(
      "http://localhost:8000/api/users/admin/enseignants/create/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: newInstructor.lastName,
          prenom: newInstructor.firstName,
          email: newInstructor.email,
          matricule: newInstructor.matricule,
          grade: newInstructor.rank,
          date_naissance: newInstructor.birthdate,
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur lors de la création");
    }

    const responseData = await res.json();

    // Ajouter l’enseignant dans le state local
    setInstructors((prev) => [
      ...prev,
      {
        id_utilisateur: responseData.id_utilisateur,
        firstName: newInstructor.firstName,
        lastName: newInstructor.lastName,
        email: newInstructor.email,
        birthdate: newInstructor.birthdate || "—",
        rank: newInstructor.rank,
        matricule: newInstructor.matricule,
      },
    ]);

    toast.success("Enseignant créé avec succès 📧 Un email a été envoyé");

    setOpenModal(false);
    setEditIndex(null);

    // 🔹 RESET FORMULAIRE APRES CREATION
    setNewInstructor({
      firstName: "",
      lastName: "",
      email: "",
      birthdate: "",
      rank: "",
      matricule: "",
    });

  } catch (err) {
    console.error("Erreur création enseignant:", err);
    toast.error(err.message);
  }
};

  const handleEdit = (index) => {
    setNewInstructor(instructors[index]);
    setEditIndex(index);
    setOpenModal(true);
  };

  //SUPPRIMER UN ENSEIGNANT (FUNCTION ADDED BY CHAHLA) 
const handleDelete = async (instructorId) => {
  const token = localStorage.getItem("admin_token");
   if (!token) {
    setError("Token JWT manquant.");
    return;
  }
  console.log({instructorId});
  if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet enseignant?")) return;

  try {
    

    const res = await fetch(`http://localhost:8000/api/users/admin/users/${instructorId}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur lors de la suppression");
    }
    setInstructors((prev) => prev.filter((s) => s.id_utilisateur !== instructorId));

    toast.success("Enseignant supprimé avec succès !");

  } catch (err) {
    console.error("Erreur suppression:", err);
    alert(t("deleteError"));
  }
};


//Modifer les information d'un enseignant (FUNCTION ADDED BY CHAHLA)
const handleUpdateInstructor = async (instructorId, updatedData) => {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    toast.error("Token JWT manquant");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:8000/api/users/enseignants/${instructorId}/update/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: updatedData.lastName,
          prenom: updatedData.firstName,
          email: updatedData.email,
          date_naissance: updatedData.birthdate,
          matricule: updatedData.matricule,
          grade: updatedData.rank,
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur lors de la mise à jour");
    }

    const updatedInstructor = await res.json();

    // Mettre à jour le state local
    setInstructors((prev) =>
      prev.map((inst) =>
        inst.id_utilisateur === instructorId
          ? {
              ...inst,
              firstName: updatedData.firstName,
              lastName: updatedData.lastName,
              email: updatedData.email,
              birthdate: updatedData.birthdate,
              rank: updatedData.rank,
              matricule: updatedData.matricule,
            }
          : inst
      )
    );

    toast.success("Enseignant mis à jour avec succès !");
    setOpenModal(false);
    setEditIndex(null);

    // 🔹 RESET FORMULAIRE APRES MODIFICATION
    setNewInstructor({
      firstName: "",
      lastName: "",
      email: "",
      birthdate: "",
      rank: "",
      matricule: "",
    });

  } catch (err) {
    console.error("Erreur mise à jour:", err);
    toast.error(err.message);
  }
};

  const handleRowClick = (instructor) => {
    setSelectedInstructor(instructor);
    setOpenDetails(true);
  };

  // ================= RENDER =================
  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
      <Navbar />

      <main
        className={`
        flex-1 p-6 pt-10 space-y-5 transition-all duration-300
        ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
      `}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Users size={28} className="text-muted" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-muted">
                {t("title")}
              </h1>
              <p className="text-gray">{t("subtitle")}</p>
            </div>
          </div>

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
              setOpenModal(true);
            }}
          />
        </div>

        {/* SEARCH */}
        <div className="max-w-md">
          <ContentSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
          />
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
                <tr
                  key={index}
                  onClick={() => handleRowClick(i)}
                  className="border-t hover:bg-card cursor-pointer"
                >
                  <td className="px-6 py-4">{i.firstName}</td>
                  <td className="px-6 py-4">{i.lastName}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">{i.email}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <Calendar size={14} className="inline mr-2" />
                    {i.birthdate}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">{i.rank}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">{i.matricule}</td>
                  <td className="px-6 py-4">
                    <Edit
                      size={18}
                      className="inline mr-3 text-blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(index);
                      }}
                    />
                    <Trash2
                      size={18}
                      className="inline text-red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(i.id_utilisateur);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <AddModel
        open={openModal}
       onClose={() => {
    setOpenModal(false);       // fermer le modal
    setEditIndex(null);        // réinitialiser l’édition
    setNewInstructor({         // vider le formulaire
      firstName: "",
      lastName: "",
      email: "",
      birthdate: "",
      rank: "",
      matricule: "",
    });
  }}
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel={editIndex !== null ? t("update") : t("create")}
        cancelLabel={t("cancel")}
      />

      <DetailsModal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        instructor={selectedInstructor}
      />
    </div>
  );
}
