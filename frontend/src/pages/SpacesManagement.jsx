import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/common/NavBar";
import { Folder, Edit, Trash2, Plus, Search } from "lucide-react";
import Button from "../components/common/Button";
import AddModel from "../components/common/AddModel";
import { useTranslation } from "react-i18next";
import ThemeContext from "../context/ThemeContext";
import UserCircle from "../components/common/UserCircle";
import ContentSearchBar from "../components/common/ContentSearchBar";

export default function SpacesPage() {
  const { t, i18n } = useTranslation("space");
  const { toggleDarkMode } = useContext(ThemeContext);
  
  // États pour la responsivité
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newSpace, setNewSpace] = useState({
    title: "",
    description: "",
  });

  const [spaces, setSpaces] = useState([
    { id: 1, title: "C Beginners Hub", description: "Space for newcomers to C programming" },
    { id: 2, title: "Algorithm Masters", description: "Advanced algorithm discussions" },
    { id: 3, title: "Code Review Corner", description: "Get your C code reviewed" },
    { id: 4, title: "Data Structures Lab", description: "Hands-on data structure projects" },
    { id: 5, title: "Competitive Programming", description: "Practice and compete together" },
    { id: 6, title: "Memory Management", description: "Deep dive into C memory concepts" },
  ]);

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

  const filteredSpaces = spaces.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const fields = [
    { label: t("title"), placeholder: "Ex: Algorithm Masters", value: newSpace.title, onChange: (e) => setNewSpace({ ...newSpace, title: e.target.value }) },
    { label: t("subtitle"), placeholder: "Describe your space...", value: newSpace.description, onChange: (e) => setNewSpace({ ...newSpace, description: e.target.value }) },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = [...spaces];
      updated[editIndex] = { id: spaces[editIndex].id, ...newSpace };
      setSpaces(updated);
      setEditIndex(null);
    } else {
      const newId = spaces.length + 1;
      setSpaces([...spaces, { id: newId, ...newSpace }]);
    }
    setOpenModal(false);
    setNewSpace({ title: "", description: "" });
  };

  const handleDelete = (index) => {
    const updated = spaces.filter((_, i) => i !== index);
    setSpaces(updated);
  };

  const handleEdit = (index) => {
    const space = spaces[index];
    setNewSpace({
      title: space.title,
      description: space.description,
    });
    setEditIndex(index);
    setOpenModal(true);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-muted">{t("title")}</h1>
            <p className="text-gray">{t("subtitle")}</p>
          </div>

          <div className="flex gap-4 items-center">
            <Button
              text={
                <span className="flex items-center gap-2">
                  <Plus size={18} />
                  {t("addSpace")}
                </span>
              }
              variant="primary"
              className="!w-auto px-6 py-2 rounded-xl"
              onClick={() => {
                setEditIndex(null);
                setNewSpace({ title: "", description: "" });
                setOpenModal(true);
              }}
            />
           
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-6 sm:mb-10 w-full max-w-md">
          <ContentSearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="w-full"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space, index) => (
            <div
              key={space.id}
              className="bg-card border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between h-full"
            >
              {/* Header with Folder icon */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-muted/20 flex items-center justify-center flex-shrink-0">
                  <Folder className="w-6 h-6 text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-muted truncate">{space.title}</h2>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{space.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 ">
                <button 
                  className="text-muted hover:text-primary transition"
                  onClick={() => handleEdit(index)}
                  title={t("edit")}
                >
                  <Edit size={18} />
                </button>
                <button 
                  className="text-red hover:text-red transition"
                  onClick={() => handleDelete(index)}
                  title={t("delete")}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSpaces.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">{t("noSpacesFound")}</p>
          </div>
        )}
      </main>

      {/* Modal */}
      <AddModel
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editIndex !== null ? t("editSpace") : t("modalTitle")}
        subtitle={editIndex !== null ? t("editSubtitle") : t("modalSubtitle")}
        fields={fields}
        submitLabel={editIndex !== null ? t("update") : t("create")}
        cancelLabel={t("cancel")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}