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

    const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
useEffect(() => {
  const fetchStudents = async () => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      setError("Token JWT manquant, vous devez vous reconnecter.");
      setStudents([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/users/etudiants/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();

      if (!res.ok) {
        console.error(`Erreur HTTP ${res.status}:`, text);
        throw new Error(`Impossible de récupérer les étudiants (${res.status})`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Réponse non JSON :", text);
        throw new Error("Réponse serveur invalide");
      }

      if (!Array.isArray(data)) {
        throw new Error("Format inattendu");
      }

      setStudents(data);

    } catch (err) {
      console.error("Erreur chargement étudiants :", err);
      setError("Impossible de charger les étudiants.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  fetchStudents();
}, []);


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
 const filteredStudents = students.filter((s) =>
    `${s.nom} ${s.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

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
                            className="bg-grad-2  rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                        >
                            {/* Card header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-grad-1 text-white flex items-center justify-center text-lg font-semibold">
                                        {s.initials}
                                    </div>
                                    <div className="truncate">
                                        <h2 className="font-semibold text-lg truncate">{s.name}</h2>
                                        <p className="text-sm text-grayc truncate">{s.email}</p>
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
                            <p className="text-sm text-grayc mb-2">
                                {t("StudentsManagement.Encolled")} {s.courses}
                            </p>

                            {/* Progress */}
                            <div className="mb-2">
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                    <span>{t("StudentsManagement.Overal")}</span>
                                    <span>{s.progress}%</span>
                                </div>
                                <ProgressBar value={s.progress} />
                            </div>

                            {/* Joined */}
                            <div className="flex justify-between text-sm text-grayc mt-4">
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