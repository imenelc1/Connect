import React, { useState, useEffect, useContext } from "react";
import Button from "../components/common/Button";
import ProgressBar from "../components/ui/ProgressBar";
import Navbar from "../components/common/NavBar";
import { Trash, SquarePen, Search, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
// Navigation entre routes (React Router)
import { useNavigate } from "react-router-dom";
import ContentSearchBar from "../components/common/ContentSearchBar";

// Thème global (dark/light mode)
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";

export default function StudentsManagement() {
    // Hook pour naviguer vers d'autres pages
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("StudentsManagement");
    const { toggleDarkMode } = useContext(ThemeContext);
    const [search, setSearch] = useState("");
    
    // États
    const [createModal, setCreateModal] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const students = [
        { initials: "AM", name: "Alice Martin", email: "alice.m@email.com", courses: 5, progress: 85, joined: "Jan 2024" },
        { initials: "BJ", name: "Bob Johnson", email: "bob.j@email.com", courses: 3, progress: 62, joined: "Feb 2024" },
        { initials: "CS", name: "Carol Smith", email: "carol.s@email.com", courses: 7, progress: 91, joined: "Dec 2023" },
        { initials: "DL", name: "David Lee", email: "david.l@email.com", courses: 4, progress: 73, joined: "Mar 2024" },
        { initials: "EW", name: "Emma Wilson", email: "emma.w@email.com", courses: 6, progress: 88, joined: "Jan 2024" },
        { initials: "FB", name: "Frank Brown", email: "frank.b@email.com", courses: 2, progress: 45, joined: "Apr 2024" },
    ];

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
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

    const getGridCols = () => {
        if (windowWidth < 640) return 1;
        if (windowWidth < 1024) return 2;
        return 3;
    };

    return (
        <div className="flex flex-row md:flex-row min-h-screen bg-surface gap-16 md:gap-1">
            {/* Sidebar */}
            <div>
                <Navbar />
            </div>

            {/* Main content */}
            <main className={`
                flex-1 p-6 pt-10 space-y-5 transition-all duration-300
                ${!isMobile ? (sidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}
            `}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-muted">
                            {t("StudentsManagement.StudentsManagement")}
                        </h1>
                        <p className="text-gray">{t("StudentsManagement.view")}</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <Button
                            text={
                                <span className="flex items-center gap-2">
                                    <UserPlus size={18} />
                                    {t("StudentsManagement.buttonAdd")}
                                </span>
                            }
                            variant="primary"
                            className="!w-auto px-6 py-2 rounded-xl"
                            onClick={() => setCreateModal(true)}
                        />
                        
                    </div>
                </div>

                {/* Search bar */}
                <div className="relative mb-6 sm:mb-10 w-full max-w-md">
          <ContentSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full"
          />
        </div>

                {/* Students Grid */}
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))` }}
                >
                    {students.map((s, index) => (
                        <div
                            key={index}
                            className="bg-grad-3 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                        >
                            {/* Card header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-grad-1 text-white flex items-center justify-center text-lg font-semibold">
                                        {s.initials}
                                    </div>
                                    <div className="truncate">
                                        <h2 className="font-semibold text-lg truncate">{s.name}</h2>
                                        <p className="text-sm text-gray-500 truncate">{s.email}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 text-gray-500">
                                    <button className="text-muted hover:opacity-80">
                                        <SquarePen size={20} />
                                    </button>
                                    <button className="text-red hover:opacity-80">
                                        <Trash size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Courses */}
                            <p className="text-sm text-gray-500 mb-2">
                                {t("StudentsManagement.Encolled")} {s.courses}
                            </p>

                            {/* Progress */}
                            <div className="mb-2">
                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                    <span>{t("StudentsManagement.Overal")}</span>
                                    <span>{s.progress}%</span>
                                </div>
                                <ProgressBar value={s.progress} />
                            </div>

                            {/* Joined */}
                            <div className="flex justify-between text-sm text-gray-500 mt-4">
                                <span>{t("StudentsManagement.joined")}</span>
                                <span className="font-medium">{s.joined}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}