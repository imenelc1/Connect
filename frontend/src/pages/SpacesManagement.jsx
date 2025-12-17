import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import { Folder, Edit, Trash2 } from "lucide-react";
import Button from "../components/common/Button";
import AddModel from "../components/common/AddModel";
import { useTranslation } from "react-i18next";

export default function SpacesPage() {
  const { t, i18n } = useTranslation("space");

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

  const toggleLanguage = () => {
    const newLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex">
      <Navbar />

      <main className="flex-1 p-6 ml-16 md:ml-56 transition-all duration-300 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-black flex items-center gap-2">
              {t("title")}
            </h1>
            <p className="text-gray-700">{t("subtitle")}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={toggleLanguage}
              className="!px-3 !py-1 !w-auto !h-auto text-sm"
            >
              {t("toggleLang")}
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                setEditIndex(null);
                setNewSpace({ title: "", description: "" });
                setOpenModal(true);
              }}
              className="!px-4 !py-2 !w-auto !h-auto"
            >
              {t("addSpace")}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-5xl mx-auto">
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[720px] mb-6 px-4 py-2 rounded-xl border border-surface text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pr-[300px] max-w-5xl mx-auto">
          {filteredSpaces.map((space, index) => (
            <div
              key={space.id}
              className="bg-grad-6 border border-gray-200 rounded-xl shadow-md shadow-card hover:shadow-strong transition flex flex-col justify-between p-4 w-74 h-48"
            >
              {/* Header with Folder icon */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-md bg-blue flex items-center justify-center">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-lg font-bold text-textc">{space.title}</h2>
              </div>

              {/* Description */}
              <p className="text-xs text-grayc mb-3">{space.description}</p>

              {/* Actions */}
              <div className="flex items-center justify-end text-xs text-grayc gap-4">
                <button className="hover:opacity-80" onClick={() => handleEdit(index)}>
                  <Edit size={16} className="text-blue" />
                </button>
                <button className="hover:opacity-80" onClick={() => handleDelete(index)}>
                  <Trash2 size={16} className="text-red" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
