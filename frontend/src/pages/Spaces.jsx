import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiTrash2 } from "react-icons/fi";
import ThemeContext from "../context/ThemeContext";
import Navbar from "../components/common/Navbar";
import Cards2 from "../components/common/Cards2";
import Button from "../components/common/Button";
import AddModal from "../components/common/AddModel";
import UserCircle from "../components/common/UserCircle";
import NotificationBell from "../components/common/NotificationBell";
import { Folder } from "lucide-react";

import { getSpaces, createSpace, deleteSpace } from "../services/spacesService";
import { getMySpaces } from "../services/studentSpacesService";
import toast from "react-hot-toast";

export default function SpacesPage() {
  const { t } = useTranslation("Spaces");
  const { toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  /* ====== RESPONSIVE ====== */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    const handleSidebarChange = (e) => setSidebarCollapsed(e.detail);

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebarChanged", handleSidebarChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebarChanged", handleSidebarChange);
    };
  }, []);

  /* ====== USER ====== */
  const userData = JSON.parse(localStorage.getItem("user"));
  const role =
    (userData?.user?.role ?? userData?.role) === "enseignant"
      ? "prof"
      : "student";
  const initials = `${userData?.nom?.[0] || ""}${userData?.prenom?.[0] || ""}`.toUpperCase();

  /* ====== STATE ====== */
  const [spaces, setSpaces] = useState([]);
  const [open, setOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaceDesc, setSpaceDesc] = useState("");

  /* ====== FETCH ====== */
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const data = role === "prof" ? await getSpaces() : await getMySpaces();
        setSpaces(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSpaces();
  }, [role]);

  /* ====== ACTIONS ====== */
  const handleSubmit = async () => {
    if (!spaceName) {
      toast.error(t("spaceNameRequired"));
      return;
    }

    if (spaces.some((s) => s.nom_space.toLowerCase() === spaceName.trim().toLowerCase())) {
      toast.error(t("spaceNameExists"));
      return;
    }

    try {
      const res = await createSpace({ nom_space: spaceName, description: spaceDesc });
      setSpaces((prev) => [...prev, res]);
      toast.success(t("spaceCreated"));
      setOpen(false);
      setSpaceName("");
      setSpaceDesc("");
    } catch {
      toast.error(t("spaceCreationFailed"));
    }
  };

  const handleDeleteSpace = async (id) => {
    if (!window.confirm(t("confirmDeleteSpace"))) return;
    try {
      await deleteSpace(id);
      setSpaces((prev) => prev.filter((s) => s.id_space !== id));
      toast.success(t("spaceDeleted"));
    } catch {
      toast.error(t("spaceDeleteFailed"));
    }
  };

  const sidebarWidth = sidebarCollapsed ? 60 : 240; // Sidebar normal ou réduite

  /* ====== RENDER ====== */
  return (
    <div className="flex flex-row min-h-screen bg-surface">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-50`}>
        <Navbar />
      </div>

      {/* Main */}
      <main
        className={`flex-1 p-4 sm:p-6 pt-6 space-y-5 transition-all duration-300
          ml-${isMobile ? 16 : sidebarCollapsed ? 16 : 64}`} // Mobile = ml-16, Desktop normal
      >
        {/* Header */}
        <header className="flex justify-between items-center gap-3 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-muted truncate">
            {role === "prof" ? t("spacesTitle") : t("mySpacesTitle")}
          </h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <UserCircle
              initials={initials}
              onToggleTheme={toggleDarkMode}
              onChangeLang={(lang) => window.i18n?.changeLanguage(lang)}
            />
          </div>
        </header>

        {/* Create Space Button */}
        {role === "prof" && (
         <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6"> <Button variant="primary" className="!px-4 !py-2 !text-white !w-auto ml-auto whitespace-nowrap" onClick={() => setOpen(true)} > {t("createSpaceButton")} </Button> </div>
        )}

        {/* Grid */}
        <div
          className={`grid gap-4 ${
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
          }`}
        >
          {spaces.length > 0 ? (
            spaces.map((item) => (
              <div key={item.id_space} className="rounded-xl shadow p-3 bg-grad-3 transition hover:scale-[1.02]">
                <Cards2
                  icon={
                    <div className="w-12 h-12 flex items-center justify-center bg-grad-1 rounded-md text-white">
                      <Folder size={24} />
                    </div>
                  }
                  title={item.nom_space}
                  description={item.description}
                  showArrow
                  onArrowClick={() => navigate(`/CourseDetails/${item.id_space}`)}
                  extraActions={
                    role === "prof" && (
                      <FiTrash2
                        className="cursor-pointer text-grayc hover:text-red-500"
                        onClick={() => handleDeleteSpace(item.id_space)}
                      />
                    )
                  }
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">{role === "prof" ? t("noSpacesMessage") : t("noStudentSpaces")}</p>
          )}
        </div>

        {/* Modal */}
        {role === "prof" && (
          <AddModal
            open={open}
            onClose={() => setOpen(false)}
            title={t("modalTitle")}
            submitLabel={t("modalSubmit")}
            cancelLabel={t("modalCancel")}
            fields={[
              {
                label: t("fieldSpaceName"),
                value: spaceName,
                onChange: (e) => setSpaceName(e.target.value),
              },
              {
                label: t("fieldDescription"),
                element: (
                  <textarea
                    value={spaceDesc}
                    onChange={(e) => setSpaceDesc(e.target.value)}
                    rows={4}
                    className="w-full rounded-md px-3 py-2 bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ),
              },
            ]}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  );
}