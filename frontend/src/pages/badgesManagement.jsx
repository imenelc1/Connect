import React, { useState, useEffect } from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import { Search, Trash, SquarePen, Award, Plus } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";

export default function BadgesManagement() {
    const { t } = useTranslation("BadgesManagement");

    const getTypeColor = (type) => {
        switch (type) {
            case t("BadgesManagement.Rare"): return "bg-surface text-primary";
            case t("BadgesManagement.Epic"): return "bg-purple/20 text-purple";
            case t("BadgesManagement.common"): 
            default: return "bg-gray-100 text-gray";
        }
    };

    const badges = [
        { title: t("BadgesManagement.FirstSteps"), description: t("BadgesManagement.Completefist"), earnedBy: 856, type: t("BadgesManagement.common"), color: "bg-primary text-primary" },
        { title: t("BadgesManagement.codemaster"), description: `${t("BadgesManagement.complete")} 50 ${t("BadgesManagement.exercises")}`, earnedBy: 234, type: t("BadgesManagement.Rare"), color: "bg-purple text-purple" },
        { title: t("BadgesManagement.Algorithmexpert"), description: t("BadgesManagement.Masteralgo"), earnedBy: 98, type: t("BadgesManagement.Epic"), color: "bg-pink text-pink" },
        { title: t("BadgesManagement.QuickLeaner"), description: t("BadgesManagement.completecourse"), earnedBy: 345, type: t("BadgesManagement.common"), color: "bg-primary bg-primary" },
        { title: t("BadgesManagement.healpingHAND"), description: `${t("BadgesManagement.Help")} 20 ${t("BadgesManagement.studentsforum")}`, earnedBy: 156, type: t("BadgesManagement.Rare"), color: "bg-purple bg-purple" },
        { title: t("BadgesManagement.PerfectScore"), description: `${t("BadgesManagement.get")}100%  ${t("BadgesManagement.on")}10${t("BadgesManagement.quizzes")}`, earnedBy: 187, type: t("BadgesManagement.Epic"), color: "bg-pink text-pink" },
    ];

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const resizeHandler = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", resizeHandler);
        return () => window.removeEventListener("resize", resizeHandler);
    }, []);

    const sidebarWidth = sidebarCollapsed || windowWidth < 768 ? 60 : 256;

    const getGridCols = () => {
        if (windowWidth < 640) return 1; // mobile
        if (windowWidth < 1024) return 2; // tablette
        return 3; // desktop
    };

    return (
        <div className="flex bg-surface min-h-screen">
            {/* Navbar collapsée sur petit écran */}
            <div className="transition-all duration-300 flex-shrink-0" style={{ width: sidebarWidth }}>
                <Navbar collapsed={sidebarCollapsed || windowWidth < 768} />
            </div>

            {/* Main content */}
            <main className="flex-1 p-4 sm:p-6 md:p-10 transition-all duration-300">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">{t("BadgesManagement.BadgesManagement")}</h1>
                        <p className="text-gray">{t("BadgesManagement.badgesp")}</p>
                    </div>

                 
                    <Button
                                            variant="heroPrimary"
                                            className="!w-auto bg-primary rounded-full px-6 py-3 flex items-center gap-2"
                                        >
                                            <Plus size={18} />
                                           {t("BadgesManagement.buttonCreate")}
                                        </Button>
                </div>

                {/* Search bar */}
                <div className="relative mb-6 sm:mb-10 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray w-5 h-5" />
                    <input
                        className="w-full pl-12 pr-4 py-3 rounded-full border border-gray shadow-sm focus:outline-none"
                        placeholder={t("BadgesManagement.search")}
                    />
                </div>

                {/* Badges Grid */}
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}>
                    {badges.map((b, index) => (
                        <div key={index} className="bg-white border border-gray rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            {/* Badge Icon */}
                            <div className="flex justify-between mb-4">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${b.color}`}>
                                    <Award className="w-7 h-7 text-white" />
                                </div>
                                <div className="mt-3">
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getTypeColor(b.type)}`}>
                                        {b.type}
                                    </span>
                                </div>
                            </div>

                            {/* Title & Description */}
                            <h2 className="font-semibold text-lg">{b.title}</h2>
                            <p className="text-sm text-gray-500">{b.description}</p>

                            {/* Footer */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-2 sm:gap-0">
                                <p className="text-sm text-gray">
                                    {t("BadgesManagement.earned")} <span className="font-medium">{b.earnedBy}</span> {t("BadgesManagement.students")}
                                </p>
                                <div className="flex gap-3 text-gray">
                                    <button className="text-primary hover:opacity-80">
                                        <SquarePen size={20} />
                                    </button>
                                    <button className="text-red hover:opacity-80">
                                        <Trash size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
