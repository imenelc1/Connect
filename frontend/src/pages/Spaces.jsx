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
  const { t } = useTranslation("Spaces");
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.user?.role ?? userData?.role;
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const initials = `${userData?.nom?.[0] || ""}${
    userData?.prenom?.[0] || ""
  }`.toUpperCase();

  const initialRole = parsedUser?.role === "enseignant" ? "prof" : "student";

  const [role, setRole] = useState(initialRole);
  const [spaces, setSpaces] = useState([]);
  const [open, setOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaceDesc, setSpaceDesc] = useState("");

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
      toast.error(t("spaceNameExists")); // message si nom déjà pris
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
      await deleteSpace(id_space); // appel API pour supprimer
      setSpaces((prev) => prev.filter((s) => s.id_space !== id_space)); // mise à jour frontend
      toast.success(t("spaceDeleted"));
    } catch (err) {
      console.error("Erreur deleteSpace:", err);
      toast.error(t("spaceDeleteFailed"));
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface pr-5 pt-3">
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-muted ml-[250px]">
          {role === "prof" ? t("spacesTitle") : t("mySpacesTitle")}
        </h1>
        <div className="flex items-center gap-4">
          <Bell
            className="w-5 h-5 text-gray-600 cursor-pointer"
            fill="currentColor"
          />
          <UserCircle
            initials={initials}
            onToggleTheme={toggleDarkMode}
            onChangeLang={(lang) => i18n.changeLanguage(lang)}
          />
        </div>
      </div>

      <div className="flex w-full min-h-screen bg-surface">
        {/* Sidebar */}
        <Navbar />

        {/* Contenu principal */}
        <div className="flex-1 p-4 sm:p-6 ml-0 lg:ml-56 transition-all duration-300">
          {/* Bouton Ajouter un espace (prof seulement) */}
          {role === "prof" && (
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <Button
                variant="primary"
                className="!px-4 !py-2 !text-white !w-auto ml-auto whitespace-nowrap"
                onClick={() => setOpen(true)}
              >
                {t("createSpaceButton")}
              </Button>
            </div>
          )}

          {/* Liste des espaces */}
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {spaces.length > 0 ? (
              spaces.map((item) => (
                <div
                  key={item.id_space}
                  className="rounded-xl shadow p-2 bg-grad-3"
                >
                  <Cards2
                    icon={
                      <div className="w-12 h-12 flex items-center justify-center bg-grad-1 rounded-md text-white">
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
                      role === "prof" && (   // <-- condition ajoutée
                        <div className="">
                          <FiTrash2
                            size={18}
                            className="cursor-pointer text-grayc hover:text-red-500 mt-20 ml-5"
                            onClick={() => handleDeleteSpace(item.id_space)}
                            title={t("deleteSpace")}
                          />
                        </div>
                      )
                    }
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                {role === "prof" ? t("noSpacesMessage") : t("noStudentSpaces")}
              </p>
            )}
          </div>
        </div>

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
                    className="w-full bg-grad-3 dark:bg-gray-700 rounded-md px-3 py-2
                             focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={4}
                  />
                ),
              },
            ]}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
