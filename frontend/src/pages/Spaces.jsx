import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiTrash2 } from "react-icons/fi";
import ThemeContext from "../context/ThemeContext";
import Navbar from "../components/common/NavBar";
import Cards2 from "../components/common/Cards2";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import UserCircle from "../components/common/UserCircle";
import { Folder, Bell } from "lucide-react";

import { getSpaces, createSpace, deleteSpace } from "../services/spacesService";
import { getMySpaces } from "../services/studentSpacesService";

import toast from "react-hot-toast";

export default function SpacesPage() {
  const { t, i18n } = useTranslation("Spaces");
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  // États pour la responsivité
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  const initialRole = parsedUser?.role === "enseignant" ? "prof" : "student";

  const [role, setRole] = useState(initialRole);
  const [spaces, setSpaces] = useState([]);
  const [open, setOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaceDesc, setSpaceDesc] = useState("");

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

  // -------------------------
  // Fetch des espaces selon rôle
  // -------------------------
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        if (role === "prof") {
          const data = await getSpaces();
          setSpaces(Array.isArray(data) ? data : data.results || []);
        } else {
          const data = await getMySpaces();
          setSpaces(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erreur fetchSpaces:", err);
      }
    };
    console.log("ROLE DETECTED:", role);
    fetchSpaces();
  }, [role]);

  // -------------------------
  // Création d'un espace (prof uniquement)
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!spaceName) {
      toast.error(t("spaceNameRequired"));
      return;
    }

    // Vérification doublon
    const exists = spaces.some(
      (s) => s.nom_space.toLowerCase() === spaceName.trim().toLowerCase()
    );
    if (exists) {
      toast.error(t("spaceNameExists"));
      return;
    }

    try {
      const data = { nom_space: spaceName, description: spaceDesc };
      const res = await createSpace(data);

      if (res) {
        const newSpace = {
          id_space: res.id_space,
          nom_space: res.nom_space,
          description: res.description,
          date_creation: res.date_creation,
        };
        setSpaces((prev) => [...prev, newSpace]);
        toast.success(t("spaceCreated"));
      }

      setOpen(false);
      setSpaceName("");
      setSpaceDesc("");
    } catch (err) {
      console.error("Erreur createSpace:", err);
      toast.error(t("spaceCreationFailed"));
    }
  };

  const handleDeleteSpace = async (id_space) => {
    const confirmDelete = window.confirm(t("confirmDeleteSpace"));
    if (!confirmDelete) return;

    try {
      await deleteSpace(id_space);
      setSpaces((prev) => prev.filter((s) => s.id_space !== id_space));
      toast.success(t("spaceDeleted"));
    } catch (err) {
      console.error("Erreur deleteSpace:", err);
      toast.error(t("spaceDeleteFailed"));
    }
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
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">
              {role === "prof" ? t("spacesTitle") : t("mySpacesTitle")}
            </h1>
            <p className="text-gray">
              {role === "prof" ? t("manageSpaces") : t("viewSpaces")}
            </p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
            <UserCircle
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => i18n.changeLanguage(lang)}
            />
          </div>
        </div>

        {/* Bouton Ajouter un espace (prof seulement) */}
        {role === "prof" && (
          <div className="flex justify-end mb-6">
            <Button
              variant="primary"
              className="!w-auto px-6 py-2 rounded-xl"
              onClick={() => setOpen(true)}
            >
              {t("createSpaceButton")}
            </Button>
          </div>
        )}

        {/* Liste des espaces */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
          {spaces.length > 0 ? (
            spaces.map((item) => (
              <div
                key={item.id_space}
                className="bg-grad-3 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <Cards2
                  icon={
                    <div className="w-12 h-12 flex items-center justify-center bg-grad-1 rounded-lg text-white">
                      <Folder size={25} />
                    </div>
                  }
                  title={item.nom_space || "No title"}
                  description={item.description || ""}
                  status={
                    role === "prof"
                      ? `${t("created")} ${new Date(
                        item.date_creation
                      ).toLocaleDateString()}`
                      : ""
                  }
                  showArrow={true}
                  onArrowClick={() =>
                    navigate(`/CourseDetails/${item.id_space}`)
                  }
                  extraActions={
                    role === "prof" && (
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => handleDeleteSpace(item.id_space)}
                          className="text-gray-500 hover:text-red-500 transition"
                          title={t("deleteSpace")}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    )
                  }
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 text-lg">
                {role === "prof" ? t("noSpacesMessage") : t("noStudentSpaces")}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal d'ajout espace (prof uniquement) */}
      {role === "prof" && (
        <AddModal
          open={open}
          onClose={() => setOpen(false)}
          title={t("modalTitle")}
          subtitle={t("modalSubtitle")}
          submitLabel={t("modalSubmit")}
          cancelLabel={t("modalCancel")}
          fields={[
            {
              label: t("fieldSpaceName"),
              placeholder: t("fieldSpaceNamePlaceholder"),
              value: spaceName,
              onChange: (e) => setSpaceName(e.target.value),
            },
            {
              label: t("fieldDescription"),
              element: (
                <textarea
                  placeholder={t("fieldDescriptionPlaceholder")}
                  value={spaceDesc}
                  onChange={(e) => setSpaceDesc(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={4}
                />
              ),
            },
          ]}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}