// 
import React, { useState } from "react";
import { Folder } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Cards2 from "../components/common/Cards2";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import { useTranslation } from "react-i18next";

import "../styles/index.css";

export default function SpacesPage() {
    const { t } = useTranslation("Spaces"); // <-- on utilise l’espace de traduction "Spaces"

    const [open, setOpen] = useState(false);
    const [spaceName, setSpaceName] = useState("");
    const [spaceDesc, setSpaceDesc] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setOpen(false);
    };

    const spaces = [
        {
            id: 1,
            title: t("mobileDesignPatterns.title"),
            description: t("mobileDesignPatterns.description"),
            status: t("mobileDesignPatterns.status"),
            bg: "bg-grad-2",
        },
        {
            id: 2,
            title: t("uxCaseStudies.title"),
            description: t("uxCaseStudies.description"),
            status: t("uxCaseStudies.status"),
            bg: "bg-grad-3",
        },
        {
            id: 3,
            title: t("designSystemLibrary.title"),
            description: t("designSystemLibrary.description"),
            status: t("designSystemLibrary.status"),
            bg: "bg-grad-2",
        },
    ];

    return (
        <div className="flex w-full min-h-screen bg-surface">
            <Navbar />

            <div className="flex-1 p-6 ml-56">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-5xl font-semibold text-primary">{t("spacesTitle")}</h1>
                    <Button
                        variant="primary"
                        className="!px-4 !py-2 !text-white !w-auto !h-auto"
                        onClick={() => setOpen(true)}
                    >
                        {t("createSpaceButton")}
                    </Button>
                </div>

                {/* Grid des spaces */}
                <div className="grid grid-cols-1 gap-10">
                    {spaces.map((item) => (
                        <div key={item.id} className={`${item.bg} rounded-xl shadow p-2`}>
                            <Cards2
                                icon={
                                    <div className="w-12 h-12 flex items-center justify-center bg-grad-1 rounded-md text-white">
                                        <Folder size={25} />
                                    </div>
                                }
                                title={item.title}
                                description={item.description}
                                status={item.status}
                                showArrow={true}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <AddModal
                open={open}
                onClose={() => setOpen(false)}
                title={t("modalTitle")}
                subtitle={t("modalSubtitle")}
                submitLabel={t("modalSubmit")}
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
                                className="w-full bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                rows={4}
                            />
                        ),
                    },
                ]}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
