import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ThemeContext from "../context/ThemeContext";
import Navbar from "../components/common/NavBar";
import Cards2 from "../components/common/Cards2";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import UserCircle from "../components/common/UserCircle";
import { Folder, Bell } from "lucide-react";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";
import { getSpaces, createSpace } from "../services/spacesService";

export default function SpacesPage() {
  const { t } = useTranslation("Spaces");
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaceDesc, setSpaceDesc] = useState("");
  const [spaces, setSpaces] = useState([]);


  
  useEffect(() => {
  getSpaces()
    .then((data) => {
      console.log("GET /spaces response:", data);

      // Si DRF paginé
      const spacesArray = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];

      // On mappe pour avoir le même format partout
      const formatted = spacesArray.map((s) => ({
        id_space: s.id_space,
        nom_space: s.nom_space,
        description: s.description,
        date_creation: s.date_creation,
      }));

      setSpaces(formatted);
    })
    .catch((err) => console.error("Erreur getSpaces:", err));
}, []);



  // --- Création d'un espace ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!spaceName) return;

    const data = { nom_space: spaceName, description: spaceDesc };

    createSpace(data)
      .then((res) => {
        if (res.data) {
          const newSpace = {
            id_space: res.data.id_space,
            nom_space: res.data.nom_space,
            description: res.data.description,
            date_creation: res.data.date_creation,
          };
          setSpaces((prev) => [...prev, newSpace]);
        }
        setOpen(false);
        setSpaceName("");
        setSpaceDesc("");
      })
      .catch((err) => console.error("Erreur createSpace:", err));
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface pr-5 pt-3">
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-muted ml-[250px]">
          {t("spacesTitle")}
        </h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <UserCircle initials="MH" onToggleTheme={toggleDarkMode} />
        </div>
      </div>

      <div className="flex w-full min-h-screen bg-surface">
        {/* Sidebar */}
        <Navbar />

        {/* Contenu principal */}
        <div className="flex-1 p-4 sm:p-6 ml-0 lg:ml-56 transition-all duration-300">
          {/* Bouton Ajouter un espace */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <Button
              variant="primary"
              className="!px-4 !py-2 !text-white !w-auto ml-auto whitespace-nowrap"
              onClick={() => setOpen(true)}
            >
              {t("createSpaceButton")}
            </Button>
          </div>

          {/* Liste des espaces */}
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {Array.isArray(spaces) && spaces.length > 0 ? (
              spaces.map((item) => (
                <div key={item.id_space} className="rounded-xl shadow p-2 bg-grad-3">
                  <Cards2
                    icon={
                      <div className="w-12 h-12 flex items-center justify-center bg-grad-1 rounded-md text-white">
                        <Folder size={25} />
                      </div>
                    }
                    title={item.nom_space || "No title"}
                    description={item.description || ""}
                    status={`${t("created")} ${new Date(item.date_creation).toLocaleDateString()}`}
                    showArrow={true}
                    onArrowClick={() => navigate(`/CourseDetails/${item.id_space}`)}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500">{t("noSpacesMessage")}</p>
            )}
          </div>
        </div>

        {/* Modal d'ajout */}
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
      </div>
    </div>
  );
}
