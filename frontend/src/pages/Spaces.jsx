// Importation des composants et hooks nécessaires
// LORSQU'IL CLIQUE SUR LE CHEVRON ON LE REDIRIGE VERS LA PAGE COURSEDETAILS

import React, { useState } from "react";
import { Folder } from "lucide-react";          // Icône affichée dans la carte
import Navbar from "../components/common/NavBar";
import Cards2 from "../components/common/Cards2";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { useTranslation } from "react-i18next"; // Permet la traduction du texte via i18n
import { useNavigate } from "react-router-dom";

import "../styles/index.css";                  // Styles globaux

// ======== Composant principal de la page "Spaces" ========
export default function SpacesPage() {

    // Récupération des textes traduits depuis le fichier "Spaces.json"
    const { t } = useTranslation("Spaces");

    // États pour gérer l’ouverture du modal + valeurs écrites dans les champs
    const [open, setOpen] = useState(false);
    const [spaceName, setSpaceName] = useState("");
    const [spaceDesc, setSpaceDesc] = useState("");

    // Fonction appelée lors de la validation du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();  // Empêche le rechargement de la page
        setOpen(false);      // Ferme la fenêtre
    };

    // ======== Liste des spaces affichés sur la page ========
    // Chaque espace récupère son titre, description & status via i18n
    const spaces = [
        {
            id: 1,
            title: "Mobile Design Patterns",
            description: "Learn mobile design fundamentals",
             date: "12/01/2025",
            bg: "bg-grad-2",
        },
        {
            id: 2,
            title: "UX Case Studies",
            description: "Deep dive into UX successes",
            date: "12/05/2025",
            bg: "bg-grad-3",
        },
        {
            id: 3,
            title: t("designSystemLibrary.title"),
            description: t("designSystemLibrary.description"),
            status: t("designSystemLibrary.status"),
            bg: "bg-grad-4",
        },
    ];

    const navigate = useNavigate();


    return (
        <div className="flex w-full min-h-screen bg-surface">

            {/* ------- Sidebar Navigation ------- */}
            <Navbar />

            {/* ------- Contenu principal - Responsive ------- */}
            <div className="flex-1 p-4 sm:p-6 ml-0 lg:ml-56 transition-all duration-300">

                {/* ------- Titre & Bouton d'ajout ------- */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-muted">
                        {t("spacesTitle")}
                    </h1>

                    {/* Bouton ouvrant le modal */}
                    <Button
                        variant="primary"
                        className="!px-4 !py-2 !text-white !w-auto sm:!w-auto"
                        onClick={() => setOpen(true)}
                    >
                        {t("createSpaceButton")}
                    </Button>
                </div>

                {/* ------- Grille responsive d'affichage des Spaces ------- */}
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                    {spaces.map((item) => (
                        <div key={item.id} className={`${item.bg} rounded-xl shadow p-2`}>
                            <Cards2
                                icon={
                                    <div className="w-12 h-12 flex items-center justify-center bg-grad-1 rounded-md text-white">
                                        <Folder size={25} /> {/* Icône du dossier */}
                                    </div>
                                }
                                title={item.title}
                                description={item.description}
                                status={`${t("created")} ${item.date}`}
                                showArrow={true}  // Affiche une flèche (souvent pour "voir plus")
                                  // ⬇️ AJOUT ICI : redirection quand on clique sur la flèche
    onArrowClick={() => navigate("/CourseDetails")}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ------- Modal d'ajout d'un nouveau Space ------- */}
            <AddModal
                open={open}                    // État d’ouverture
                onClose={() => setOpen(false)} // Bouton fermer
                title={t("modalTitle")}
                subtitle={t("modalSubtitle")}
                submitLabel={t("modalSubmit")}
                cancelLabel={t("modalCancel")}

                // Champs affichés dans le modal
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

                onSubmit={handleSubmit} // Action finale du formulaire
            />
        </div>
    );
}
